import { Request, Response } from "express";
import { WebhookEvent } from "@liveblocks/node";
import { handleUserLeft } from "./userleft.controller";
import { handleUserEntered } from "./userentered.controller";

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const event = (req as any).liveblocks as WebhookEvent;

  if (event.type === "userLeft") {
    await handleUserLeft(event);
  } else if (event.type === "userEntered") {
    await handleUserEntered(event);
  }

  res.status(200).send("OK");
};
