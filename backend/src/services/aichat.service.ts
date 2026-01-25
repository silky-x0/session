import { openRouter } from "../config/openRouter";

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

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
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

    const completion = await openRouter.chat.send({
      model: "mistralai/devstral-2512:free",
      messages,
    });

    let text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new Error("No content generated");
    }

    if (Array.isArray(text)) {
      text = text.map((item) => ("text" in item ? item.text : "")).join("");
    }

    return String(text).trim();
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    throw new Error("Failed to generate content from OpenRouter");
  }
};
