import { param, body } from "express-validator";

import { MESSAGES } from "../constants/message.js";

export const validateApplyJob = [
    // Validate Job ID
    param("jobId")
        .notEmpty()
        .withMessage(MESSAGES.JOB_REQUIRED)
        .bail()
        .isMongoId()
        .withMessage(MESSAGES.JOB_NOT_FOUND),

    // Validate Applicant Name
    body("applicantName")
        .trim()
        .notEmpty()
        .withMessage(MESSAGES.FULL_NAME_REQUIRED)
        .bail()
        .isLength({ min: 2, max: 100 })
        .withMessage(MESSAGES.FULL_NAME_LENGTH),

    // Validate Applicant Email
    body("applicantEmail")
        .trim()
        .notEmpty()
        .withMessage(MESSAGES.EMAIL_REQUIRED)
        .bail()
        .isEmail()
        .withMessage(MESSAGES.EMAIL_INVALID),

    // Validate Applicant Phone
    body("applicantPhone")
        .optional({ values: "falsy" })
        .trim()
        .isMobilePhone("vi-VN")
        .withMessage(MESSAGES.PHONE_INVALID),

    // Validate CV File
    body("cv").custom((value, { req }) => {
        if (!req.file) {
            throw new Error(MESSAGES.CV_REQUIRED);
        }

        return true;
    })
];