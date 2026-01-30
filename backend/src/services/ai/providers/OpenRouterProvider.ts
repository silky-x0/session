import { openRouter } from "../../../config/openRouter";
import { aiConfig } from "../../../config/ai.config";
import { AIProvider, AIMessage, AIProviderError } from "../types";

export class OpenRouterProvider implements AIProvider {
  
  async generateResponse(messages: AIMessage[], jsonMode?: boolean): Promise<string> {
    try {
        //Safe fallback
      const modelId = aiConfig.provider === 'openrouter' ? aiConfig.model : 'mistralai/mistral-7b-instruct';

      const completion = await openRouter.chat.send({
        model: modelId,
        messages: messages.map(m => ({
            role: m.role,
            content: m.content
        })),
        // OpenRouter/OpenAI often supports response_format for JSON
        ...(jsonMode && { response_format: { type: "json_object" } }) 
      });

      let text = completion.choices[0]?.message?.content;

      if (!text) {
        throw new Error("Empty response from OpenRouter");
      }

      // Handle cases where text might be an array (rare but possible in some SDK typings)
      if (Array.isArray(text)) {
        text = text.map((item: any) => ("text" in item ? item.text : "")).join("");
      }

      return String(text).trim();
    } catch (error) {
      throw new AIProviderError("OpenRouter generation failed", "OpenRouter", error);
    }
  }
}
