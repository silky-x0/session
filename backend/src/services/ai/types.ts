export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIProviderError extends Error {
  constructor(message: string, public provider: string, public originalError?: any) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export interface AIProvider {
  /**
   * Generates a response from the AI model.
   * @param messages - Array of message history
   * @param jsonMode - Whether to force JSON output
   * @returns The generated text response
   * @throws {AIProviderError} If the provider fails
   */
  generateResponse(messages: AIMessage[], jsonMode?: boolean): Promise<string>;
}
