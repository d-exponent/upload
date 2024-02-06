"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const connection = {
    isActive: false,
};
const connectMongo = async () => {
    if (connection.isActive === true)
        return 'Connection is active 🐱‍🏍';
    try {
        await mongoose_1.default.connect(env_1.default.DB_URL);
        connection.isActive = true;
        return 'Connected to mongodb successfully 👍✔';
    }
    catch (e) {
        connection.isActive = false;
        return Promise.reject(e instanceof mongoose_1.MongooseError ? e.message : 'Error🛑: could not connect to mongoDB');
    }
};
exports.connectMongo = connectMongo;
