
import express from "express";

import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validate.middleware.js";
import {
    validateCandidateRegister,
    validateRecruiterRegister,
    validateLogin
} from "../validators/auth.validator.js";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";

const router = express.Router();
const passwordResetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

// Public routes
router.post("/register/candidate",
    validateCandidateRegister,
    validateRequest,
    authController.registerCandidate
)
router.post("/register/recruiter",
    validateRecruiterRegister,
    validateRequest,
    authController.registerRecruiter
)
router.post("/login",
    validateLogin,
    validateRequest,
    authController.login
)
router.post("/forgot-password", passwordResetLimiter,
    body("email").trim().isEmail().withMessage("A valid email is required."),
    validateRequest,
    authController.requestPasswordReset
);
router.post("/reset-password", passwordResetLimiter,
    body("token").isString().notEmpty(),
    body("password").isLength({ min: 8, max: 72 }).withMessage("Password must be 8 to 72 characters."),
    validateRequest,
    authController.resetPassword
);

// Protected routes
router.post("/logout", authMiddleware.protect, authController.logout)

export default router;
