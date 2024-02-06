"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync = (func) => {
    return async (req, res, next) => func(req, res, next).catch(next);
};
exports.default = catchAsync;
