"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectUniqueId = exports.trimVideo = exports.resizeImage = exports.highLightResize = exports.highLightOriginalUpload = exports.HightLightCoverUpload = exports.completeThumbnailsEventUpload = exports.completeImageEventUpload = exports.thumbnailDimension = exports.mainHighLightAspectRatio = exports.getRandom = void 0;
const sharp_1 = __importDefault(require("sharp"));
const uniqid_1 = __importDefault(require("uniqid"));
const env_1 = __importDefault(require("../../env"));
const ffmpeg_1 = require("@ffmpeg-installer/ffmpeg");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.path);
const getRandom = () => ({
    number: Math.round(Math.random() * 1e9),
    id: (0, uniqid_1.default)(),
    date: Date.now(),
});
exports.getRandom = getRandom;
const mainHighLightAspectRatio = async (file, caller) => {
    const response = await Promise.all(file.map(async (obj) => {
        const image = (0, sharp_1.default)(obj.buffer);
        // Highlights images are already compressed
        if (caller === 'event')
            image.webp({ lossless: true });
        return {
            buffer: await image.toBuffer(),
            mimetype: obj.mimetype,
        };
    }));
    return response;
};
exports.mainHighLightAspectRatio = mainHighLightAspectRatio;
const thumbnailDimension = async (file) => {
    const response = await Promise.all(file.map(async (obj) => {
        const buffer = await (0, sharp_1.default)(obj.buffer).resize({ width: 300, height: 300 }).toBuffer();
        const mimetype = obj.mimetype;
        return {
            buffer,
            mimetype,
        };
    }));
    return response;
};
exports.thumbnailDimension = thumbnailDimension;
const completeImageEventUpload = async (s3, data) => {
    let response = [];
    for (let i = 0; i < data.length; i++) {
        const extension = data[i].mimetype.split('/');
        const params = {
            Bucket: env_1.default.AWS_OUTPUT_BUCKET,
            Key: `events/images/${(0, uniqid_1.default)()}-taron-events-${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension[1]}`,
            Body: data[i].buffer,
            ContentType: data[i].mimetype,
            ACL: 'public-read',
        };
        const images = await s3.upload(params).promise();
        response.push(images.Location);
    }
    return response;
};
exports.completeImageEventUpload = completeImageEventUpload;
const completeThumbnailsEventUpload = async (s3, data) => {
    let response = [];
    for (let j = 0; j < data.length; j++) {
        const extension = data[j].mimetype.split('/');
        const params = {
            Bucket: env_1.default.AWS_OUTPUT_BUCKET,
            Key: `events/thumbnails/${(0, uniqid_1.default)()}-taron-events-${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension[1]}`,
            Body: data[j].buffer,
            ContentType: data[j].mimetype,
            ACL: 'public-read',
        };
        const images = await s3.upload(params).promise();
        response.push(images.Location);
    }
    return response;
};
exports.completeThumbnailsEventUpload = completeThumbnailsEventUpload;
const HightLightCoverUpload = async (s3, data, fileData) => {
    let uploads = [];
    for (let i = 0; i < data.length; i++) {
        const result = {
            Bucket: env_1.default.AWS_OUTPUT_BUCKET,
            Key: `highlightcovers/${(0, uniqid_1.default)()}-taron-highlight-${Date.now()}_${Math.round(Math.random() * 1e9)}`,
            Body: data[i],
            // ContentType: fileData!.mimetype,
            ACL: 'public-read',
        };
        const cover = await s3.upload(result).promise();
        uploads.push(cover);
    }
    return uploads;
};
exports.HightLightCoverUpload = HightLightCoverUpload;
const highLightOriginalUpload = async (s3, data) => {
    let uploads = [];
    for (let i = 0; i < data.length; i++) {
        const result = {
            Bucket: env_1.default.AWS_OUTPUT_BUCKET,
            Key: `highlightoriginal/${(0, uniqid_1.default)()}-taron-highlight-${Date.now()}_${Math.round(Math.random() * 1e9)}`,
            Body: data[i],
            // ContentType: fileData!.mimetype,
            ACL: 'public-read',
        };
        const cover = await s3.upload(result).promise();
        uploads.push(cover);
    }
    return uploads;
};
exports.highLightOriginalUpload = highLightOriginalUpload;
const highLightResize = async (file) => {
    const response = await Promise.all(file.map(async (obj) => {
        const imageData = (0, sharp_1.default)(obj.buffer);
        const { width, height } = await imageData.metadata();
        // Width is greater than  height in landScape so make potrait
        if (width && height && width > height)
            imageData.rotate(90);
        imageData.resize({ width: 1080, height: 1920 }).webp({ lossless: true });
        return imageData.toBuffer();
    }));
    return response;
};
exports.highLightResize = highLightResize;
const resizeImage = (width, height, file) => (0, sharp_1.default)(file).resize({ width, height }).webp({ lossless: true }).toBuffer();
exports.resizeImage = resizeImage;
const trimVideo = (oldPath, newPath) => new Promise((resolve, reject) => {
    (0, fluent_ffmpeg_1.default)(oldPath).setStartTime(0).setDuration(30).saveToFile(newPath).on('error', reject).on('end', resolve);
});
exports.trimVideo = trimVideo;
const injectUniqueId = (path) => {
    const pathArr = path.split('.');
    const extention = pathArr.pop();
    return pathArr.join('.') + `-${(0, uniqid_1.default)()}.` + extention;
};
exports.injectUniqueId = injectUniqueId;
