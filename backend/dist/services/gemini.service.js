"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIContentGemini = void 0;
const genai_1 = require("@google/genai");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
// This service uses its own dedicated model, independent of the global aiConfig
const ai = new genai_1.GoogleGenAI({ apiKey: env_1.config.geminiApiKey });
const SESSION_MODEL = "gemini-2.5-flash";
const generateAIContentGemini = async (prompt) => {
    const systemPrompt = `
  You are an expert technical interview coach. The user will provide a problem or topic.
  Return a raw JSON object (no markdown) with this structure:
  {
    "title": "Short descriptive title",
    "language": "lowercase language identifier (use: javascript, typescript, python, cpp, java, go, rust, c, html, css, json)",
    "content": "The code template or solution",
    "difficulty": "Easy | Medium | Hard",
    "starter_code": "A boilerplate version with just the function signature and docstrings",
    "hints": ["Hint 1 for the interviewer", "Hint 2 for the interviewer"],
    "complexity": { "time": "O(...)", "space": "O(...)" },
    "question": "the question given by user if leetcode paste exact question with 1 example if not then generate a question according to user prompt"
  }
  
  IMPORTANT: For the "language" field:
  - Use "cpp" for C++, NOT "c++" or "C++"
  - Use "python" for Python
  - Use "javascript" for JavaScript
  - Use "typescript" for TypeScript
  - Use "java" for Java
  - Use "go" for Go/Golang
  
  If the prompt is an interview topic, provide a classic problem associated with it. 
  Ensure the 'content' includes clear comments explaining the logic for pair learning.
`;
    const response = await ai.models.generateContent({
        model: SESSION_MODEL,
        contents: prompt,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            thinkingConfig: {
                thinkingBudget: 10,
            },
        },
    });
    const raw = response.text;
    if (!raw) {
        throw new errorHandler_1.AppError(501, "No content generated");
    }
    return JSON.parse(raw);
};
exports.generateAIContentGemini = generateAIContentGemini;
