import Job from "../models/Job.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { MESSAGES } from "../constants/message.js";
import { ROLE } from "../constants/role.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import { JOB_STATUS } from "../constants/job.js";
import { buildCandidateJobFilter } from "../utils/job.helper.js";


// recruiter
const checkApprovedRecruiter = async (recruiterId) => {
    const recruiter = await User.findById(recruiterId)

    if (!recruiter || recruiter.role !== ROLE.RECRUITER) {
        throw new AppError(MESSAGES.FORBIDDEN, 403)
    }

    if (!recruiter.isActive) {
        throw new AppError(MESSAGES.ACCOUNT_INACTIVE, 403)
    }

    if (recruiter.registrationStatus !== REGISTRATION_STATUS.APPROVED) {
        throw new AppError(MESSAGES.RECRUITER_NOT_APPROVED, 403)
    }

    return recruiter
}

const createJob = async (recruiterId, jobData, initialStatus) => {
    await checkApprovedRecruiter(recruiterId)

    const allowedStatuses = [
        JOB_STATUS.DRAFT,
        JOB_STATUS.OPENING
    ]

    if (!allowedStatuses.includes(initialStatus)) {
        throw new AppError(MESSAGES.JOB_STATUS_INVALID, 400);
    }

    const job = await Job.create({
        ...jobData,
        recruiterId,
        status: initialStatus,
        isVisible: true,
        isDeleted: false
    })

    return job
}

const getMyJobs = async (recruiterId, query) => {
    await checkApprovedRecruiter(recruiterId)

    const page = Math.max(Number(query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100)

    const filter = {
        recruiterId,
        isDeleted: false
    }

    if (query.status) {
        filter.status = query.status;
    }

    const [jobs, total] = await Promise.all([
        Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),

        Job.countDocuments(filter)
    ]);

    return {
        jobs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const findRecruiterJob = async (jobId, recruiterId) => {
    await checkApprovedRecruiter(recruiterId)

    const job = await Job.findOne({
        _id: jobId,
        recruiterId,
        isDeleted: false
    });

    if (!job) {
        throw new AppError(MESSAGES.JOB_NOT_FOUND, 404);
    }

    return job;
}

const getMyJobById = async (jobId, recruiterId) => {
    return await findRecruiterJob(jobId, recruiterId);
}

const publishJob = async (jobId, recruiterId) => {

    const job = await findRecruiterJob(jobId, recruiterId);

    if (job.status !== JOB_STATUS.DRAFT) {
        throw new AppError(MESSAGES.CANNOT_PUBLISH_JOB, 400)
    }

    job.status = JOB_STATUS.OPENING
    await job.save()
    return job
};

const updateJob = async (jobId, recruiterId, updateData) => {
    const job = await findRecruiterJob(jobId, recruiterId);

    if (job.status !== JOB_STATUS.DRAFT) {
        throw new AppError(MESSAGES.CANNOT_UPDATE_JOB, 400)
    }

    const allowedFields = [
        "title",
        "description",
        "category",
        "employmentType",
        "experienceLevel",
        "workLocationType",
        "location",
        "salaryMin",
        "salaryMax",
        "salaryCurrency",
        "salaryPeriod",
        "numberOfPositions",
        "applicationStartDate",
        "applicationEndDate"
    ];

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            job[field] = updateData[field];
        }
    });

    await job.save();
    return job;
}

const closeJob = async (jobId, recruiterId) => {
    const job = await findRecruiterJob(jobId, recruiterId);

    if (job.status !== JOB_STATUS.OPENING) {
        throw new AppError(
            MESSAGES.CANNOT_CLOSE_JOB,
            400
        );
    }

    job.status = JOB_STATUS.CLOSED;

    await job.save();
    return job;
}

const deleteJob = async (jobId, recruiterId) => {
    const job = await findRecruiterJob(jobId, recruiterId);

    job.isDeleted = true;

    await job.save();
    return job;
}

// candidate
const getAllJobs = async (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

    const currentDate = new Date()
    const filter = {
        status: JOB_STATUS.OPENING,
        isVisible: true,
        isDeleted: false,
        applicationStartDate: {
            $lte: currentDate
        },
        applicationEndDate: {
            $gte: currentDate
        }
    }

    // const filter = buildCandidateJobFilter();

    const [jobs, total] = await Promise.all([
        Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),

        Job.countDocuments(filter)
    ]);

    return {
        jobs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};




export default {
    createJob,
    getMyJobs,
    getMyJobById,
    updateJob,
    publishJob,
    closeJob,
    deleteJob,
    getAllJobs
};