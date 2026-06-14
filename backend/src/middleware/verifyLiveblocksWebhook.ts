import { WebhookHandler } from "@liveblocks/node";
import { config } from "../config/env";
import { Request,Response,NextFunction } from "express";

const webhookHandler = new WebhookHandler(config.liveBlocksWebhookSecret);

export const verifyLiveblocksWebhook = (req: Request,res: Response,next: NextFunction):void => {
    try {
        const event = webhookHandler.verifyRequest({
            headers: req.headers,
            rawBody: req.body,
        });

        (req as any).liveblocks = event;
        next();

    } catch(error) {
        console.error(error);
        res.status(400).json({message: 'Invalid webhook'})
    }
}
