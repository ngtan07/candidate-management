import jobService from "../services/job.service.js";
import { MESSAGES } from "../constants/message.js";

const createJob = async (req, res, next) => {
    try {
        const { status, ...jobData } = req.body;

        const job = await jobService.createJob(
            req.user.id,
            jobData,
            status
        );

        return res.status(201).json({
            success: true,
            message: MESSAGES.JOB_CREATED,
            data: { job }
        });
    } catch (error) {
        next(error);
    }
};

const getMyJobs = async (req, res, next) => {
    try {
        const result = await jobService.getMyJobs(
            req.user.id,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOBS_RETRIEVED,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

const getMyJobById = async (req, res, next) => {
    try {
        const job = await jobService.getMyJobById(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOB_RETRIEVED,
            data: { job }
        });
    } catch (error) {
        next(error);
    }
}

const updateJob = async (req, res, next) => {
    try {
        const job = await jobService.updateJob(
            req.params.id,
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOB_UPDATED,
            data: { job }
        });
    } catch (error) {
        next(error);
    }
};

const publishJob = async (req, res, next) => {
    try {
        const job = await jobService.publishJob(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOB_PUBLISHED,
            data: {
                jobId: job._id,
                status: job.status
            }
        });
    } catch (error) {
        next(error);
    }
}

const closeJob = async (req, res, next) => {
    try {
        const job = await jobService.closeJob(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOB_CLOSED,
            data: {
                jobId: job._id,
                status: job.status
            }
        });
    } catch (error) {
        next(error);
    }
}

const deleteJob = async (req, res, next) => {
    try {
        await jobService.deleteJob(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOB_DELETED
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createJob,
    getMyJobs,
    getMyJobById,
    updateJob,
    publishJob,
    closeJob,
    deleteJob
};