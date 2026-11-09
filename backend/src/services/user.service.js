import User from "../models/User.js";
import { MESSAGES } from "../constants/message.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import AppError from "../utils/AppError.js";

const getCurrentUser = async (userId) => {

    const user = await User.findById(userId).select("-passwordHash")

    if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
    }

    return user
}

const updateProfile = async (userId, data) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
    }

    if (data.fullName !== undefined) {
        user.fullName = data.fullName.trim();
    }

    if (data.email !== undefined) {
        const existingUser = await User.findOne({
            email: data.email.trim().toLowerCase(),
            _id: { $ne: userId }
        });

        if (existingUser) {
            throw new AppError(MESSAGES.EMAIL_ALREADY_EXISTS, 409);
        }

        user.email = data.email.trim().toLowerCase();
    }

    if (data.phone !== undefined) {
        user.phone = data.phone.trim();
    }

    if (data.address !== undefined) {
        user.address = data.address.trim();
    }

    await user.save();

    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        registrationStatus: user.registrationStatus
    };
};

const changePassword = async (userId, data) => {
    const { currentPassword, newPassword } = data;

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
    }

    const isMatch = await comparePassword(
        currentPassword,
        user.passwordHash
    );

    if (!isMatch) {
        throw new AppError(MESSAGES.CURRENT_PASSWORD_INVALID, 400);
    }

    if (currentPassword === newPassword) {
        throw new AppError(MESSAGES.PASSWORD_SAME_AS_OLD, 400);
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return true;
};

export default {
    getCurrentUser,
    updateProfile,
    changePassword
}