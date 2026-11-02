import User from "../models/User.js";
import { ROLE } from "../constants/role.js";
import { REGISTRATION_STATUS } from "../constants/registrationStatus.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { MESSAGES } from "../constants/message.js";
import AppError from "../utils/AppError.js";

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

export default {
    registerCandidate,
    registerRecruiter,
    login,
    getCurrentUser
}