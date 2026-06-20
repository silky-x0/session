"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const genai_1 = require("@google/genai");
const env_1 = require("../../../config/env");
const ai_config_1 = require("../../../config/ai.config");
const types_1 = require("../types");
class GeminiProvider {
    constructor() {
        this.client = new genai_1.GoogleGenAI({ apiKey: env_1.config.geminiApiKey });
    }
    async generateResponse(messages, jsonMode = false) {
        try {
            const modelId = ai_config_1.aiConfig.provider === 'gemini' ? ai_config_1.aiConfig.model : 'gemini-2.5-flash';
            // Gemini "system" prompts are often better handled as direct parameters or initial prompts
            // But newer APIs support system instructions. We will map them carefully.
            const contents = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));
            const systemMessage = messages.find(m => m.role === 'system');
            const response = await this.client.models.generateContent({
                model: modelId,
                contents,
                config: {
                    responseMimeType: jsonMode ? "application/json" : "text/plain",
                    systemInstruction: systemMessage ? systemMessage.content : undefined,
                }
            });
            const text = response.text;
            if (!text) {
                throw new Error("Empty response from Gemini");
            }
            return text;
        }
        catch (error) {
            throw new types_1.AIProviderError("Gemini generation failed", "Gemini", error);
        }
    }
}
exports.GeminiProvider = GeminiProvider;
