import { Request, Response } from "express";
// import { generateSessionContent } from "../services/aiService";
import { initializeDoc } from "../services/yjs.service";
import { generateOpenRouterContent } from "../services/session.service";
import { normalizeLanguage } from "../utils/languageMapper";
// import { handleAiChat } from "../services/aichat.service";

export const createAiSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    // Generate content from AI
    // const aiResponse = await generateSessionContent(prompt);
    const aiResponse = await generateOpenRouterContent(prompt);

    const normalizedLanguage = normalizeLanguage(aiResponse.language);
    console.log(
      `AI returned language: "${aiResponse.language}" → normalized to: "${normalizedLanguage}"`
    );

    // Generate a random room ID
    const roomId = Math.random().toString(36).substring(2, 9);

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
    console.log("AI Response:", aiResponse);

    res.json({ roomId });
  } catch (error) {
    console.error("AI Session Error:", error);
    res.status(500).json({ error: "Failed to create AI session" });
  }
};