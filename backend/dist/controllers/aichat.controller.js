"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const aichat_service_1 = require("../services/aichat.service");
const errorHandler_1 = require("../middleware/errorHandler");
const chatWithAI = async (req, res) => {
    const { prompt, codeContext, cursorLine } = req.body;
    if (!prompt) {
        throw new errorHandler_1.AppError(400, "Prompt is required");
    }
    const response = await (0, aichat_service_1.handleAiChat)({ prompt, codeContext, cursorLine });
    res.json({ response });
};
exports.chatWithAI = chatWithAI;
