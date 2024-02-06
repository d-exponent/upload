"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerVideoAudioConfig = exports.multerConfig = exports.extractMimetype = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = require("path");
const ApiError_1 = require("../utils/ApiError");
const extractMimetype = (file, onlyMime = true) => {
    const mimetypes = file.mimetype.split('/');
    return onlyMime ? mimetypes[0] : mimetypes;
};
exports.extractMimetype = extractMimetype;
exports.multerConfig = {
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
        if (/jpeg|jpg|png|gif/.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Allowed types are jpeg|jpg|png|gif'));
    },
};
exports.multerVideoAudioConfig = {
    storage: multer_1.default.diskStorage({
        destination: (0, path_1.join)(process.cwd(), 'uploads'),
        filename: function (_, file, cb) {
            cb(null, file.originalname);
        },
    }),
    // storage: multer.memoryStorage(),
    fileFilter: (_, file, cb) => {
        const [mimetype, extension] = (0, exports.extractMimetype)(file, false);
        if (mimetype === 'audio' && file.size > 35 * 1024 * 1024) {
            return cb(new ApiError_1.ApiError(413, 'Max size of audio file is 35mb'));
        }
        if (mimetype === 'video' && file.size > 40 * 1024 * 1024) {
            return cb(new ApiError_1.ApiError(413, 'Max size of video files is 40mb'));
        }
        if (/mp4|webm|ogg|mp3|wav|mpeg/.test(extension)) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. ALlowed types are mp4|webm|ogg|mp3|wav|mpeg'));
    },
};
