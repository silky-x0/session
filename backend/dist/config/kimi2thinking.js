"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("./env");
exports.openai = new openai_1.default({
    apiKey: env_1.config.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});
