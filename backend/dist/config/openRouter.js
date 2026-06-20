"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openRouter = void 0;
const sdk_1 = require("@openrouter/sdk");
const env_1 = require("./env");
exports.openRouter = new sdk_1.OpenRouter({
    apiKey: env_1.config.openRouterApiKey,
    httpReferer: env_1.config.frontendUrl || "http://localhost:5173", // Update with production URL when deployed
    xTitle: "Session Editor",
});
