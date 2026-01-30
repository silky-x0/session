import { AIFactory } from "./ai/aiFactory";
import { AIMessage } from "./ai/types";

export interface AiChatRequest {
  prompt: string;
  codeContext?: string;
  cursorLine?: number;
}

export const handleAiChat = async ({
  prompt,
  codeContext,
  cursorLine,
}: AiChatRequest) => {
  try {

    const messages: AIMessage[] = [
      {
        role: "system",
        content: "You are an AI coding assistant embedded inside a Monaco code editor.",
      },
      {
        role: "system",
        content:
          "You must ONLY answer programming-related questions. For any other topic, reply exactly with: I cannot answer that.",
      },
      {
        role: "system",
        content:
          "If required information is missing or ambiguous, ask a clarifying question before answering. Never guess.",
      },
      {
        role: "system",
        content:
          "Answer only what is explicitly asked. Do not add extra explanations unless requested.",
      },
    ];

    if (codeContext) {
      messages.push({
        role: "system",
        content: `Editor context:
- Cursor line: ${cursorLine ?? "unknown"}
- Code:
\`\`\`
${codeContext}
\`\`\``,
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    const provider = AIFactory.getProvider();
    const response = await provider.generateResponse(messages);

    return response;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw new Error("Failed to generate content from AI");
  }
};
