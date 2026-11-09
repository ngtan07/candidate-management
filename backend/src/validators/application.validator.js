import { param, body, query } from "express-validator";

import { MESSAGES } from "../constants/message.js";
import { APPLICATION_STATUS } from "../constants/application.js";

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

export const validateGetMyApplications = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage(MESSAGES.PAGE_INVALID),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage(MESSAGES.LIMIT_INVALID),

    query("status")
        .optional()
        .isIn(Object.values(APPLICATION_STATUS))
        .withMessage(MESSAGES.APPLICATION_STATUS_INVALID),

    query("search")
        .optional()
        .trim()
];

export const validateGetApplicationById = [
    param("applicationId")
        .notEmpty()
        .withMessage(MESSAGES.APPLICATION_NOT_FOUND)
        .bail()
        .isMongoId()
        .withMessage(MESSAGES.APPLICATION_ID_INVALID)
];


export const validateGetApplicationsByJob = [
    param("jobId")
        .notEmpty()
        .withMessage(MESSAGES.JOB_REQUIRED)
        .bail()
        .isMongoId()
        .withMessage(MESSAGES.JOB_ID_INVALID),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage(MESSAGES.PAGE_INVALID),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage(MESSAGES.LIMIT_INVALID),

    query("status")
        .optional()
        .isIn(Object.values(APPLICATION_STATUS))
        .withMessage(MESSAGES.APPLICATION_STATUS_INVALID),

    query("search")
        .optional()
        .trim()
];

export const validateUpdateApplicationStatus = [
    param("applicationId")
        .notEmpty()
        .withMessage(MESSAGES.APPLICATION_NOT_FOUND)
        .bail()
        .isMongoId()
        .withMessage(MESSAGES.APPLICATION_ID_INVALID),

    body("status")
        .notEmpty()
        .withMessage(MESSAGES.APPLICATION_STATUS_REQUIRED)
        .bail()
        .isIn(Object.values(APPLICATION_STATUS))
        .withMessage(MESSAGES.APPLICATION_STATUS_INVALID)
];