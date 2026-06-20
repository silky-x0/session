"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const code_routes_1 = __importDefault(require("./routes/code.routes"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.config.cors.origin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: env_1.config.cors.credentials,
}));
app.use("/webhook", express_1.default.raw({ type: "application/json" }), webhook_routes_1.default);
app.use(express_1.default.json());
app.use("/api/ai", ai_routes_1.default);
app.use("/api/code", code_routes_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
