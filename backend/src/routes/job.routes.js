import express from "express";

import jobController from "../controllers/job.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    validateCreateJob,
    validateUpdateJob
} from "../validators/job.validator.js";
import validateRequest from "../middlewares/validate.middleware.js";

import { ROLE } from "../constants/role.js";

const router = express.Router();

router.use(
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.RECRUITER)
)

router.post(
    "/",
    validateCreateJob,
    validateRequest,
    jobController.createJob
)

router.get(
    "/my-jobs",
    jobController.getMyJobs
)

router.get(
    "/:id",
    jobController.getMyJobById
)

router.patch(
    "/:id",
    validateUpdateJob,
    validateRequest,
    jobController.updateJob
)

router.patch(
    "/:id/publish",
    jobController.publishJob
)

router.patch(
    "/:id/close",
    jobController.closeJob
)

router.delete(
    "/:id",
    jobController.deleteJob
)

export default router;