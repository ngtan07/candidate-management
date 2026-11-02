import mongoose from "mongoose";
import { ROLE } from "../constants/role.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import { MESSAGES } from "../constants/message.js";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            trim: true,
            default: null,
            required: [
                function () {
                    return this.role !== ROLE.RECRUITER;
                },
                MESSAGES.FULL_NAME_REQUIRED
            ]
        },

        companyName: {
            type: String,
            trim: true,
            default: null,
            required: [
                function () {
                    return this.role === ROLE.RECRUITER;
                },
                MESSAGES.COMPANY_NAME_REQUIRED
            ]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                MESSAGES.EMAIL_INVALID
            ],
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: [true, MESSAGES.PASSWORD_REQUIRED]
        },

        phone: {
            type: String,
            trim: true,
            default: null
        },

        address: {
            type: String,
            trim: true,
            default: null
        },

        website: {
            type: String,
            trim: true,
            default: null
        },

        businessRegistrationNumber: {
            type: String,
            trim: true,
            default: null,
            required: function () {
                return this.role === ROLE.RECRUITER;
            }
        },

        businessLicenseUrl: {
            type: String,
            trim: true,
            default: null,
            required: function () {
                return this.role === ROLE.RECRUITER;
            }
        },

        role: {
            type: String,
            enum: Object.values(ROLE),
            required: true
        },

        registrationStatus: {
            type: String,
            enum: Object.values(REGISTRATION_STATUS),
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        },

        rejectionReason: {
            type: String,
            trim: true,
            default: null
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model("User", userSchema);

export default User;