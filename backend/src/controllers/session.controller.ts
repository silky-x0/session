import { Request, Response } from "express";
import { seedLiveblocksRoom } from "../services/liveblocks.service";
import { generateAIContent } from "../services/session.service";
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
  const aiResponse = await generateAIContent(prompt);

  const normalizedLanguage = normalizeLanguage(aiResponse.language);

  // Generate a random room ID
  const roomId = crypto.randomUUID().slice(0, 8);

  // Seed the Yjs document into Liveblocks cloud
  await seedLiveblocksRoom(roomId, {
    content: aiResponse.content,
    language: normalizedLanguage,
    starterCode: aiResponse.starter_code,
    title: aiResponse.title,
    difficulty: aiResponse.difficulty,
    hints: aiResponse.hints,
    complexity: aiResponse.complexity,
    question: aiResponse.question,
  });

  res.json({ roomId });
};