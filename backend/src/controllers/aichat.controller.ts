import { Request, Response } from "express";
import { handleAiChat } from "../services/aichat.service";
import { AppError } from "../middleware/errorHandler";

export const chatWithAI = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt, codeContext, cursorLine } = req.body;

  if (!prompt) {
    throw new AppError(400, "Prompt is required");
  }

  const response = await handleAiChat({ prompt, codeContext, cursorLine });

  res.json({ response });
};

