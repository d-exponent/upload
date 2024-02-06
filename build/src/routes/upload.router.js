"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_middlewares_1 = require("../middlewares/upload.middlewares");
const MAX_FILES = 4;
const upload = (0, multer_1.default)(config_1.multerConfig);
const videoAudioUpload = (0, multer_1.default)(config_1.multerVideoAudioConfig);
const router = (0, express_1.Router)();
router.post('/event-pictures/:user_id', upload.array('files', MAX_FILES), upload_middlewares_1.restrictUploadToMax, upload_controller_1.uploadEventPicture);
router.post('/videos-audio/:user_id', videoAudioUpload.array('files', MAX_FILES), upload_middlewares_1.restrictUploadToMax, upload_controller_1.uploadEventVideosORAudio);
// router.post('/media/:user_id', videoAudioUpload.array('files', MAX_FILES), restrictUploadToMax, trimVidoes, uploadMedia)
router.post('/highlight/:user_id', upload.array('files', MAX_FILES), upload_middlewares_1.restrictUploadToMax, upload_controller_1.uploadHighlights);
router.post('/profilepic/:user_id', upload.single('file'), upload_middlewares_1.restrictUploadToMax, upload_controller_1.uploadProfilePicture);
router.post('/backgroundpic/:user_id', upload.single('file'), upload_middlewares_1.restrictUploadToMax, upload_controller_1.uploadBackgroundPicture);
exports.default = router;
