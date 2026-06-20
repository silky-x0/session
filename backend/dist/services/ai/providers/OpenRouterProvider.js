"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const openRouter_1 = require("../../../config/openRouter");
const ai_config_1 = require("../../../config/ai.config");
const types_1 = require("../types");
class OpenRouterProvider {
    async generateResponse(messages, jsonMode) {
        try {
            //Safe fallback
            const modelId = ai_config_1.aiConfig.provider === 'openrouter' ? ai_config_1.aiConfig.model : 'mistralai/mistral-7b-instruct';
            const completion = await openRouter_1.openRouter.chat.send({
                model: modelId,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                // OpenRouter/OpenAI often supports response_format for JSON
                ...(jsonMode && { response_format: { type: "json_object" } })
            });
            let text = completion.choices[0]?.message?.content;
            if (!text) {
                throw new Error("Empty response from OpenRouter");
            }
            // Handle cases where text might be an array (rare but possible in some SDK typings)
            if (Array.isArray(text)) {
                text = text.map((item) => ("text" in item ? item.text : "")).join("");
            }
            return String(text).trim();
        }
        catch (error) {
            throw new types_1.AIProviderError("OpenRouter generation failed", "OpenRouter", error);
        }
    }
}
exports.OpenRouterProvider = OpenRouterProvider;
