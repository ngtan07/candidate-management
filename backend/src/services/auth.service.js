import User from "../models/User.js";
import { ROLE } from "../constants/role.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { MESSAGES } from "../constants/message.js";
import AppError from "../utils/AppError.js";
import crypto from "node:crypto";
import PasswordResetToken from "../models/PasswordResetToken.js";
import emailService from "./email.service.js";
import env from "../config/env.js";

// Candidate registration
const registerCandidate = async (data) => {
    const { fullName, email, password, phone } = data
    const normalizedEmail = normalizeEmail(email)

    // Check duplicate email
    const isExisted = await User.findOne({ email: normalizedEmail })

    if (isExisted) {
        throw new AppError(MESSAGES.EMAIL_ALREADY_REGISTERED, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    try {
        const candidate = await User.create({
            fullName,
            email: normalizedEmail,
            passwordHash,
            phone,
            role: ROLE.CANDIDATE,
            registrationStatus: null
        })
        return candidate
    } catch (error) {
        handleDuplicateEmail(error)
    }
}

// Recruiter registration
const registerRecruiter = async (data) => {
    const {
        email,
        password,
        phone,
        companyName,
        address,
        website,
        businessRegistrationNumber,
        businessLicenseUrl
    } = data;

    const normalizedEmail = normalizeEmail(email)

    // Check duplicate email
    const isExisted = await User.findOne({ email: normalizedEmail })

    if (isExisted) {
        throw new AppError(MESSAGES.EMAIL_ALREADY_REGISTERED, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    try {
        const recruiter = await User.create({
            email: normalizedEmail,
            passwordHash,
            phone,
            companyName,
            address,
            website,
            businessRegistrationNumber,
            businessLicenseUrl,
            role: ROLE.RECRUITER,
            registrationStatus: REGISTRATION_STATUS.PENDING
        });

        return recruiter

    } catch (error) {
        handleDuplicateEmail(error)
    }
}

const login = async (email, password) => {
    const normalizedEmail = normalizeEmail(email)
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
        throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401)
    }

    // check password
    const isMatch = await comparePassword(password, user.passwordHash)

    if (!isMatch) {
        throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401)
    }

    // check account status
    if (!user.isActive) {
        throw new AppError(MESSAGES.ACCOUNT_INACTIVE, 403)
    }

    return user
}

const getCurrentUser = async (userId) => {

    const user = await User.findById(userId).select("-passwordHash")

    if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
    }

    return user
}

const normalizeEmail = (email) => {
    return email.trim().toLowerCase()
}

const handleDuplicateEmail = (error) => {
    if (error.code === 11000 && error.keyPattern?.email) {
        throw new AppError(
            MESSAGES.EMAIL_ALREADY_REGISTERED,
            409
        );
    }

    throw error;
};

const requestPasswordReset = async (email) => {
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return;
    const rawToken = crypto.randomBytes(32).toString("hex");
    await PasswordResetToken.findOneAndUpdate(
        { userId: user._id },
        { tokenHash: crypto.createHash("sha256").update(rawToken).digest("hex"), expiresAt: new Date(Date.now() + 60 * 60 * 1000), usedAt: null },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const link = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
    try {
        await emailService.sendEmail({ to: user.email, subject: "Reset your TalentPulse password", text: `Use this link within one hour: ${link}`, html: `<p>Reset your password within one hour.</p><p><a href="${link}">Reset password</a></p>` });
    } catch (error) {
        console.error("Password reset email delivery failed:", error.message);
    }
};

const resetPassword = async (rawToken, password) => {
    const tokenHash = crypto.createHash("sha256").update(rawToken || "").digest("hex");
    const reset = await PasswordResetToken.findOneAndUpdate(
        { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
        { $set: { usedAt: new Date(), tokenHash: crypto.randomBytes(32).toString("hex") } },
        { new: true }
    );
    if (!reset) throw new AppError("This password reset link is invalid or expired.", 400);
    const user = await User.findById(reset.userId);
    if (!user) throw new AppError("This password reset link is invalid or expired.", 400);
    user.passwordHash = await hashPassword(password);
    await user.save();
};

export default {
    registerCandidate,
    registerRecruiter,
    login,
    getCurrentUser,
    requestPasswordReset,
    resetPassword
}
