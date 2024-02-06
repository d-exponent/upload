"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wildRoutesHandler = exports.globalErrorHandler = void 0;
const http_status_1 = require("http-status");
const env_1 = require("../env");
const ApiError_1 = require("../utils/ApiError");
const globalErrorHandler = (err, _, res, __) => {
    const response = {
        success: false,
        error: true,
        message: err.message || 'Something went wrong',
    };
    const e = {
        ...err,
        name: err.name,
        stack: err.stack,
    };
    res.status(err.statusCode || 500).json(env_1.isProduction ? response : { ...response, ...e });
};
exports.globalErrorHandler = globalErrorHandler;
const wildRoutesHandler = ({ method, originalUrl }, _, next) => {
    const error = new ApiError_1.ApiError(http_status_1.METHOD_NOT_ALLOWED, `${method.toUpperCase()}: ${originalUrl} does not exist on this server`);
    next(error);
};
exports.wildRoutesHandler = wildRoutesHandler;
