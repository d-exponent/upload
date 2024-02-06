"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEventVideosORAudio = exports.uploadProfilePicture = exports.uploadBackgroundPicture = exports.uploadEventPicture = exports.uploadHighlights = void 0;
const http_status_1 = require("http-status");
const upload_table_1 = require("../dbServices/upload.table");
const uploadToS3_1 = require("../services/s3buckets/uploadToS3");
const rimraf_1 = require("rimraf");
const handler_1 = __importDefault(require("../services/handler"));
const ApiError_1 = require("../utils/ApiError");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.uploadHighlights = (0, catchAsync_1.default)(async ({ s3, files, body: { event, user, type, textHighLight } }, res, next) => {
    if (!files) {
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, 'Upload at least one file'));
    }
    const acceptedTypes = ['image', 'text'];
    if (!acceptedTypes.includes(type)) {
        const message = `${acceptedTypes.map((t) => `<${t}>`).join(' ')} are the only accepted types`;
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, message));
    }
    let uploadRes = {};
    if (type !== 'image' && type !== 'text') {
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, '<type> must be an image or a text'));
    }
    if (type === 'image') {
        const imageBg = files;
        const fileArray = await (0, uploadToS3_1.uploadEventHighlightToS3)(s3, imageBg);
        uploadRes = await (0, upload_table_1.createHighlight)({
            user,
            event,
            highlight: fileArray.data,
        });
    }
    if (type === 'text') {
        uploadRes = await (0, upload_table_1.createUpload)({
            user,
            event,
            highLight: [{ textHighLight }],
        });
    }
    res.status(http_status_1.OK).json(uploadRes);
});
exports.uploadEventPicture = (0, catchAsync_1.default)(async (req, res, next) => {
    const files = req.files;
    if (!files) {
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, 'Upload at least one file'));
    }
    const imageEventData = await (0, uploadToS3_1.uploadImageEventToS3)(req.s3, files);
    if (!imageEventData.success) {
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, 'Bad Request'));
    }
    res.status(http_status_1.OK).json({
        error: false,
        message: 'Success!',
        data: imageEventData,
    });
});
exports.uploadBackgroundPicture = (0, catchAsync_1.default)(async ({ params, file, s3 }, res, next) => {
    if (!file)
        return next(new ApiError_1.ApiError(400, 'Please upload a file'));
    const bgUpload = await (0, uploadToS3_1.uploadProfileOrBgToS3)(s3, file, 'bg');
    res.status(http_status_1.OK).json({
        success: true,
        message: 'Background Image upload successful!',
        data: await (0, upload_table_1.updateBackgroundImage)(params.user_id, bgUpload.Location),
    });
});
exports.uploadProfilePicture = (0, catchAsync_1.default)(async ({ params, file, s3 }, res, next) => {
    if (!file)
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, 'Provide a file'));
    const profileUpload = await (0, uploadToS3_1.uploadProfileOrBgToS3)(s3, file, 'profile');
    res.status(http_status_1.OK).json({
        success: true,
        message: 'File upload successful!',
        data: await (0, upload_table_1.updateUserProfilePicture)(params.user_id, profileUpload.Location),
    });
});
exports.uploadEventVideosORAudio = (0, catchAsync_1.default)(async (req, res, next) => {
    const files = req.files;
    if (!files) {
        return next(new ApiError_1.ApiError(http_status_1.BAD_REQUEST, 'Upload at least one file'));
    }
    const pathsToDelete = [];
    res.status(http_status_1.OK).json({
        error: false,
        message: 'success',
        data: await (0, handler_1.default)(req.s3, files, pathsToDelete),
    });
    Promise.allSettled(pathsToDelete.map(path => (0, rimraf_1.rimraf)(path))).catch(console.error);
});
///////
// export const uploadMedia = catchAsync(
//   async ({ body: { event }, s3, file, params: { user_id: user } }: Request, res: Response, next: NextFunction) => {
//     if (!event) {
//       return next(new ApiError(BAD_REQUEST, 'The event is required'))
//     }
//     if (file == undefined) {
//       return next(new ApiError(BAD_REQUEST, 'The file is required'))
//     }
//     const mimetype = file.mimetype.split('/')[0]
//     const allowedMimetypes = ['video', 'audio']
//     if (!allowedMimetypes.includes(mimetype)) {
//       return next(new ApiError(BAD_REQUEST, 'File must be video or audio'))
//     }
//     let data = {}
//     if (mimetype === 'video') {
//       const videoUpload = await uploadMediaToS3(s3, file, 'video')
//       const triggerVideoUpload: any = await createJob(videoUpload, 'video')
//       if (triggerVideoUpload !== null) {
//         data = {
//           user,
//           event,
//           mediaSource: triggerVideoUpload.data.outputURL,
//           fileName: triggerVideoUpload.data.filename,
//           duration: triggerVideoUpload.data.duration,
//           fileSize: triggerVideoUpload.data.filesize,
//         }
//       }
//     }
//     if (mimetype === 'audio') {
//       const audioUpload = await uploadMediaToS3(s3, file, 'audio')
//       const triggerAudioUpload: any = await createJob(audioUpload, 'audio')
//       if (triggerAudioUpload !== null) {
//         data = {
//           user,
//           event,
//           mediaSource: triggerAudioUpload.data.outputURL,
//           fileName: triggerAudioUpload.data.filename,
//           duration: triggerAudioUpload.data.duration,
//           fileSize: triggerAudioUpload.data.filesize,
//         }
//       }
//     }
//     res.status(OK).json(await createUpload(data))
//   },
// )
