"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProviderError = void 0;
class AIProviderError extends Error {
    constructor(message, provider, originalError) {
        super(message);
        this.provider = provider;
        this.originalError = originalError;
        this.name = 'AIProviderError';
    }
}
exports.AIProviderError = AIProviderError;
