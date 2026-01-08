import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openRouterApiKey: process.env.OPEN_ROUTER_KEY,
  frontendUrl: process.env.FRONTEND_URL,
};
