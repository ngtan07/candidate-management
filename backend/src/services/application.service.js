import { checkJobAcceptingApplications, findValidJob } from "../utils/job.helper.js";
import Application from '../models/Application.js'
import { MESSAGES } from "../constants/message.js";
import { APPLICATION_STATUS } from "../constants/application.js";
import AppError from "../utils/AppError.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import { ROLE } from "../constants/role.js";
import cloudinary from "../config/cloudinary.js";

const applyForJob = async (jobId, candidateId, applicationData, cvData) => {

    // check job exist and allow apply
    const job = await findValidJob(jobId)
    checkJobAcceptingApplications(job)

    // check double application 
    const existingApplication = await Application.findOne({
        candidateId,
        jobId
    })

    if (existingApplication) {
        throw new AppError(MESSAGES.ALREADY_APPLIED, 409)
    }

    // check info cv
    if (!cvData?.url || !cvData?.publicId || !cvData?.fileName) {
        throw new AppError(MESSAGES.CV_REQUIRED, 400);
    }

    //create application
    try {
        const application = await Application.create({
            candidateId,
            jobId,

            applicantName: applicationData.applicantName,
            applicantEmail: applicationData.applicantEmail,
            applicantPhone: applicationData.applicantPhone || null,

            cv: {
                url: cvData.url,
                publicId: cvData.publicId,
                fileName: cvData.fileName
            },

            status: APPLICATION_STATUS.APPLIED,
            statusUpdatedAt: new Date()
        });

        return application;

    } catch (error) {
        if (error.code === 11000) {
            throw new AppError(MESSAGES.ALREADY_APPLIED, 409);
        }
        throw error;
    }
}

const getMyApplications = async (candidateId, query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

    const filter = { candidateId };

    if (query.status) {
        filter.status = query.status;
    }

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .select(
                "jobId applicantName cv.fileName status statusUpdatedAt createdAt"
            )
            .populate({
                path: "jobId",
                select: [
                    "title",
                    "category",
                    "employmentType",
                    "experienceLevel",
                    "workLocationType",
                    "location",
                    "salaryMin",
                    "salaryMax",
                    "salaryCurrency",
                    "salaryPeriod",
                    "recruiterId"
                ].join(" "),
                populate: {
                    path: "recruiterId",
                    select: "companyName"
                }
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

        Application.countDocuments(filter)
    ]);

    return {
        applications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getApplicationById = async (applicationId, userId, userRole) => {

    const application = await Application.findById(applicationId)
        .select("-cv.url -cv.publicId")
        .populate({
            path: "jobId",
            select: "title description category employmentType experienceLevel workLocationType location salaryMin salaryMax salaryCurrency salaryPeriod numberOfPositions applicationStartDate applicationEndDate recruiterId status",
            populate: {
                path: "recruiterId",
                select: "companyName"
            }
        })
        .lean();

    if (!application) {
        throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
    }

    if (userRole === ROLE.CANDIDATE) {
        if (application.candidateId.toString() !== userId.toString()) {
            throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
        }
    }

    else if (userRole === ROLE.RECRUITER) {

        const recruiter = await User.findById(userId)
            .select("registrationStatus");

        if (
            !recruiter ||
            recruiter.registrationStatus !== REGISTRATION_STATUS.APPROVED
        ) {
            throw new AppError(MESSAGES.RECRUITER_NOT_APPROVED, 403);
        }

        const jobRecruiterId = application.jobId?.recruiterId?._id;

        if (!jobRecruiterId || jobRecruiterId.toString() !== userId.toString()) {
            throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
        }
    }

    else {
        throw new AppError(MESSAGES.FORBIDDEN, 403);
    }

    return application;
};

const getApplicationsByJob = async (recruiterId, jobId, query) => {

    const recruiter = await User.findById(recruiterId)
        .select("registrationStatus");

    if (
        !recruiter ||
        recruiter.registrationStatus !== REGISTRATION_STATUS.APPROVED
    ) {
        throw new AppError(MESSAGES.RECRUITER_NOT_APPROVED, 403);
    }

    const job = await Job.findOne({
        _id: jobId,
        recruiterId,
        isDeleted: false
    });

    if (!job) {
        throw new AppError(MESSAGES.JOB_NOT_FOUND, 404);
    }

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

    const filter = {
        jobId
    };

    if (query.status) {
        filter.status = query.status;
    }

    if (query.search && query.search.trim()) {
        const kw = query.search.trim();
        filter.$or = [
            { applicantName: { $regex: kw, $options: 'i' } },
            { applicantEmail: { $regex: kw, $options: 'i' } }
        ];
    }

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .select(
                "candidateId applicantName applicantEmail applicantPhone cv.fileName status statusUpdatedAt createdAt"
            )
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

        Application.countDocuments(filter)
    ]);

    return {
        job: {
            _id: job._id,
            title: job.title
        },
        applications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateApplicationStatus = async (recruiterId, applicationId, newStatus) => {

    const recruiter = await User.findById(recruiterId)
        .select("role isActive registrationStatus");

    if (!recruiter || recruiter.role !== ROLE.RECRUITER) {
        throw new AppError(MESSAGES.FORBIDDEN, 403);
    }

    if (!recruiter.isActive) {
        throw new AppError(MESSAGES.ACCOUNT_INACTIVE, 403);
    }

    if (recruiter.registrationStatus !== REGISTRATION_STATUS.APPROVED) {
        throw new AppError(MESSAGES.RECRUITER_NOT_APPROVED, 403);
    }


    const application = await Application.findById(applicationId)
        .populate({
            path: "jobId",
            select: "recruiterId"
        });

    if (!application || !application.jobId) {
        throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
    }

    if (application.jobId.recruiterId.toString() !== recruiterId.toString()) {
        throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
    }

    const allowedTransitions = {
        [APPLICATION_STATUS.APPLIED]: [
            APPLICATION_STATUS.PASSED_CV,
            APPLICATION_STATUS.REJECTED_CV
        ],

        [APPLICATION_STATUS.PASSED_CV]: [
            APPLICATION_STATUS.WAITING_INTERVIEW
        ],

        [APPLICATION_STATUS.WAITING_INTERVIEW]: [
            APPLICATION_STATUS.INTERVIEWED
        ],

        [APPLICATION_STATUS.INTERVIEWED]: [
            APPLICATION_STATUS.PASSED,
            APPLICATION_STATUS.REJECTED_INTERVIEW
        ],

        [APPLICATION_STATUS.REJECTED_CV]: [],
        [APPLICATION_STATUS.PASSED]: [],
        [APPLICATION_STATUS.REJECTED_INTERVIEW]: []
    };

    const currentStatus = application.status;
    const validNextStatuses = allowedTransitions[currentStatus] || [];

    if (!validNextStatuses.includes(newStatus)) {
        throw new AppError(
            MESSAGES.APPLICATION_STATUS_TRANSITION_INVALID,
            400
        );
    }

    application.status = newStatus;
    application.statusUpdatedAt = new Date();

    await application.save();

    return {
        _id: application._id,
        status: application.status,
        statusUpdatedAt: application.statusUpdatedAt
    };
};

const getApplicationCv = async (userId, userRole, applicationId) => {
    const application = await Application.findById(applicationId)
        .populate({
            path: "jobId",
            select: "recruiterId"
        });

    if (!application || !application.jobId) {
        throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
    }

    if (userRole === ROLE.CANDIDATE) {
        if (application.candidateId.toString() !== userId.toString()) {
            throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
        }
    } else if (userRole === ROLE.RECRUITER) {
        if (
            application.jobId.recruiterId.toString() !== userId.toString()
        ) {
            throw new AppError(MESSAGES.APPLICATION_NOT_FOUND, 404);
        }
    } else {
        throw new AppError(MESSAGES.FORBIDDEN, 403);
    }

    if (!application.cv?.publicId || !application.cv?.fileName) {
        throw new AppError(MESSAGES.CV_NOT_FOUND, 404);
    }

    const extension = application.cv.fileName.split(".").pop().toLowerCase();

    const publicId = application.cv.publicId.replace(
        new RegExp(`\\.${extension}$`, "i"),
        ""
    );

    const url = cloudinary.utils.private_download_url(
        publicId,
        extension,
        {
            resource_type: "raw",
            type: "authenticated",
            expires_at: Math.floor(Date.now() / 1000) + 300,
            attachment: false
        }
    );

    return {
        fileName: application.cv.fileName,
        url
    };
};
export default {
    applyForJob,
    getMyApplications,
    getApplicationById,
    getApplicationsByJob,
    updateApplicationStatus,
    getApplicationCv
}