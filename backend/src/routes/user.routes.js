import express from "express";

import userController from "../controllers/user.controller.js";
import { validateChangePassword, validateUpdateProfile } from "../validators/user.validator.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validate.middleware.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/my-profile", userController.getCurrentUser);

router.patch("/my-profile",
    authMiddleware.authorize(ROLE.CANDIDATE),
    validateUpdateProfile,
    validateRequest,
    userController.updateProfile
);

router.patch("/change-password",
    validateChangePassword,
    validateRequest,
    userController.changePassword
);

export default router;