import cloudinary from "../config/cloudinary.js";
import { MESSAGES } from "../constants/message.js";
import Application from "../models/Application.js";
import applicationService from "../services/application.service.js";
import AppError from "../utils/AppError.js";

const applyForJob = async (req, res, next) => {

    const cvData = req.file?.cloudinary
    let applicationCreated = false

    try {
        const applicationData = {
            applicantName: req.body.applicantName,
            applicantEmail: req.body.applicantEmail,
            applicantPhone: req.body.applicantPhone
        }

        if (!cvData) {
            throw new AppError(MESSAGES.CV_REQUIRED, 400);
        }

        const application = await applicationService.applyForJob(
            req.params.jobId,
            req.user.id,
            applicationData,
            cvData
        )

        applicationCreated = true

        return res.status(201).json({
            success: true,
            message: MESSAGES.APPLICATION_SUBMITTED,
            data: {
                applicationId: application._id,
                status: application.status,
                appliedAt: application.createdAt
            }
        });
    } catch (error) {
        if (!applicationCreated && cvData?.publicId) {
            try {
                await cloudinary.uploader.destroy(
                    cvData.publicId,
                    {
                        resource_type: "raw",
                        type: "authenticated"
                    }
                );
            } catch (cleanupError) {
                console.error(
                    "[Cloudinary Cleanup Error]",
                    cleanupError
                );
            }
        }

        next(error);

    }
}

const getMyApplications = async (req, res, next) => {
    try {
        const result = await applicationService.getMyApplications(
            req.user.id,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.APPLICATIONS_RETRIEVED,
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const getApplicationById = async (req, res, next) => {
    try {
        const application = await applicationService.getApplicationById(
            req.params.applicationId,
            req.user.id,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.APPLICATION_RETRIEVED,
            data: { application }
        });

    } catch (error) {
        next(error);
    }
};

const getApplicationsByJob = async (req, res, next) => {
    try {
        const result = await applicationService.getApplicationsByJob(
            req.user.id,
            req.params.jobId,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.JOB_APPLICATIONS_RETRIEVED,
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        const application = await applicationService.updateApplicationStatus(
            req.user.id,
            req.params.applicationId,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.APPLICATION_STATUS_UPDATED,
            data: { application }
        });

    } catch (error) {
        next(error);
    }
};

const getApplicationCv = async (req, res, next) => {
    try {
        const result = await applicationService.getApplicationCv(
            req.user.id,
            req.user.role,
            req.params.applicationId
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default {
    applyForJob,
    getMyApplications,
    getApplicationById,
    getApplicationsByJob,
    updateApplicationStatus,
    getApplicationCv
};