"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUploadedEvent = exports.updateUserProfilePicture = exports.updateBackgroundImage = exports.createHighlight = exports.createUpload = void 0;
const Upload_1 = require("../models/Upload");
const User_1 = require("../models/User");
const createUpload = async (data) => Upload_1.UploadModel.create(data);
exports.createUpload = createUpload;
const createHighlight = async (data) => {
    return await Upload_1.UploadModel.create({
        user: data.user,
        event: data.event,
        highlight: [
            {
                caption: data.caption,
                mediaSourceCover: data.mediaSourceCover,
                mediaSourceOriginal: data.mediaSourceOriginal,
                textHighLight: data.textHighLight,
            },
        ],
    });
};
exports.createHighlight = createHighlight;
const updateBackgroundImage = (user_id, location) => {
    return User_1.UserModel.findByIdAndUpdate(user_id, { backgroundBanner: location }, { new: true });
};
exports.updateBackgroundImage = updateBackgroundImage;
const updateUserProfilePicture = async (user_id, location) => {
    return User_1.UserModel.findByIdAndUpdate(user_id, { profilePhoto: location }, { new: true });
};
exports.updateUserProfilePicture = updateUserProfilePicture;
const fetchUploadedEvent = async (data) => {
    return await Upload_1.UploadModel.find(data).populate('user event').sort({ createdAt: -1 });
};
exports.fetchUploadedEvent = fetchUploadedEvent;
