import dotenv from "dotenv";
dotenv.config();

export const aiConfig = {
  provider: process.env.AI_PROVIDER || "gemini",
  model: process.env.AI_MODEL || "gemini-2.5-flash",
  temperature: 0.7,
};
