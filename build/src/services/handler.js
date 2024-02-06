"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Params = void 0;
const client_elastic_transcoder_1 = require("@aws-sdk/client-elastic-transcoder");
const fs_1 = require("fs");
const utils_1 = require("./s3buckets/utils");
const env_1 = __importDefault(require("../env"));
const utils_2 = require("./s3buckets/utils");
const config_1 = require("../config");
const ApiError_1 = require("../utils/ApiError");
const http_status_1 = require("http-status");
const client = new client_elastic_transcoder_1.ElasticTranscoderClient({
    region: env_1.default.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: env_1.default.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.default.AWS_ACCESS_SECRET_KEY,
    },
});
const audioPipeline = '1688075020790-xpttmw';
const videoPipelineID = '1688075475898-a42ghp';
const s3Params = (file, type, altPath) => {
    const extension = file.path.split('.').pop();
    const { number, id, date } = (0, utils_2.getRandom)();
    return {
        Bucket: env_1.default.AWS_INPUT_BUCKET,
        Key: `events/${type}/${id}-taron-${type}-${date}_${number}.${extension}`,
        Body: (0, fs_1.createReadStream)(altPath ? altPath : file.path),
        ContentType: file.mimetype,
    };
};
exports.s3Params = s3Params;
const uploadSingleMediaToS3 = async (s3, file, type, pathsToRemove) => {
    let params;
    if (type === 'audio') {
        params = (0, exports.s3Params)(file, type);
        pathsToRemove.push(file.path);
        return s3.upload(params).promise();
    }
    const newPath = (0, utils_1.injectUniqueId)(file.path);
    await (0, utils_1.trimVideo)(file.path, newPath);
    params = (0, exports.s3Params)(file, type, newPath);
    pathsToRemove.push(file.path);
    pathsToRemove.push(newPath);
    return s3.upload(params).promise();
};
const handleUploadTranscode = async (s3, files, usedPaths) => {
    const validFiles = files.filter((file) => {
        const mimetype = (0, config_1.extractMimetype)(file);
        return mimetype === 'video' || mimetype === 'audio';
    });
    if (!validFiles.length)
        throw new ApiError_1.ApiError(http_status_1.BAD_REQUEST, 'Upload at least one video or audio file');
    const uploads = await Promise.all(validFiles.map((file) => {
        const mimetype = (0, config_1.extractMimetype)(file);
        return uploadSingleMediaToS3(s3, file, mimetype, usedPaths);
    }));
    return Promise.all(uploads.map((upload) => createSingleJob(upload.Key)));
};
exports.default = handleUploadTranscode;
const createSingleJob = async (Key) => {
    const isAudioJob = Key.split('/')[1] === 'audio';
    const PipelineId = isAudioJob ? audioPipeline : videoPipelineID;
    const PresetId = isAudioJob ? env_1.default.AUDIO_PRESET_ID : env_1.default.VIDEO_PRESET_ID;
    return jobCommands({
        PipelineId,
        Input: {
            Key,
            frame_rate: 'auto',
            resolution: 'auto',
            aspect_ratio: 'auto',
            container: 'auto',
        },
        Outputs: [{ Key, PresetId }],
    });
};
const jobCommands = async (input) => {
    const createJobCommand = new client_elastic_transcoder_1.CreateJobCommand(input);
    const response = await client.send(createJobCommand);
    if (!response || !response.Job)
        return Promise.reject('Could not get Job Command.');
    await waitForJobCompletion(response.Job.Id);
    const readJobCommand = new client_elastic_transcoder_1.ReadJobCommand({ Id: response.Job.Id });
    const jobDetails = await client.send(readJobCommand);
    if (!jobDetails || !jobDetails.Job || !jobDetails.Job.Outputs?.length)
        return Promise.reject('Could not read Job');
    const jobDetailsOutput = jobDetails.Job.Outputs[0];
    if (!jobDetailsOutput.Key)
        return Promise.reject('Could not get response credentials from job');
    const { Duration, FileSize, Key } = jobDetailsOutput;
    return {
        outputObjectURL: `https://${env_1.default.AWS_BUCKET_REGION}.amazonaws.com/${env_1.default.AWS_OUTPUT_BUCKET}/${Key}`,
        duration: Duration,
        filename: Key.split('/').pop(),
        filesize: FileSize,
    };
};
const waitForJobCompletion = async (jobId) => {
    while (true) {
        const readJobCommand = new client_elastic_transcoder_1.ReadJobCommand({ Id: jobId });
        const jobDetails = await client.send(readJobCommand);
        const status = jobDetails.Job.Status;
        if (status === 'Complete' || status === 'Error' || status === 'Canceled') {
            break;
        }
        await delay(2000); // Wait for 5 seconds before checking the job status again
    }
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
