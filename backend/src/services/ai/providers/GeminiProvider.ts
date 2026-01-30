import { GoogleGenAI } from "@google/genai";
import { config } from "../../../config/env";
import { aiConfig } from "../../../config/ai.config";
import { AIProvider, AIMessage, AIProviderError } from "../types";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }

  async generateResponse(messages: AIMessage[], jsonMode: boolean = false): Promise<string> {
    try {
      const modelId = aiConfig.provider === 'gemini' ? aiConfig.model : 'gemini-2.5-flash';
      
      // Gemini "system" prompts are often better handled as direct parameters or initial prompts
      // But newer APIs support system instructions. We will map them carefully.
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const systemMessage = messages.find(m => m.role === 'system');
      
      const response = await this.client.models.generateContent({
        model: modelId,
        contents,
        config: {
          responseMimeType: jsonMode ? "application/json" : "text/plain",
          systemInstruction: systemMessage ? systemMessage.content : undefined,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return text;
    } catch (error) {
      throw new AIProviderError("Gemini generation failed", "Gemini", error);
    }
  }
}
