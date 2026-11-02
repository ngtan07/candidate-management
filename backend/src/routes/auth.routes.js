
import express from "express";

import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validate.middleware.js";
import {
    validateCandidateRegister,
    validateRecruiterRegister,
    validateLogin
} from "../validators/auth.validator.js";

const router = express.Router();

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

// Protected routes
router.post("/logout", authMiddleware.protect, authController.logout)
router.get("/me", authMiddleware.protect, authController.getCurrentUser)

export default router;
