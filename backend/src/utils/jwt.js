import jwt from 'jsonwebtoken'
import env from "../config/env.js"

export const generateToken = (userId) => {
    const payload = { id: userId }
    const access_token = jwt.sign(payload, env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN
        }
    )

    return access_token
}

export const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET)
}

