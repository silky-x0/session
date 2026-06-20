"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAiChat = void 0;
const aiFactory_1 = require("./ai/aiFactory");
const errorHandler_1 = require("../middleware/errorHandler");
const handleAiChat = async ({ prompt, codeContext, cursorLine, }) => {
    const systemLines = [
        "You are an AI coding assistant embedded inside a Monaco code editor.",
        "You must ONLY answer programming-related questions. For any other topic, reply exactly with: I cannot answer that.",
        "If required information is missing or ambiguous, ask a clarifying question before answering. Never guess.",
        "Answer only what is explicitly asked. Do not add extra explanations unless requested.",
    ];
    if (codeContext) {
        systemLines.push(`Editor context:\n- Cursor line: ${cursorLine ?? "unknown"}\n- Code:\n\`\`\`\n${codeContext}\n\`\`\``);
    }
    const messages = [
        { role: "system", content: systemLines.join("\n\n") },
        { role: "user", content: prompt },
    ];
    const provider = aiFactory_1.AIFactory.getProvider();
    const response = await provider.generateResponse(messages);
    if (!response) {
        throw new errorHandler_1.AppError(502, "Failed to generate content from AI");
    }
    return response;
};
exports.handleAiChat = handleAiChat;
