"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEventHighlightToS3 = exports.uploadProfileOrBgToS3 = exports.uploadImageEventToS3 = exports.uploadMediaToS3 = void 0;
const fs_1 = require("fs");
const rimraf_1 = require("rimraf");
const uniqid_1 = __importDefault(require("uniqid"));
const env_1 = __importDefault(require("../../env"));
const utils_1 = require("./utils");
const s3Params = (file, type, altPath) => {
    const extension = file.path.split('.').pop();
    return {
        Bucket: env_1.default.AWS_INPUT_BUCKET,
        Key: `events/${type}/${(0, uniqid_1.default)()}-taron-${type}-${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension}`,
        Body: (0, fs_1.createReadStream)(altPath ? altPath : file.path),
        ContentType: file.mimetype,
    };
};
const uploadMediaToS3 = async (s3, fileData, type) => {
    let response = [];
    for (let i = 0; i < fileData.length; i++) {
        const file = fileData[i];
        if (type === 'audio') {
            const params = s3Params(file, type);
            response.push(await s3.upload(params).promise());
        }
        if (type === 'video' || type === 'videos') {
            const newPath = (0, utils_1.injectUniqueId)(file.path);
            await (0, utils_1.trimVideo)(file.path, newPath);
            const params = s3Params(file, type, newPath);
            response.push(await s3.upload(params).promise());
            (0, rimraf_1.rimraf)(newPath).catch(console.error);
        }
        (0, rimraf_1.rimraf)(file.path).catch(console.error);
    }
    return response;
};
exports.uploadMediaToS3 = uploadMediaToS3;
const uploadImageEventToS3 = async (s3, file) => {
    const ImageData = await (0, utils_1.mainHighLightAspectRatio)(file, 'event');
    const thumbnailsData = await (0, utils_1.thumbnailDimension)(file);
    let uploadedEventImage = await (0, utils_1.completeImageEventUpload)(s3, ImageData);
    let thumbnailsUploadEventImage = await (0, utils_1.completeThumbnailsEventUpload)(s3, thumbnailsData);
    return {
        success: true,
        data: {
            images: uploadedEventImage,
            thumbnails: thumbnailsUploadEventImage,
        },
    };
};
exports.uploadImageEventToS3 = uploadImageEventToS3;
const uploadProfileOrBgToS3 = async (s3, file, folder) => {
    const width = folder === 'profile' ? 400 : 1200;
    const height = folder === 'profile' ? 400 : 400;
    const params = {
        Bucket: env_1.default.AWS_OUTPUT_BUCKET,
        Key: `images/${folder}/${(0, uniqid_1.default)()}-${file.originalname}`,
        Body: await (0, utils_1.resizeImage)(width, height, file.buffer),
        ContentType: file.mimetype,
        ACL: 'public-read',
    };
    return s3.upload(params).promise();
};
exports.uploadProfileOrBgToS3 = uploadProfileOrBgToS3;
const uploadEventHighlightToS3 = async (s3, fileData) => {
    const highLightCover = await (0, utils_1.highLightResize)(fileData);
    const highLightOriginal = await (0, utils_1.mainHighLightAspectRatio)(fileData, 'highlight');
    let highLightCoverResult = await (0, utils_1.HightLightCoverUpload)(s3, highLightCover, fileData);
    let highLightOriginalResult = await (0, utils_1.highLightOriginalUpload)(s3, highLightOriginal);
    return {
        data: {
            highLightCover: highLightCoverResult,
            highLightOriginal: highLightOriginalResult,
        },
    };
};
exports.uploadEventHighlightToS3 = uploadEventHighlightToS3;
