import adminService from "../services/admin.service.js";

const getPendingRecruiters = async (req, res, next) => {
    try {
        const recruiters = await adminService.listRecruiters(
            req.query,
            true
        );

        return res.status(200).json({
            success: true,
            data: recruiters
        });
    } catch (error) {
        next(error);
    }
};

const getAllRecruiters = async (req, res, next) => {
    try {
        const recruiters = await adminService.listRecruiters(req.query);

        return res.status(200).json({
            success: true,
            data: recruiters
        });
    } catch (error) {
        next(error);
    }
};

const getRecruiterById = async (req, res, next) => {
    try {
        const recruiter = await adminService.recruiterDetail(req.params.id);

        return res.status(200).json({
            success: true,
            data: recruiter
        });
    } catch (error) {
        next(error);
    }
};

const reviewRecruiter = async (req, res, next) => {
    try {
        const recruiter = await adminService.reviewRecruiter(
            req.user.id,
            req.params.id,
            req.body.status,
            req.body.reason || ""
        );

        return res.status(200).json({
            success: true,
            data: recruiter
        });
    } catch (error) {
        next(error);
    }
};

const suspendRecruiter = async (req, res, next) => {
    try {
        const recruiter = await adminService.setRecruiterActive(
            req.params.id,
            false
        );

        return res.status(200).json({
            success: true,
            data: recruiter
        });
    } catch (error) {
        next(error);
    }
};

const reactivateRecruiter = async (req, res, next) => {
    try {
        const recruiter = await adminService.setRecruiterActive(
            req.params.id,
            true
        );

        return res.status(200).json({
            success: true,
            data: recruiter
        });
    } catch (error) {
        next(error);
    }
};

const getAllJobs = async (req, res, next) => {
    try {
        const jobs = await adminService.listJobs(req.query);

        return res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        next(error);
    }
};

const hideJob = async (req, res, next) => {
    try {
        const job = await adminService.setJobVisibility(
            req.params.id,
            false
        );

        return res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

const restoreJob = async (req, res, next) => {
    try {
        const job = await adminService.setJobVisibility(
            req.params.id,
            true
        );

        return res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getPendingRecruiters,
    getAllRecruiters,
    getRecruiterById,
    reviewRecruiter,
    suspendRecruiter,
    reactivateRecruiter,
    getAllJobs,
    hideJob,
    restoreJob
};