import { AIFactory } from "./ai/aiFactory";
import { AIMessage } from "./ai/types";
import { AppError } from "../middleware/errorHandler";

export interface AiMessageHistory {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatRequest {
  prompt: string;
  codeContext?: string;
  cursorLine?: number;
  history?: AiMessageHistory[];
}

export const handleAiChat = async ({
  prompt,
  codeContext,
  cursorLine,
  history,
}: AiChatRequest) => {
  const systemLines = [
    "You are an AI coding assistant and tutor embedded inside a Monaco code editor.",
    "You must ONLY answer programming-related questions. For any other topic, reply exactly with: I cannot answer that.",
    "If required information is missing or ambiguous, ask a clarifying question before answering. Never guess.",
    "Answer only what is explicitly asked. Do not add extra explanations unless requested.",
    "For compilation, execution, or syntax errors (Explain & Fix), explain the error root cause clearly and suggest a targeted, minimal fix.",
    "For logical coding challenges or requests to solve problems, practice progressive hints: do NOT give full solution code immediately. Provide nudge-based, conceptual hints and guide the user step-by-step so they can learn to write the code themselves.",
    "When explaining complex algorithms or code structures, provide a clear, step-by-step execution walkthrough breaking down logic, operations, and complexities."
  ];

  if (codeContext) {
    systemLines.push(
      `Editor context:\n- Cursor line: ${cursorLine ?? "unknown"}\n- Code:\n\`\`\`\n${codeContext}\n\`\`\``
    );
  }

  const messages: AIMessage[] = [
    { role: "system", content: systemLines.join("\n\n") },
  ];

  const MAX_HISTORY = 10;
  if (history && history.length > 0) {
    const slicedHistory = history.slice(-MAX_HISTORY);
    slicedHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

  messages.push({ role: "user", content: prompt });

  const provider = AIFactory.getProvider();
  const response = await provider.generateResponse(messages);

  if (!response) {
    throw new AppError(502, "Failed to generate content from AI");
  }

  return response;
};
