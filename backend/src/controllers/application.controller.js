import cloudinary from "../config/cloudinary.js";
import { MESSAGES } from "../constants/message.js";
import Application from "../models/Application.js";
import applicationService from "../services/application.service.js";
import AppError from "../utils/AppError.js";
import { Readable } from "node:stream";

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
            req.params.applicationId,
            req.query.disposition === "attachment" ? "attachment" : "inline"
        );
        let upstream;
        try {
            upstream = await fetch(result.url);
            if (!upstream.ok && upstream.status === 404 && result.fallbackUrl) {
                const fallbackRes = await fetch(result.fallbackUrl);
                if (fallbackRes.ok) upstream = fallbackRes;
            }
        } catch {
            throw new AppError("CV storage is temporarily unavailable.", 502);
        }
        if (!upstream.ok || !upstream.body) {
            throw new AppError(upstream.status === 404 ? MESSAGES.CV_NOT_FOUND : "Stored CV could not be retrieved.", upstream.status === 404 ? 404 : 502);
        }
        if ((upstream.headers.get("content-type") || "").toLowerCase().includes("text/html")) {
            throw new AppError("Stored CV provider returned an invalid file response.", 502);
        }
        res.status(200);
        res.setHeader("Content-Type", result.contentType);
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Disposition", `${result.disposition}; filename*=UTF-8''${encodeURIComponent(result.fileName).replaceAll("'", "%27")}`);
        if (upstream.headers.get("content-length")) res.setHeader("Content-Length", upstream.headers.get("content-length"));
        res.setHeader("Cache-Control", "private, no-store");
        Readable.fromWeb(upstream.body).on("error", error => { console.error("CV stream failed:", error.message); res.destroy(error); }).pipe(res);
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
