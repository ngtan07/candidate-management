import mongoose from "mongoose";

import { INTERVIEW_TYPE } from "../constants/interview.js";
import { MESSAGES } from "../constants/message.js";

const interviewSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: [true, MESSAGES.APPLICATION_REQUIRED],
            unique: true
        },

        startTime: {
            type: Date,
            required: [true, MESSAGES.START_TIME_REQUIRED]
        },

        endTime: {
            type: Date,
            required: [true, MESSAGES.END_TIME_REQUIRED],
            validate: {
                validator: function (value) {
                    return !this.startTime || value > this.startTime;
                },
                message: MESSAGES.END_TIME_INVALID
            }
        },

        interviewType: {
            type: String,
            enum: Object.values(INTERVIEW_TYPE),
            required: [true, MESSAGES.INTERVIEW_TYPE_REQUIRED]
        },

        meetingUrl: {
            type: String,
            trim: true,
            default: null
        },

        officeAddress: {
            type: String,
            trim: true,
            default: null
        },

        notes: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Validate interview location based on type
interviewSchema.pre("validate", function () {

    if (this.interviewType === INTERVIEW_TYPE.ONLINE && !this.meetingUrl) {
        this.invalidate(
            "meetingUrl",
            MESSAGES.MEETING_URL_REQUIRED
        );
    }

    if (this.interviewType === INTERVIEW_TYPE.ONSITE && !this.officeAddress) {
        this.invalidate(
            "officeAddress",
            MESSAGES.OFFICE_ADDRESS_REQUIRED
        );
    }
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
