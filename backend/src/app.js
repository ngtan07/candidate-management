import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import errorHandler from "./middlewares/error.middleware.js";
import AppError from "./utils/AppError.js";
import { MESSAGES } from "./constants/message.js";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import userRoutes from "./routes/user.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: { "frame-src": ["'self'", "blob:"] }
    }
}));

// CORS configuration
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));

// Parse request body
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// HTTP request logging
if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: MESSAGES.API_RUNNING
    });
});

// routes
app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", userRoutes);


// 404 handler
app.use((req, res, next) => {
    next(new AppError(MESSAGES.API_ENDPOINT_NOT_FOUND, 404))
});

app.use(errorHandler);



export default app;
