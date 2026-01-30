import { AIFactory } from "./ai/aiFactory";
import { AIMessage } from "./ai/types";

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

    const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
    ];

    const provider = AIFactory.getProvider();
    const jsonString = await provider.generateResponse(messages, true); // validation done via jsonMode hints where supported
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Re-throw standardized or wrapped error? 
    // For now, keeping the original behavior but the error might be an AIProviderError
    throw new Error("Failed to generate content from AI"); 
  }
};
