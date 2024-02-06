"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const upload_router_1 = __importDefault(require("./upload.router"));
const router = express_1.default.Router();
exports.router = router;
router.use('/upload', upload_router_1.default);
