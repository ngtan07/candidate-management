import { validationResult } from "express-validator";

import { MESSAGES } from "../constants/message.js";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const messages = errors.array().map((error) => ({
            field: error.path,
            message: error.msg
        }));

        return res.status(400).json({
            success: false,
            message: MESSAGES.VALIDATION_FAILED,
            errors: messages
        });
    }

    next();
};

export default validateRequest;