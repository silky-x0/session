import { GoogleGenAI } from "@google/genai";
import { config } from "../config/env";

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const generateSessionContent = async (prompt: string) => {
  try {
    const systemPrompt = `
      You are an expert coding assistant. The user will provide a prompt (a problem description, a request for a snippet, or an interview topic).
      You must return a valid JSON object with the following structure:
      {
        "language": "string (e.g., python, javascript, typescript, java, cpp, go, html, css, json)",
        "content": "string (code snippet or template with comments explaining the approach)"
      }
      Do not include markdown formatting like \`\`\`json. Return raw JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
          responseMimeType: "application/json"
      }
    });

    const text = response.text;
    
    if (!text) {
        throw new Error("No content generated");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content from AI");
  }
};
