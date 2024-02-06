"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBucket = exports.checkBucket = exports.initBucket = void 0;
const env_1 = __importDefault(require("../../env"));
const bucketState = {
    isInit: false,
};
const initBucket = async (s3) => {
    // So we don't keep running checkBucket and createBucket after the first successfull initBucket call
    if (bucketState.isInit)
        return true;
    if (await (0, exports.checkBucket)(s3, env_1.default.AWS_OUTPUT_BUCKET)) {
        bucketState.isInit = true;
        return true;
    }
    if (await (0, exports.createBucket)(s3)) {
        bucketState.isInit = true;
        return true;
    }
    return false;
};
exports.initBucket = initBucket;
const checkBucket = async (s3, bucket) => {
    try {
        await s3.headBucket({ Bucket: bucket }).promise();
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
};
exports.checkBucket = checkBucket;
const createBucket = async (s3) => {
    const params = {
        Bucket: env_1.default.AWS_OUTPUT_BUCKET,
        CreateBucketConfiguration: {
            LocationConstraint: '',
        },
    };
    try {
        await s3.createBucket(params).promise();
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
};
exports.createBucket = createBucket;
