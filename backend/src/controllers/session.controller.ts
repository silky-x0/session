import { Request, Response } from "express";
import { initializeDoc } from "../services/yjs.service";
import { generateOpenRouterContent } from "../services/session.service";
import { normalizeLanguage } from "../utils/languageMapper";
import { AppError } from "../middleware/errorHandler";

export const createAiSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new AppError(400, "Prompt is required");
  }

  // Generate content from AI
  const aiResponse = await generateOpenRouterContent(prompt);

  const normalizedLanguage = normalizeLanguage(aiResponse.language);


  // Generate a random room ID
  const roomId = crypto.randomUUID().slice(0, 8);

  // Seed the Yjs document
  initializeDoc(
    roomId,
    aiResponse.content,
    normalizedLanguage,
    aiResponse.starter_code,
    aiResponse.title,
    aiResponse.difficulty,
    aiResponse.hints,
    aiResponse.complexity,
    aiResponse.question
  );

  res.json({ roomId });
};