import { body } from "express-validator";

import {
    JOB_CATEGORY,
    EMPLOYMENT_TYPE,
    EXPERIENCE_LEVEL,
    WORK_LOCATION_TYPE,
    SALARY_CURRENCY,
    SALARY_PERIOD,
    JOB_STATUS
} from "../constants/job.js";

import { MESSAGES } from "../constants/message.js";

const requiredJobFields = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage(MESSAGES.JOB_TITLE_REQUIRED)
        .bail()
        .isLength({ min: 2, max: 150 })
        .withMessage(MESSAGES.JOB_TITLE_LENGTH),

    body("description")
        .trim()
        .notEmpty()
        .withMessage(MESSAGES.JOB_DESCRIPTION_REQUIRED),

    body("category")
        .notEmpty()
        .withMessage(MESSAGES.JOB_CATEGORY_REQUIRED)
        .bail()
        .isIn(Object.values(JOB_CATEGORY))
        .withMessage(MESSAGES.JOB_CATEGORY_INVALID),

    body("employmentType")
        .notEmpty()
        .withMessage(MESSAGES.EMPLOYMENT_TYPE_REQUIRED)
        .bail()
        .isIn(Object.values(EMPLOYMENT_TYPE))
        .withMessage(MESSAGES.EMPLOYMENT_TYPE_INVALID),

    body("experienceLevel")
        .notEmpty()
        .withMessage(MESSAGES.EXPERIENCE_LEVEL_REQUIRED)
        .bail()
        .isIn(Object.values(EXPERIENCE_LEVEL))
        .withMessage(MESSAGES.EXPERIENCE_LEVEL_INVALID),

    body("workLocationType")
        .notEmpty()
        .withMessage(MESSAGES.WORK_LOCATION_TYPE_REQUIRED)
        .bail()
        .isIn(Object.values(WORK_LOCATION_TYPE))
        .withMessage(MESSAGES.WORK_LOCATION_TYPE_INVALID),

    body("applicationStartDate")
        .notEmpty()
        .withMessage(MESSAGES.APPLICATION_START_DATE_REQUIRED)
        .bail()
        .isISO8601()
        .withMessage(MESSAGES.APPLICATION_START_DATE_INVALID)
        .toDate(),

    body("applicationEndDate")
        .notEmpty()
        .withMessage(MESSAGES.APPLICATION_END_DATE_REQUIRED)
        .bail()
        .isISO8601()
        .withMessage(MESSAGES.APPLICATION_END_DATE_INVALID)
        .toDate()
        .custom((endDate, { req }) => {
            const startDate = req.body.applicationStartDate;

            if (
                startDate &&
                new Date(endDate) <= new Date(startDate)
            ) {
                throw new Error(MESSAGES.APPLICATION_DATE_INVALID);
            }

            return true;
        }),
    body("status")
        .notEmpty()
        .withMessage(MESSAGES.JOB_STATUS_REQUIRED)
        .bail()
        .isIn([JOB_STATUS.DRAFT, JOB_STATUS.OPENING])
        .withMessage(MESSAGES.JOB_STATUS_INVALID),

];

const optionalJobFields = [
    body("location")
        .optional({ values: "falsy" })
        .trim(),

    body("salaryMin")
        .optional({ values: "null" })
        .isFloat({ min: 0 })
        .withMessage(MESSAGES.SALARY_MIN_INVALID)
        .toFloat(),

    body("salaryMax")
        .optional({ values: "null" })
        .isFloat({ min: 0 })
        .withMessage(MESSAGES.SALARY_MAX_INVALID)
        .toFloat()
        .custom((salaryMax, { req }) => {
            const salaryMin = req.body.salaryMin;

            if (
                salaryMin != null &&
                salaryMax < salaryMin
            ) {
                throw new Error(MESSAGES.SALARY_RANGE_INVALID);
            }

            return true;
        }),

    body("salaryCurrency")
        .optional()
        .isIn(Object.values(SALARY_CURRENCY))
        .withMessage(MESSAGES.SALARY_CURRENCY_INVALID),

    body("salaryPeriod")
        .optional()
        .isIn(Object.values(SALARY_PERIOD))
        .withMessage(MESSAGES.SALARY_PERIOD_INVALID),

    body("numberOfPositions")
        .optional()
        .isInt({ min: 1 })
        .withMessage(MESSAGES.NUMBER_OF_POSITIONS_INVALID)
        .toInt()
];

export const validateCreateJob = [
    ...requiredJobFields,
    ...optionalJobFields
];

// Validate Update Job
export const validateUpdateJob = [
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(MESSAGES.JOB_TITLE_REQUIRED)
        .bail()
        .isLength({ min: 2, max: 150 })
        .withMessage(MESSAGES.JOB_TITLE_LENGTH),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(MESSAGES.JOB_DESCRIPTION_REQUIRED),

    body("category")
        .optional()
        .isIn(Object.values(JOB_CATEGORY))
        .withMessage(MESSAGES.JOB_CATEGORY_INVALID),

    body("employmentType")
        .optional()
        .isIn(Object.values(EMPLOYMENT_TYPE))
        .withMessage(MESSAGES.EMPLOYMENT_TYPE_INVALID),

    body("experienceLevel")
        .optional()
        .isIn(Object.values(EXPERIENCE_LEVEL))
        .withMessage(MESSAGES.EXPERIENCE_LEVEL_INVALID),

    body("workLocationType")
        .optional()
        .isIn(Object.values(WORK_LOCATION_TYPE))
        .withMessage(MESSAGES.WORK_LOCATION_TYPE_INVALID),

    ...optionalJobFields,

    body("applicationStartDate")
        .optional()
        .isISO8601()
        .withMessage(MESSAGES.APPLICATION_START_DATE_INVALID)
        .toDate(),

    body("applicationEndDate")
        .optional()
        .isISO8601()
        .withMessage(MESSAGES.APPLICATION_END_DATE_INVALID)
        .toDate()
        .custom((endDate, { req }) => {
            const startDate = req.body.applicationStartDate;

            if (
                startDate &&
                new Date(endDate) <= new Date(startDate)
            ) {
                throw new Error(MESSAGES.APPLICATION_DATE_INVALID);
            }

            return true;
        })
];