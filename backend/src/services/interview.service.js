import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import { APPLICATION_STATUS } from "../constants/application.js";
import { INTERVIEW_TYPE } from "../constants/interview.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import EmailLog from "../models/EmailLog.js";
import { EMAIL_TYPE, EMAIL_STATUS } from "../constants/email.js";
import emailService from "./email.service.js";
import AppError from "../utils/AppError.js";

const recruiterReady = async (id) => {
    const user = await User.findById(id).select("role isActive registrationStatus");
    if (!user || user.role !== "RECRUITER" || !user.isActive) throw new AppError("Recruiter account is unavailable.", 403);
    if (user.registrationStatus !== REGISTRATION_STATUS.APPROVED) throw new AppError("Recruiter registration is not approved.", 403);
};

const ownedApplication = async (recruiterId, applicationId) => {
    const app = await Application.findById(applicationId).populate({ path: "jobId", select: "recruiterId title" });
    if (!app || app.jobId?.recruiterId?.toString() !== recruiterId.toString()) throw new AppError("Application not found.", 404);
    return app;
};

const setInterview = async (recruiterId, applicationId, data) => {
    await recruiterReady(recruiterId);
    const app = await ownedApplication(recruiterId, applicationId);
    if (app.status !== APPLICATION_STATUS.PASSED_CV) throw new AppError("Only unscheduled candidates who passed CV screening can be scheduled.", 400);
    if (await Interview.exists({ applicationId })) throw new AppError("This candidate already has an interview scheduled.", 409);
    if (new Date(data.endTime) <= new Date(data.startTime)) throw new AppError("End time must be after start time.", 400);
    if (new Date(data.startTime) <= new Date()) throw new AppError("Interview must be scheduled in the future.", 400);
    if (data.interviewType === INTERVIEW_TYPE.ONLINE) {
        try { const meeting = new URL(data.meetingUrl); if (!["http:", "https:"].includes(meeting.protocol)) throw new Error(); }
        catch { throw new AppError("A valid meeting URL is required.", 400); }
    }
    if (data.interviewType === INTERVIEW_TYPE.ONSITE && !data.officeAddress?.trim()) throw new AppError("An office address is required.", 400);
    const transitioned = await Application.updateOne(
        { _id: applicationId, status: APPLICATION_STATUS.PASSED_CV },
        { $set: { status: APPLICATION_STATUS.WAITING_INTERVIEW, statusUpdatedAt: new Date() } }
    );
    if (transitioned.modifiedCount !== 1) throw new AppError("Application status changed. Reload candidates and try again.", 409);
    let interview;
    try {
        interview = await Interview.create({ ...data, applicationId });
    } catch (error) {
        await Application.updateOne({ _id: applicationId, status: APPLICATION_STATUS.WAITING_INTERVIEW }, { $set: { status: APPLICATION_STATUS.PASSED_CV, statusUpdatedAt: new Date() } });
        if (error.code === 11000) throw new AppError("This candidate already has an interview scheduled.", 409);
        throw error;
    }
    return interview;
};

const bulkSetInterviews = async (recruiterId, applicationIds, data) => {
    await recruiterReady(recruiterId);
    if (!Array.isArray(applicationIds) || !applicationIds.length || applicationIds.length > 100) throw new AppError("Select between 1 and 100 applications.", 400);
    if (new Set(applicationIds.map(String)).size !== applicationIds.length) throw new AppError("Duplicate application IDs are not allowed.", 400);
    const results = { scheduled: [], failed: [] };
    for (const applicationId of applicationIds) {
        try { results.scheduled.push({ applicationId, interview: await setInterview(recruiterId, applicationId, data) }); }
        catch (error) { results.failed.push({ applicationId, message: error.message || "Scheduling failed." }); }
    }
    return results;
};

const listInterviews = async (recruiterId, from, to) => {
    await recruiterReady(recruiterId);
    const query = {};
    if (from || to) query.startTime = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lt: new Date(to) } : {}) };
    const interviews = await Interview.find(query).populate({ path: "applicationId", match: {}, populate: [{ path: "jobId", match: { recruiterId }, select: "title recruiterId" }, { path: "candidateId", select: "fullName email" }] }).sort({ startTime: 1 }).lean();
    return interviews.filter(i => i.applicationId?.jobId);
};

const detail = async (recruiterId, interviewId) => {
    await recruiterReady(recruiterId);
    const interview = await Interview.findById(interviewId).populate({ path: "applicationId", populate: [{ path: "jobId", select: "title recruiterId" }, { path: "candidateId", select: "fullName email phone" }] }).lean();
    if (!interview || interview.applicationId?.jobId?.recruiterId?.toString() !== recruiterId.toString()) throw new AppError("Interview not found.", 404);
    return interview;
};

const updateNotes = async (recruiterId, interviewId, notes) => {
    await recruiterReady(recruiterId);
    const interview = await Interview.findById(interviewId).populate({ path: "applicationId", populate: { path: "jobId", select: "recruiterId" } });
    if (!interview || interview.applicationId?.jobId?.recruiterId?.toString() !== recruiterId.toString()) throw new AppError("Interview not found.", 404);
    interview.notes = notes;
    await interview.save();
    return { id: interview._id, notes: interview.notes };
};

const passedCandidates = async (recruiterId) => {
    await recruiterReady(recruiterId);
    return Application.find({ status: APPLICATION_STATUS.PASSED }).populate({ path: "jobId", match: { recruiterId }, select: "title" }).populate("candidateId", "fullName email").lean().then(items => items.filter(x => x.jobId));
};

const sendCandidateEmail = async (recruiterId, applicationId, type, subject, body) => {
    await recruiterReady(recruiterId);
    const app = await ownedApplication(recruiterId, applicationId);
    const candidate = await User.findById(app.candidateId).select("email fullName");
    const job = app.jobId;
    const interview = await Interview.findOne({ applicationId });
    if (type === EMAIL_TYPE.INTERVIEW_INVITATION && (!interview || app.status !== APPLICATION_STATUS.WAITING_INTERVIEW)) throw new AppError("Schedule the interview before sending an invitation.", 400);
    if ([EMAIL_TYPE.INTERVIEW_PASSED, EMAIL_TYPE.INTERVIEW_REJECTED].includes(type) && ![APPLICATION_STATUS.PASSED, APPLICATION_STATUS.REJECTED_INTERVIEW].includes(app.status)) throw new AppError("Record the interview result before emailing the candidate.", 400);
    const alreadySent = await EmailLog.findOne({ applicationId, emailType: type, status: EMAIL_STATUS.SENT });
    if (alreadySent) throw new AppError("This email was already sent for the application.", 409);
    const company = (await User.findById(recruiterId).select("companyName")).companyName || "TalentPulse";
    const defaultBody = type === EMAIL_TYPE.INTERVIEW_INVITATION
        ? `Hello {{candidateName}},\n\nYou are invited to interview for {{jobTitle}} at {{companyName}}.\nDate and time: {{interviewTime}}\nFormat: {{interviewFormat}}\n{{interviewLocation}}\n\nRegards, TalentPulse`
        : `Hello {{candidateName}},\n\nYour interview result for {{jobTitle}} at {{companyName}} is {{result}}.\n\nRegards, TalentPulse`;
    const templateBody = (body || defaultBody)
        .replaceAll("{{candidateName}}", app.applicantName)
        .replaceAll("{{jobTitle}}", job.title)
        .replaceAll("{{companyName}}", company)
        .replaceAll("{{interviewTime}}", interview ? `${interview.startTime.toISOString()} – ${interview.endTime.toISOString()}` : "")
        .replaceAll("{{interviewFormat}}", interview?.interviewType || "")
        .replaceAll("{{interviewLocation}}", interview?.meetingUrl || interview?.officeAddress || "")
        .replaceAll("{{result}}", app.status);
    const log = await EmailLog.create({ senderId: recruiterId, applicationId, emailType: type, recipientEmail: candidate.email, subject, body: templateBody, status: EMAIL_STATUS.FAILED });
    try {
        await emailService.sendEmail({ to: candidate.email, subject, text: templateBody });
        log.status = EMAIL_STATUS.SENT; log.sentAt = new Date(); await log.save();
    } catch (error) {
        log.errorMessage = error.message; await log.save(); throw new AppError(`Email delivery failed: ${error.message}`, 502);
    }
    return log;
};


const getByApplication = async (recruiterId, applicationId) => {
    await recruiterReady(recruiterId);
    const app = await ownedApplication(recruiterId, applicationId);
    const interview = await Interview.findOne({ applicationId }).lean();
    return { application: app, interview };
};

const evaluate = async (recruiterId, applicationId, notes) => {
    await recruiterReady(recruiterId);
    const app = await ownedApplication(recruiterId, applicationId);
    let interview = await Interview.findOne({ applicationId });
    if (!interview) {
        throw new AppError("Interview record not found for this candidate.", 404);
    }
    interview.notes = notes || "";
    await interview.save();

    if (app.status === APPLICATION_STATUS.WAITING_INTERVIEW) {
        app.status = APPLICATION_STATUS.INTERVIEWED;
        app.statusUpdatedAt = new Date();
        await app.save();
    }

    return { interview, application: app };
};

export default { getByApplication, evaluate, setInterview, bulkSetInterviews, listInterviews, detail, updateNotes, passedCandidates, sendCandidateEmail };
