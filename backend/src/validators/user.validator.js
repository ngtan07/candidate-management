import { body } from "express-validator";
import { MESSAGES } from "../constants/message.js";

export const validateUpdateProfile = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage(MESSAGES.FULL_NAME_LENGTH),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage(MESSAGES.EMAIL_INVALID),

    body("phone")
        .optional()
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage(MESSAGES.PHONE_INVALID),

    body("address")
        .optional()
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage(MESSAGES.ADDRESS_INVALID)
];

export const validateChangePassword = [
    body("currentPassword")
        .notEmpty()
        .withMessage(MESSAGES.CURRENT_PASSWORD_REQUIRED),

    body("newPassword")
        .notEmpty()
        .withMessage(MESSAGES.NEW_PASSWORD_REQUIRED)
        .bail()
        .isLength({ min: 8, max: 72 })
        .withMessage(MESSAGES.PASSWORD_LENGTH),

    body("confirmPassword")
        .notEmpty()
        .withMessage(MESSAGES.CONFIRM_PASSWORD_REQUIRED)
        .bail()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error(MESSAGES.PASSWORD_CONFIRMATION_INVALID);
            }
            return true;
        })
];