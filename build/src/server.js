"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const app_1 = require("./app");
const env_1 = __importDefault(require("./env"));
const { PORT } = env_1.default;
(0, db_1.connectMongo)()
    .then((res) => {
    console.log(res);
    (0, app_1.createApplication)().listen(PORT, () => console.log('Server is running on port', PORT));
})
    .catch((e) => console.log(e.message));
