"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModel = void 0;
const mongoose_1 = require("mongoose");
const uploadSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    event: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Event',
    },
    mediaSource: {
        type: String,
    },
    fileName: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    duration: {
        type: Number,
    },
    highLight: [
        {
            caption: String,
            mediaSourceCover: String,
            mediaSourceOriginal: String,
            textHighLight: String,
        },
    ],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
uploadSchema.statics.getUserUploadsCount = async function getUserUploadCount(userId) {
    const userUploads = await this.find({ user: userId });
    return userUploads.length;
};
exports.UploadModel = (0, mongoose_1.model)('Upload', uploadSchema);
