import cloudinary from "../config/cloudinary.js";
import { MESSAGES } from "../constants/message.js";
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

export default {
    applyForJob
}