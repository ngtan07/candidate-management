import express from "express";
import { param, body } from "express-validator";
import authMiddleware from "../middlewares/auth.middleware.js";
import { ROLE } from "../constants/role.js";
import validateRequest from "../middlewares/validate.middleware.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();
router.use(authMiddleware.protect, authMiddleware.authorize(ROLE.ADMIN));

router.get("/recruiters/pending", adminController.getPendingRecruiters);
router.get("/recruiters", adminController.getAllRecruiters);

router.get("/recruiters/:id",
    param("id").isMongoId(),
    validateRequest,
    adminController.getRecruiterById);

router.patch("/recruiters/:id/review",
    param("id").isMongoId(),
    body("status").isIn(["APPROVED", "REJECTED"]),
    body("reason").optional().isString(),
    validateRequest,
    adminController.reviewRecruiter);

router.patch("/recruiters/:id/suspend",
    param("id").isMongoId(),
    validateRequest,
    adminController.suspendRecruiter);

router.patch("/recruiters/:id/reactivate",
    param("id").isMongoId(),
    validateRequest,
    adminController.reactivateRecruiter);

router.get("/jobs", adminController.getAllJobs);

router.patch("/jobs/:id/hide",
    param("id").isMongoId(),
    validateRequest,
    adminController.hideJob);

router.patch("/jobs/:id/restore",
    param("id").isMongoId(),
    validateRequest,
    adminController.restoreJob);
export default router;
