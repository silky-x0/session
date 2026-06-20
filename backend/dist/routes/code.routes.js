"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const execute_controller_1 = require("../controllers/execute.controller");
const router = (0, express_1.Router)();
router.post("/execute", (0, asyncHandler_1.asyncHandler)(execute_controller_1.executeCode));
exports.default = router;
