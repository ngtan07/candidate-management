import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { parseApplicationFormData, uploadCvToCloudinary } from "../middlewares/upload.middleware.js";
import { validateApplyJob } from "../validators/application.validator.js";
import validateRequest from "../middlewares/validate.middleware.js";
import applicationController from "../controllers/application.controller.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

router.post("/:jobId",
    authMiddleware.protect,
    authMiddleware.authorize(ROLE.CANDIDATE),
    parseApplicationFormData,
    validateApplyJob,
    validateRequest,
    uploadCvToCloudinary,
    applicationController.applyForJob
);

export default router;