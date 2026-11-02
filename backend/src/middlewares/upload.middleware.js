import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";

import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";
import { MESSAGES } from "../constants/message.js";

const MAX_CV_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

const multerUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_CV_SIZE,
        files: 1
    },

    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const expectedMimeType = ALLOWED_MIME_TYPES[extension];

        if (!expectedMimeType || file.mimetype !== expectedMimeType) {
            return callback(
                new AppError(MESSAGES.CV_FORMAT_INVALID, 400)
            );
        }

        callback(null, true);
    }
}).single("cv");


export const parseApplicationFormData = (req, res, next) => {
    multerUpload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return next(
                    new AppError(MESSAGES.CV_SIZE_EXCEEDED, 413)
                );
            }

            return next(
                new AppError(MESSAGES.CV_UPLOAD_INVALID, 400)
            );
        }

        if (error) {
            return next(error);
        }

        next();
    });
};

// Upload Buffer to Cloudinary
const uploadBufferToCloudinary = (file) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const publicId = `${randomUUID()}${extension}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                type: "authenticated",
                folder: "candidate-management/applications/cv",
                public_id: publicId,
                overwrite: false
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
};

// Upload CV to Cloudinary
export const uploadCvToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const result = await uploadBufferToCloudinary(req.file);

        req.file.cloudinary = {
            url: result.secure_url,
            publicId: result.public_id,
            fileName: req.file.originalname
        };

        delete req.file.buffer;

        next();
    } catch (error) {
        console.error("[Cloudinary CV Upload]", error);

        next(
            new AppError(MESSAGES.FILE_UPLOAD_FAILED, 502)
        );
    }
};