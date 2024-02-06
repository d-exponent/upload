"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = void 0;
const client_elastic_transcoder_1 = require("@aws-sdk/client-elastic-transcoder");
const env_1 = __importDefault(require("../../env"));
const client = new client_elastic_transcoder_1.ElasticTranscoderClient({
    region: env_1.default.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: env_1.default.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.default.AWS_ACCESS_SECRET_KEY,
    },
});
const audioPipeline = '1688075020790-xpttmw';
const videoPipelineID = '1688075475898-a42ghp';
const createJob = async (data, type) => {
    const PipelineId = type === 'audio' ? audioPipeline : videoPipelineID;
    const auto = 'auto';
    let inputParamsArray = [];
    for (let i = 0; i < data.length; i++) {
        const Key = data[i].key;
        const inputParams = {
            PipelineId,
            Input: {
                Key,
                frame_rate: auto,
                resolution: auto,
                aspect_ratio: auto,
                container: auto,
            },
            Outputs: [{ Key, PresetId: '1351620000001-100200' }],
        };
        inputParamsArray.push(inputParams);
    }
    return jobsCommands(inputParamsArray);
};
exports.createJob = createJob;
const jobsCommands = async (inputs) => {
    let cJobCmd = [];
    let resArry = [];
    let readCmd = [];
    let results = [];
    for (let i = 0; i < inputs.length; i++) {
        const createJobCommand = new client_elastic_transcoder_1.CreateJobCommand(inputs[i]);
        cJobCmd.push(createJobCommand);
    }
    for (let j = 0; j < cJobCmd.length; j++) {
        const response = await client.send(cJobCmd[j]);
        resArry.push(response);
    }
    for (let k = 0; k < resArry.length; k++) {
        await waitForJobCompletion(resArry[k].Job.Id);
        const readJobCommand = new client_elastic_transcoder_1.ReadJobCommand({ Id: resArry[k].Job.Id });
        readCmd.push(readJobCommand);
    }
    for (let m = 0; m < readCmd.length; m++) {
        const jobDetails = await client.send(readCmd[m]);
        const jobDetailsOutput = jobDetails.Job.Outputs[0];
        const outputURL = jobDetailsOutput.Key;
        const outputObjectURL = `https://${env_1.default.AWS_BUCKET_REGION}.amazonaws.com/${env_1.default.AWS_OUTPUT_BUCKET}/${outputURL}`;
        const duration = jobDetailsOutput.Duration;
        const filename = jobDetailsOutput.Key.split('/').pop();
        const filesize = jobDetailsOutput.FileSize;
        const res = {
            outputObjectURL,
            duration,
            filename,
            filesize,
        };
        results.push(res);
    }
    return results;
};
const waitForJobCompletion = async (jobId) => {
    while (true) {
        const readJobCommand = new client_elastic_transcoder_1.ReadJobCommand({ Id: jobId });
        const jobDetails = await client.send(readJobCommand);
        const status = jobDetails.Job.Status;
        if (status === 'Complete' || status === 'Error' || status === 'Canceled') {
            break;
        }
        await delay(5000); // Wait for 5 seconds before checking the job status again
    }
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
