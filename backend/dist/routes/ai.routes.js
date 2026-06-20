"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_controller_1 = require("../controllers/session.controller");
const aichat_controller_1 = require("../controllers/aichat.controller");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
// All AI-related routes
router.post('/session', (0, asyncHandler_1.asyncHandler)(session_controller_1.createAiSession));
router.post('/chat', (0, asyncHandler_1.asyncHandler)(aichat_controller_1.chatWithAI));
exports.default = router;
