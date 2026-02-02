import dotenv from "dotenv";

dotenv.config();


const getCorsOrigin = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://session-ecru.vercel.app';
  }
  return '*';
};

export const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openRouterApiKey: process.env.OPEN_ROUTER_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  cors: {
    origin: getCorsOrigin(),
    credentials: process.env.NODE_ENV === 'production',
  },
};
