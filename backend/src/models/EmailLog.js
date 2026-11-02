
import mongoose from "mongoose";

import {
    EMAIL_TYPE,
    EMAIL_STATUS
} from "../constants/email.js";
import { MESSAGES } from "../constants/message.js";

const emailLogSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, MESSAGES.SENDER_REQUIRED]
        },

        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            default: null
        },

        emailType: {
            type: String,
            enum: Object.values(EMAIL_TYPE),
            required: [true, MESSAGES.EMAIL_TYPE_REQUIRED]
        },

        recipientEmail: {
            type: String,
            required: [true, MESSAGES.RECIPIENT_EMAIL_REQUIRED],
            lowercase: true,
            trim: true
        },

        subject: {
            type: String,
            required: [true, MESSAGES.EMAIL_SUBJECT_REQUIRED],
            trim: true
        },

        body: {
            type: String,
            required: [true, MESSAGES.EMAIL_BODY_REQUIRED]
        },

        status: {
            type: String,
            enum: Object.values(EMAIL_STATUS),
            required: true
        },

        sentAt: {
            type: Date,
            default: null
        },

        errorMessage: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes
emailLogSchema.index({ applicationId: 1, createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
