import mongoose from "mongoose";

import {
    JOB_STATUS,
    EMPLOYMENT_TYPE,
    EXPERIENCE_LEVEL,
    WORK_LOCATION_TYPE,
    JOB_CATEGORY,
    SALARY_PERIOD,
    SALARY_CURRENCY
} from "../constants/job.js";
import { MESSAGES } from "../constants/message.js";

const jobSchema = new mongoose.Schema(
    {
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, MESSAGES.RECRUITER_REQUIRED]
        },

        title: {
            type: String,
            required: [true, MESSAGES.JOB_TITTLE_REQUIRED],
            trim: true,
            maxlength: [150, MESSAGES.JOB_TITLE_LENGTH]
        },

        description: {
            type: String,
            required: [true, MESSAGES.JOB_DESCRIPTION_REQUIRED],
            trim: true
        },

        category: {
            type: String,
            enum: {
                values: Object.values(JOB_CATEGORY),
                message: MESSAGES.JOB_CATEGORY_INVALID
            },
            required: [true, MESSAGES.JOB_CATEGORY_REQUIRED]
        },

        employmentType: {
            type: String,
            enum: {
                values: Object.values(EMPLOYMENT_TYPE),
                message: MESSAGES.EMPLOYMENT_TYPE_INVALID
            },
            required: [true, MESSAGES.EMPLOYMENT_TYPE_REQUIRED]
        },

        experienceLevel: {
            type: String,
            enum: {
                values: Object.values(EXPERIENCE_LEVEL),
                message: MESSAGES.EXPERIENCE_LEVEL_INVALID
            },
            required: [true, MESSAGES.EXPERIENCE_LEVEL_REQUIRED]
        },

        workLocationType: {
            type: String,
            enum: {
                values: Object.values(WORK_LOCATION_TYPE),
                message: MESSAGES.WORK_LOCATION_TYPE_INVALID
            },
            required: [true, MESSAGES.WORK_LOCATION_TYPE_REQUIRED]
        },

        location: {
            type: String,
            trim: true,
            default: null
        },

        salaryMin: {
            type: Number,
            min: [0, MESSAGES.SALARY_MIN_NOT_NEGATIVE],
            default: null
        },

        salaryMax: {
            type: Number,
            min: [0, MESSAGES.SALARY_MAX_NOT_NEGATIVE],
            default: null
        },

        salaryCurrency: {
            type: String,
            enum: {
                values: Object.values(SALARY_CURRENCY),
                message: MESSAGES.SALARY_CURRENCY_INVALID
            },
            default: SALARY_CURRENCY.VND
        },

        salaryPeriod: {
            type: String,
            enum: {
                values: Object.values(SALARY_PERIOD),
                message: MESSAGES.SALARY_PERIOD_INVALID
            },
            default: SALARY_PERIOD.MONTH
        },

        numberOfPositions: {
            type: Number,
            required: [true, MESSAGES.NUMBER_POSITIONS_REQUIRED],
            min: [1, MESSAGES.NUMBER_OF_POSITIONS_INVALID]
        },

        applicationStartDate: {
            type: Date,
            required: [true, MESSAGES.APPLICATION_START_DATE_REQUIRED]
        },

        applicationEndDate: {
            type: Date,
            required: [true, MESSAGES.APPLICATION_END_DATE_REQUIRED]
        },

        status: {
            type: String,
            enum: Object.values(JOB_STATUS),
            default: JOB_STATUS.DRAFT
        },

        isVisible: {
            type: Boolean,
            default: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Validate salary range
jobSchema.pre("validate", function () {
    if (
        this.salaryMin != null &&
        this.salaryMax != null &&
        this.salaryMax < this.salaryMin
    ) {
        this.invalidate(
            "salaryMax",
            MESSAGES.SALARY_MAX_INVALID
        );
    }

    if (this.applicationStartDate && this.applicationEndDate) {
        if (this.applicationEndDate <= this.applicationStartDate) {
            this.invalidate(
                "applicationEndDate",
                MESSAGES.APPLICATION_DATE_INVALID
            )
        }
    }
});

// Indexes
jobSchema.index({ recruiterId: 1, status: 1 });

jobSchema.index({
    status: 1,
    isVisible: 1,
    isDeleted: 1,
    applicationStartDate: 1,
    applicationEndDate: 1
});

const Job = mongoose.model("Job", jobSchema);

export default Job;