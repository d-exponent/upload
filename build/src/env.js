"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = void 0;
require("dotenv/config");
const { env: enviroment } = process;
const unsanitizedEnv = {
    AWS_ACCESS_SECRET_KEY: enviroment.AWS_ACCESS_SECRET_KEY,
    AWS_ACCESS_KEY_ID: enviroment.AWS_ACCESS_KEY_ID,
    AWS_BUCKET_REGION: enviroment.AWS_BUCKET_REGION,
    DB_URL: enviroment.DB_URL,
    AWS_INPUT_BUCKET: enviroment.AWS_INPUT_BUCKET,
    AWS_OUTPUT_BUCKET: enviroment.AWS_OUTPUT_BUCKET,
    PORT: enviroment.PORT ? Number(enviroment.PORT) : 4555,
    NODE_ENV: enviroment.NODE_ENV ?? 'production',
    VIDEO_PRESET_ID: enviroment.VIDEO_PRESET_ID,
    AUDIO_PRESET_ID: enviroment.AUDIO_PRESET_ID,
};
const sanitizeConfig = (config = unsanitizedEnv) => {
    Object.entries(config).forEach(([key, value]) => {
        if (!value) {
            throw new Error(`${key} is missing from .env file`);
        }
    });
    return config;
};
const env = sanitizeConfig();
exports.isProduction = env.NODE_ENV === 'production';
exports.default = env;
