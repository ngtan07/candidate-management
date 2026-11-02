import Job from "../models/Job.js";
import AppError from "./AppError.js";
import { MESSAGES } from "../constants/message.js";
import { JOB_STATUS } from "../constants/job.js";

export const findValidJob = async (jobId) => {

    const job = await Job.findOne({
        _id: jobId,
        isDeleted: false
    })

    if (!job) {
        throw new AppError(MESSAGES.JOB_NOT_FOUND, 404);
    }

    return job;
};

export const checkJobAcceptingApplications = (job) => {
    const currentDate = new Date();

    if (job.status !== JOB_STATUS.OPENING || !job.isVisible) {
        throw new AppError(MESSAGES.JOB_NOT_PUBLISHED, 400);
    }

    if (currentDate < job.applicationStartDate) {
        throw new AppError(MESSAGES.APPLICATION_NOT_STARTED, 400);
    }

    if (currentDate > job.applicationEndDate) {
        throw new AppError(MESSAGES.APPLICATION_DEADLINE_PASSED, 400);
    }
};

export const buildCandidateJobFilter = (currentDate = new Date()) => {
    return {
        status: JOB_STATUS.OPENING,
        isVisible: true,
        isDeleted: false,
        applicationStartDate: {
            $lte: currentDate
        },
        applicationEndDate: {
            $gte: currentDate
        }
    };
};