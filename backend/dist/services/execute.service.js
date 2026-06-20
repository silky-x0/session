"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCodeExecution = exports.supportedLanguages = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");

const LANGUAGE_MAP = {
    python: { language: "python3", versionIndex: "4" }, // Python 3.10.8
    javascript: { language: "nodejs", versionIndex: "4" }, // Node.js 18.0.0
    c: { language: "c", versionIndex: "5" }, // GCC (C)
    cpp: { language: "cpp", versionIndex: "5" }, // GCC (C++)
};
exports.supportedLanguages = Object.keys(LANGUAGE_MAP);

const handleCodeExecution = async ({ language, code, }) => {
    const jdoodleConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!jdoodleConfig) {
        throw new errorHandler_1.AppError(400, `Unsupported language: "${language}". Supported: ${exports.supportedLanguages.join(", ")}`);
    }
    const clientId = env_1.config.jdoodleClientId;
    const clientSecret = env_1.config.jdoodleClientSecret;
    if (!clientId || !clientSecret) {
        throw new errorHandler_1.AppError(500, "JDoodle API credentials are not configured in the server environment");
    }
    try {
        const response = await fetch("https://api.jdoodle.com/v1/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clientId,
                clientSecret,
                script: code,
                language: jdoodleConfig.language,
                versionIndex: jdoodleConfig.versionIndex,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`JDoodle API returned HTTP ${response.status}: ${errorText}`);
        }
        const result = (await response.json());
        // JDoodle combines stdout and stderr into output.
        // statusCode indicates compilation/execution status (200 is success).
        return {
            stdout: result.output || "",
            stderr: "",
            exitCode: result.statusCode === 200 ? 0 : result.statusCode,
            timedOut: false,
        };
    }
    catch (error) {
        console.error("❌ JDoodle Code Execution Error:", error);
        throw new errorHandler_1.AppError(500, `Failed to execute code via JDoodle: ${error.message || error}`);
    }
};
exports.handleCodeExecution = handleCodeExecution;
