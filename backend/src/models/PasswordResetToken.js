import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, unique: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    usedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true, versionKey: false });

export default mongoose.model("PasswordResetToken", schema);
