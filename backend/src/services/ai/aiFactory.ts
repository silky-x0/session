import { aiConfig } from "../../config/ai.config";
import { AIProvider } from "./types";
import { GeminiProvider } from "./providers/GeminiProvider";
import { OpenRouterProvider } from "./providers/OpenRouterProvider";

export class AIFactory {
  private static instance: AIProvider | null = null;
  private static currentProvider: string | null = null;

  static getProvider(): AIProvider {
    // If provider config changed, reset instance
    if (this.currentProvider !== aiConfig.provider) {
        this.instance = null;
    }

    if (!this.instance) {
      switch (aiConfig.provider) {
        case 'gemini':
          this.instance = new GeminiProvider();
          break;
        case 'openrouter':
          this.instance = new OpenRouterProvider();
          break;
        default:
          throw new Error(`Unknown AI Provider: ${aiConfig.provider}`);
      }
      this.currentProvider = aiConfig.provider;
    }
    
    return this.instance;
  }
}
