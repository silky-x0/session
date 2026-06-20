"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const execute_service_1 = require("../services/execute.service");
const executeCode = async (req, res) => {
    const { language, code } = req.body;
    if (!code || !language) {
        throw new errorHandler_1.AppError(400, "Both 'language' and 'code' fields are required");
    }
    if (!execute_service_1.supportedLanguages.includes(language.toLowerCase())) {
        throw new errorHandler_1.AppError(400, `Unsupported language: "${language}". Supported: ${execute_service_1.supportedLanguages.join(", ")}`);
    }
    const result = await (0, execute_service_1.handleCodeExecution)({ language, code });
    res.json(result);
};
exports.executeCode = executeCode;
