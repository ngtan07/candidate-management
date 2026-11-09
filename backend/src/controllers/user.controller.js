import { MESSAGES } from "../constants/message.js";
import userService from "../services/user.service.js";

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await userService.getCurrentUser(req.user.id);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: MESSAGES.PROFILE_UPDATED,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        await userService.changePassword(req.user.id, req.body);

        return res.status(200).json({
            success: true,
            message: MESSAGES.PASSWORD_CHANGED
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getCurrentUser,
    updateProfile,
    changePassword
};