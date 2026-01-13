import { OpenRouter } from "@openrouter/sdk";
import { config } from "./env";

export const openRouter = new OpenRouter({
  apiKey: config.openRouterApiKey,
  httpReferer: config.frontendUrl || "http://localhost:5173", // Update with production URL when deployed
  xTitle: "Session Editor",
});