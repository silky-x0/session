import { Request, Response } from "express";
import { handleAiChat } from "../services/aichat.service";
import { AppError } from "../middleware/errorHandler";
import { PAYLOAD_LIMITS, assertSizeLimit } from "../utils/payloadLimits";

const MAX_HISTORY_ENTRIES = PAYLOAD_LIMITS.historyEntries;

export const chatWithAI = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt, codeContext, cursorLine, history } = req.body;

  if (!prompt) {
    throw new AppError(400, "Prompt is required");
  }

  assertSizeLimit(prompt, PAYLOAD_LIMITS.promptBytes, "prompt");
  assertSizeLimit(codeContext, PAYLOAD_LIMITS.codeContextBytes, "codeContext");
  if (Array.isArray(history) && history.length > MAX_HISTORY_ENTRIES) {
    throw new AppError(413, `'history' exceeds the maximum of ${MAX_HISTORY_ENTRIES} entries`);
  }

  const response = await handleAiChat({ prompt, codeContext, cursorLine, history });

  res.json({ response });
};

