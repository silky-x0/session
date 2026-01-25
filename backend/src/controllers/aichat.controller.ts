import { Request, Response } from "express";
import { handleAiChat } from "../services/aichat.service";

export const chatWithAI = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt, codeContext, cursorLine } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const response = await handleAiChat({ prompt, codeContext, cursorLine });

    res.json({ response });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};
