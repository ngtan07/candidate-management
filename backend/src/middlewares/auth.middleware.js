
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

import AppError from "../utils/AppError.js";
import { MESSAGES } from "../constants/message.js";

// Authentication
const protect = async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies?.token

    if (!token) {
        return next(new AppError(MESSAGES.UNAUTHORIZED, 401))
    }

    try {
        // Verify JWT
        const decoded = verifyToken(token);

        // Find user in database
        const user = await User.findById(decoded.id).select("_id role isActive")

        if (!user || !user.isActive) {
            return next(new AppError(MESSAGES.UNAUTHORIZED, 401))
        }

        // Attach user information to request
        req.user = {
            id: user._id.toString(),
            role: user.role
        }

        next()
    } catch (error) {
        next(new AppError(MESSAGES.UNAUTHORIZED, 401))
    }
};

// Authorization
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError(MESSAGES.FORBIDDEN, 403))
        }

        next();
    }
}

export default {
    protect,
    authorize
};
