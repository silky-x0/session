"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAiSession = void 0;
const liveblocks_service_1 = require("../services/liveblocks.service");
// import { generateAIContent } from "../services/session.service";
const gemini_service_1 = require("../services/gemini.service");
const languageMapper_1 = require("../utils/languageMapper");
const errorHandler_1 = require("../middleware/errorHandler");
const createAiSession = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        throw new errorHandler_1.AppError(400, "Prompt is required");
    }
    // Generate content from AI (Kimi)
    // const aiResponse = await generateAIContent(prompt);
    // Generate content (Gemini)
    const aiResponse = await (0, gemini_service_1.generateAIContentGemini)(prompt);
    const normalizedLanguage = (0, languageMapper_1.normalizeLanguage)(aiResponse.language);
    // Generate a random room ID
    const roomId = crypto.randomUUID().slice(0, 8);
    // Seed the Yjs document into Liveblocks cloud
    await (0, liveblocks_service_1.seedLiveblocksRoom)(roomId, {
        content: aiResponse.content,
        language: normalizedLanguage,
        starterCode: aiResponse.starter_code,
        title: aiResponse.title,
        difficulty: aiResponse.difficulty,
        hints: aiResponse.hints,
        complexity: aiResponse.complexity,
        question: aiResponse.question,
    });
    res.json({ roomId });
};
exports.createAiSession = createAiSession;
