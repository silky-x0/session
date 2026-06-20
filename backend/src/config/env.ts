import dotenv from "dotenv";

dotenv.config();


const getCorsOrigin = () => {
  // if (process.env.NODE_ENV === 'production') {
  //   return process.env.FRONTEND_URL || 'https://session-ecru.vercel.app';
  // }
  return '*';
};

export const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openRouterApiKey: process.env.OPEN_ROUTER_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  liveBlockSecretKey: process.env.LIVEBLOCKS_SECRET_KEY!,
  cors: {
    origin: getCorsOrigin(),
    credentials: process.env.NODE_ENV === 'production',
  },
  liveBlocksWebhookSecret: process.env.LIVEBLOCKS_WEBHOOK_SECRET!,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  jdoodleClientId: process.env.JDOODLE_CLIENT_ID,
  jdoodleClientSecret: process.env.JDOODLE_CLIENT_SECRET,
};
