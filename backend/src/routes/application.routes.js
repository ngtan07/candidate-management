import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { parseApplicationFormData, uploadCvToCloudinary } from "../middlewares/upload.middleware.js";
import { validateApplyJob, validateGetApplicationById, validateGetApplicationsByJob, validateGetMyApplications, validateUpdateApplicationStatus } from "../validators/application.validator.js";
import validateRequest from "../middlewares/validate.middleware.js";
import applicationController from "../controllers/application.controller.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

router.get("/job/:jobId",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    validateGetApplicationsByJob,
    validateRequest,
    applicationController.getApplicationsByJob
);

router.post("/:jobId",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.CANDIDATE),
    parseApplicationFormData,
    validateApplyJob,
    validateRequest,
    uploadCvToCloudinary,
    applicationController.applyForJob
);

router.get("/my-applications",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.CANDIDATE),
    validateGetMyApplications,
    validateRequest,
    applicationController.getMyApplications
);

router.get("/:applicationId",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.CANDIDATE, ROLE.RECRUITER),
    validateGetApplicationById,
    validateRequest,
    applicationController.getApplicationById
);

router.patch("/:applicationId/status",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    validateUpdateApplicationStatus,
    validateRequest,
    applicationController.updateApplicationStatus
);

router.get("/:applicationId/cv",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER, ROLE.CANDIDATE),
    applicationController.getApplicationCv
);

export default router;