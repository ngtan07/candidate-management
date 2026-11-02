import { body } from "express-validator";
import { MESSAGES } from "../constants/message.js";

const {
    FULL_NAME_REQUIRED,
    FULL_NAME_LENGTH,
    EMAIL_REQUIRED,
    EMAIL_INVALID,
    PASSWORD_REQUIRED,
    PASSWORD_LENGTH,
    PHONE_INVALID,
    COMPANY_NAME_REQUIRED,
    COMPANY_NAME_LENGTH,
    WEBSITE_INVALID,
    BUSINESS_REGISTRATION_NUMBER_REQUIRED,
    BUSINESS_LICENSE_URL_REQUIRED,
    BUSINESS_LICENSE_URL_INVALID
} = MESSAGES;

// Validate Candidate Registration
export const validateCandidateRegister = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage(FULL_NAME_REQUIRED)
        .bail()
        .isLength({ min: 2, max: 100 })
        .withMessage(FULL_NAME_LENGTH),

    body("email")
        .trim()
        .notEmpty()
        .withMessage(EMAIL_REQUIRED)
        .bail()
        .isEmail()
        .withMessage(EMAIL_INVALID)
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage(PASSWORD_REQUIRED)
        .bail()
        .isLength({ min: 8, max: 72 })
        .withMessage(PASSWORD_LENGTH),

    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .isMobilePhone("vi-VN")
        .withMessage(PHONE_INVALID)
];

// Validate Recruiter Registration
export const validateRecruiterRegister = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage(EMAIL_REQUIRED)
        .bail()
        .isEmail()
        .withMessage(EMAIL_INVALID)
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage(PASSWORD_REQUIRED)
        .bail()
        .isLength({ min: 8, max: 72 })
        .withMessage(PASSWORD_LENGTH),

    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .isMobilePhone("vi-VN")
        .withMessage(PHONE_INVALID),

    body("companyName")
        .trim()
        .notEmpty()
        .withMessage(COMPANY_NAME_REQUIRED)
        .bail()
        .isLength({ max: 150 })
        .withMessage(COMPANY_NAME_LENGTH),

    body("address")
        .optional({ values: "falsy" })
        .trim(),

    body("website")
        .optional({ values: "falsy" })
        .trim()
        .isURL()
        .withMessage(WEBSITE_INVALID),

    body("businessRegistrationNumber")
        .trim()
        .notEmpty()
        .withMessage(BUSINESS_REGISTRATION_NUMBER_REQUIRED),

    body("businessLicenseUrl")
        .trim()
        .notEmpty()
        .withMessage(BUSINESS_LICENSE_URL_REQUIRED)
        .bail()
        .isURL()
        .withMessage(BUSINESS_LICENSE_URL_INVALID)
];

// Validate Login
export const validateLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage(EMAIL_REQUIRED)
        .bail()
        .isEmail()
        .withMessage(EMAIL_INVALID)
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage(PASSWORD_REQUIRED)
];