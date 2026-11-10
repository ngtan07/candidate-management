import nodemailer from "nodemailer";
import env from "../config/env.js";

let transporter;
const getTransporter = () => {
    if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASSWORD) {
        throw new Error("Email is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASSWORD.");
    }
    if (!transporter) transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: Number(env.EMAIL_PORT || 587),
        secure: Number(env.EMAIL_PORT) === 465,
        auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD }
    });
    return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to || "")) throw new Error("Invalid email recipient.");
    return getTransporter().sendMail({ from: env.EMAIL_FROM || env.EMAIL_USER, to, subject, text, html });
};

export default { sendEmail };
