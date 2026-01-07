import { Request, Response } from "express";
import { generateSessionContent } from "../services/aiService";
import { initializeDoc } from "../services/yjsService";

export const createAiSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            res.status(400).json({ error: "Prompt is required" });
            return;
        }

        // Generate content from AI
        const aiResponse = await generateSessionContent(prompt);
        
        // Generate a random room ID
        const roomId = Math.random().toString(36).substring(2, 9);
        
        // Seed the Yjs document
        initializeDoc(roomId, aiResponse.content, aiResponse.language);
        
        res.json({ roomId });
        
    } catch (error) {
        console.error("AI Session Error:", error);
        res.status(500).json({ error: "Failed to create AI session" });
    }
};
