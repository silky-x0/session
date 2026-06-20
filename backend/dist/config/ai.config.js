"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.aiConfig = {
    provider: process.env.AI_PROVIDER || "gemini",
    model: process.env.AI_MODEL || "gemini-2.5-flash",
    temperature: 0.7,
};
