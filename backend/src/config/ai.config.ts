import dotenv from 'dotenv';
dotenv.config();

export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'openrouter',
  model: process.env.AI_MODEL || 'arcee-ai/trinity-mini:free',
  temperature: 0.7,
};
