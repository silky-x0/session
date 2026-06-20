"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIFactory = void 0;
const ai_config_1 = require("../../config/ai.config");
const GeminiProvider_1 = require("./providers/GeminiProvider");
const OpenRouterProvider_1 = require("./providers/OpenRouterProvider");
class AIFactory {
    static getProvider() {
        // If provider config changed, reset instance
        if (this.currentProvider !== ai_config_1.aiConfig.provider) {
            this.instance = null;
        }
        if (!this.instance) {
            switch (ai_config_1.aiConfig.provider) {
                case 'gemini':
                    this.instance = new GeminiProvider_1.GeminiProvider();
                    break;
                case 'openrouter':
                    this.instance = new OpenRouterProvider_1.OpenRouterProvider();
                    break;
                default:
                    throw new Error(`Unknown AI Provider: ${ai_config_1.aiConfig.provider}`);
            }
            this.currentProvider = ai_config_1.aiConfig.provider;
        }
        return this.instance;
    }
}
exports.AIFactory = AIFactory;
AIFactory.instance = null;
AIFactory.currentProvider = null;
