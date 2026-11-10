import env from '../config/env.js';
import { MESSAGES } from '../constants/message.js';
import authService from '../services/auth.service.js'
import { generateToken } from '../utils/jwt.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
};

const registerCandidate = async (req, res) => {
    const candidate = await authService.registerCandidate(req.body)

    res.status(201).json({
        success: true,
        message: MESSAGES.REGISTRATION_SUCCESS,
        data: {
            id: candidate._id,
            fullName: candidate.fullName,
            email: candidate.email,
            role: candidate.role
        }
    })
}

const registerRecruiter = async (req, res) => {
    const recruiter = await authService.registerRecruiter(req.body);

    res.status(201).json({
        success: true,
        message: MESSAGES.REGISTRATION_SUCCESS,
        data: {
            id: recruiter._id,
            email: recruiter.email,
            companyName: recruiter.companyName,
            role: recruiter.role,
            registrationStatus: recruiter.registrationStatus
        }
    })
}

const login = async (req, res) => {
    const { email, password } = req.body

    const user = await authService.login(email, password)
    const token = generateToken(user._id.toString())

    // Store token in cookie
    res.cookie("token", token, COOKIE_OPTIONS)

    res.status(200).json({
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
        data: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            registrationStatus: user.registrationStatus
        }
    })
}

const logout = (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);

    res.status(200).json({
        success: true,
        message: MESSAGES.LOGOUT_SUCCESS
    });
}

const requestPasswordReset = async (req, res) => {
    await authService.requestPasswordReset(req.body.email);
    res.status(202).json({ success: true, message: "If the account exists, reset instructions are being processed. If they do not arrive, contact support." });
};

const resetPassword = async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(200).json({ success: true, message: "Password reset successfully." });
};

export default {
    registerCandidate,
    registerRecruiter,
    login,
    logout,
    requestPasswordReset,
    resetPassword
};
