import express from "express";

import jobController from "../controllers/job.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    validateCreateJob,
    validateGetAllJobs,
    validateGetJobById,
    validateUpdateJob
} from "../validators/job.validator.js";
import validateRequest from "../middlewares/validate.middleware.js";

import { ROLE } from "../constants/role.js";

const router = express.Router();

// Candidate / Public routes
router.get(
    "/",
    validateGetAllJobs,
    validateRequest,
    jobController.getAllJobs
);

// Recruiter routes
router.get(
    "/my-jobs",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    jobController.getMyJobs
);

router.get(
    "/my-jobs/:id",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    jobController.getMyJobById
);

router.post(
    "/",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    validateCreateJob,
    validateRequest,
    jobController.createJob
);

router.patch(
    "/:id",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    validateUpdateJob,
    validateRequest,
    jobController.updateJob
);

router.patch(
    "/:id/publish",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    jobController.publishJob
);

router.patch(
    "/:id/close",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    jobController.closeJob
);

router.delete(
    "/:id",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER),
    jobController.deleteJob
);

// Candidate / Public job detail
router.get(
    "/:jobId",
    validateGetJobById,
    validateRequest,
    jobController.getJobById
);

export default router;