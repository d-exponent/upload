"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    DOB: {
        type: String,
        required: true,
    },
    fcmToken: {
        type: String,
        default: null,
    },
    interests: [{ type: String }],
    active: {
        type: Boolean,
        default: false,
    },
    suspended: {
        type: Boolean,
        default: false,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    country: {
        type: String,
    },
    state: {
        type: String,
    },
    geoLocation: {
        type: String,
    },
    currency: {
        type: String,
    },
    street: {
        type: String,
    },
    profileUrl: {
        type: String,
    },
    userName: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        default: null,
    },
    backgroundBanner: {
        type: String,
        default: null,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other',
    },
    occupation: {
        type: String,
        default: null,
    },
    organization: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
    },
    highlights: [
        {
            content: { type: String },
            timestamp: { type: Date },
        },
    ],
    contact: {
        socialHandles: {
            type: [String],
            default: [],
        },
        website: {
            type: String,
            default: null,
        },
        phone: {
            type: String,
            default: null,
        },
    },
    followerCount: {
        type: Number,
        default: 0,
    },
    followingCount: {
        type: Number,
        default: 0,
    },
    updates: [
        {
            type: String,
        },
    ],
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    // Subscription-related fields
    subscriptionArn: {
        type: String,
        default: null,
    },
    notificationPreferences: {
        eventUpdates: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        // Add more delivery protocol options as needed
    },
    // Notification history
    notificationHistory: [
        {
            notificationType: String,
            message: String,
            timestamp: { type: Date, default: Date.now },
            deliveryStatus: String,
        },
    ],
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
