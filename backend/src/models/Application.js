
import mongoose from "mongoose";

import { APPLICATION_STATUS } from "../constants/application.js";
import { MESSAGES } from "../constants/message.js";

const applicationSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, MESSAGES.CANDIDATE_REQUIRED]
        },

        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: [true, MESSAGES.JOB_REQUIRED]
        },

        applicantName: {
            type: String,
            required: [true, MESSAGES.APPLICANT_NAME_REQUIRED],
            trim: true
        },

        applicantEmail: {
            type: String,
            required: [true, MESSAGES.APPLICANT_EMAIL_REQUIRED],
            lowercase: true,
            trim: true
        },

        applicantPhone: {
            type: String,
            trim: true,
            default: null
        },

        cv: {
            url: {
                type: String,
                required: [true, MESSAGES.CV_REQUIRED],
                trim: true
            },

            publicId: {
                type: String,
                required: [true, MESSAGES.CV_PUBLIC_REQUIRED]
            },

            fileName: {
                type: String,
                required: [true, MESSAGES.CV_FILE_NAME_REQUIRED],
                trim: true
            },
        },

        status: {
            type: String,
            enum: Object.values(APPLICATION_STATUS),
            default: APPLICATION_STATUS.APPLIED
        },

        statusUpdatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Prevent duplicate applications
applicationSchema.index(
    { candidateId: 1, jobId: 1 },
    { unique: true }
);

// Indexes for recruiter and candidate queries
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, createdAt: -1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
