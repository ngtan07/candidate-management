import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { ROLE } from "../constants/role.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import AppError from "../utils/AppError.js";

const listRecruiters = async (query, pendingOnly = false) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const filter = { role: ROLE.RECRUITER };

    const tab = (query.tab || "").toLowerCase();

    if (pendingOnly || tab === "pending") {
        filter.registrationStatus = REGISTRATION_STATUS.PENDING;
    } else if (tab === "active") {
        filter.registrationStatus = REGISTRATION_STATUS.APPROVED;
        filter.isActive = true;
    } else if (tab === "suspended") {
        filter.isActive = false;
    } else if (query.status) {
        filter.registrationStatus = query.status;
    }

    if (query.search?.trim()) {
        const s = query.search.trim();
        filter.$or = [
            { companyName: { $regex: s, $options: "i" } },
            { email: { $regex: s, $options: "i" } },
            { fullName: { $regex: s, $options: "i" } }
        ];
    }

    const [recruiters, total, countAll, countPending, countActive, countSuspended] = await Promise.all([
        User.find(filter).select("-passwordHash")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

        User.countDocuments(filter),
        User.countDocuments({ role: ROLE.RECRUITER }),
        User.countDocuments({ role: ROLE.RECRUITER, registrationStatus: REGISTRATION_STATUS.PENDING }),
        User.countDocuments({ role: ROLE.RECRUITER, registrationStatus: REGISTRATION_STATUS.APPROVED, isActive: true }),
        User.countDocuments({ role: ROLE.RECRUITER, isActive: false })
    ]);

    return {
        recruiters,
        counts: {
            all: countAll,
            pending: countPending,
            active: countActive,
            suspended: countSuspended
        },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

const recruiterDetail = async id => {
    const recruiter = await User.findOne({ _id: id, role: ROLE.RECRUITER }).select("-passwordHash").lean();

    if (!recruiter) throw new AppError("Recruiter not found.", 404);

    const jobs = await Job.find({ recruiterId: id, isDeleted: false }).sort({ createdAt: -1 }).lean();

    return { recruiter, jobs };
};

const reviewRecruiter = async (adminId, id, status, reason = "") => {
    const recruiter = await User.findOne({ _id: id, role: ROLE.RECRUITER });
    if (!recruiter) throw new AppError("Recruiter not found.", 404);

    if (recruiter.registrationStatus !== REGISTRATION_STATUS.PENDING) throw new AppError("Only pending registrations can be reviewed.", 400);
    if (![REGISTRATION_STATUS.APPROVED, REGISTRATION_STATUS.REJECTED].includes(status)) throw new AppError("Invalid registration decision.", 400);
    if (status === REGISTRATION_STATUS.REJECTED && !reason.trim()) throw new AppError("A rejection reason is required.", 400);

    recruiter.registrationStatus = status;
    recruiter.rejectionReason = status === REGISTRATION_STATUS.REJECTED ? reason.trim() : null;
    recruiter.reviewedBy = adminId;
    recruiter.reviewedAt = new Date();

    await recruiter.save();

    return {
        id: recruiter._id,
        registrationStatus: recruiter.registrationStatus,
        rejectionReason: recruiter.rejectionReason
    };
};

const setRecruiterActive = async (id, isActive) => {
    const recruiter = await User.findOneAndUpdate(
        { _id: id, role: ROLE.RECRUITER },
        { isActive },
        { new: true }).select("_id isActive fullName companyName email");

    if (!recruiter) throw new AppError("Recruiter not found.", 404);
    return recruiter;
};

const listJobs = async query => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const filter = { isDeleted: false };
    if (query.search?.trim()) {
        filter.title = { $regex: query.search.trim(), $options: "i" };
    }
    if (query.status) filter.status = query.status;

    const [jobs, total] = await Promise.all([
        Job.find(filter)
            .populate("recruiterId", "companyName email fullName phone")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Job.countDocuments(filter)
    ]);

    // Attach application counts per job
    const jobIds = jobs.map(j => j._id);

    const counts = await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: "$jobId", count: { $sum: 1 } } }
    ]);

    const countMap = {};

    counts.forEach(c => { countMap[c._id.toString()] = c.count; });
    const jobsWithCounts = jobs.map(j => ({
        ...j,
        applicationCount: countMap[j._id.toString()] || 0
    }));

    return {
        jobs: jobsWithCounts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const setJobVisibility = async (id, isVisible) => {
    const job = await Job.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isVisible },
        { new: true });

    if (!job) throw new AppError("Job not found.", 404);
    return job;
};

export default {
    listRecruiters,
    recruiterDetail,
    reviewRecruiter,
    setRecruiterActive,
    listJobs,
    setJobVisibility
};
