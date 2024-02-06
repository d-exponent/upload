"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateS3Bucket = exports.restrictUploadToMax = void 0;
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const ffmpeg_1 = require("@ffmpeg-installer/ffmpeg");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const http_status_1 = require("http-status");
const ApiError_1 = require("../utils/ApiError");
const Upload_1 = require("../models/Upload");
const User_1 = require("../models/User");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const s3buckets_1 = require("../services/s3buckets");
const env_1 = __importDefault(require("../env"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.path);
const s3 = new s3_1.default({
    region: env_1.default.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: env_1.default.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.default.AWS_ACCESS_SECRET_KEY,
    },
});
const restrictUploadToMax = async ({ params: { user_id }, files }, _, next) => {
    const user = await User_1.UserModel.findById(user_id);
    if (!user)
        next(new ApiError_1.ApiError(http_status_1.FORBIDDEN, 'You shall not pass'));
    const userUploads = await Upload_1.UploadModel.find({ user: user_id });
    const maxUploadsPerUser = 5;
    const totalCurrentUploads = userUploads.length;
    if (totalCurrentUploads >= maxUploadsPerUser) {
        return next(new ApiError_1.ApiError(http_status_1.FORBIDDEN, 'The user has already reached maximun uploads'));
    }
    if (files && Array.isArray(files) && files.length + totalCurrentUploads > maxUploadsPerUser) {
        const message = `The user can only upload ${maxUploadsPerUser - totalCurrentUploads} more files. `;
        return next(new ApiError_1.ApiError(http_status_1.FORBIDDEN, message));
    }
    next();
};
exports.restrictUploadToMax = restrictUploadToMax;
exports.initiateS3Bucket = (0, catchAsync_1.default)(async (req, res, next) => {
    const bucketIsInitiated = await (0, s3buckets_1.initBucket)(s3);
    if (!bucketIsInitiated) {
        return next(new ApiError_1.ApiError(http_status_1.INTERNAL_SERVER_ERROR, 'Could not initiate Bucket', {}, true));
    }
    req.s3 = s3;
    next();
});
