"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplication = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = require("./routes");
const errors_middlewares_1 = require("./middlewares/errors.middlewares");
const upload_middlewares_1 = require("./middlewares/upload.middlewares");
const env_1 = require("./env");
const createApplication = () => {
    const app = (0, express_1.default)();
    app.set('trust proxy', 'loopback');
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    !env_1.isProduction && app.use((0, morgan_1.default)('dev'));
    app.use('/api/v1', upload_middlewares_1.initiateS3Bucket, routes_1.router);
    app.use('/*', errors_middlewares_1.wildRoutesHandler);
    app.use(errors_middlewares_1.globalErrorHandler);
    return app;
};
exports.createApplication = createApplication;
