import { Request, Response } from "express";
import { seedLiveblocksRoom } from "../services/liveblocks.service";
// import { generateAIContent } from "../services/session.service";
import { generateAIContentGemini } from "../services/gemini.service";
import { normalizeLanguage } from "../utils/languageMapper";
import { AppError } from "../middleware/errorHandler";
import { PAYLOAD_LIMITS, assertSizeLimit } from "../utils/payloadLimits";
import { classifyPrompt } from "../services/ai/promptClassifier";
import { generateRemainingQuestions } from "../services/questionGenerator.service";

export const createAiSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new AppError(400, "Prompt is required");
  }

  assertSizeLimit(prompt, PAYLOAD_LIMITS.promptBytes, "prompt");

  let aiResponse;
  let promptType: "problem" | "profile" = "problem";
  
  try {
    const [response, type] = await Promise.all([
      generateAIContentGemini(prompt),
      classifyPrompt(prompt)
    ]);
    aiResponse = response;
    promptType = type;
  } catch (error: any) {
    throw new AppError(500, "Failed to create AI session");
  }

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

  res.json({ roomId, promptType });
};

export const generateRemainingController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { roomId, prompt, promptType, generatedTitles } = req.body;

  if (!roomId || !prompt || !promptType || !generatedTitles) {
    throw new AppError(400, "Missing required fields");
  }

  // Fire and forget
  generateRemainingQuestions(roomId, prompt, promptType, generatedTitles).catch((err) => {
    console.error("Error generating remaining questions:", err);
  });

  res.status(202).json({ message: "Generation started" });
};