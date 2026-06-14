import { Request, Response } from "express";
import { WebhookEvent } from "@liveblocks/node";

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const event = (req as any).liveblocks as WebhookEvent;

  if (event.type === "userLeft") {
    const { roomId, numActiveUsers } = event.data;
    // Phase 3: if numActiveUsers === 0 → scheduleRoomDeletion(roomId)
    console.log(`[USER_LEFT] roomId=${roomId} activeUsers=${numActiveUsers}`);
  }

  if (event.type === "userEntered") {
    const { roomId } = event.data;
    // Phase 3: cancelRoomDeletion(roomId) + broadcastDeletionPending if job exists
    console.log(`[USER_ENTERED] roomId=${roomId}`);
  }

  res.status(200).send("OK");
};
