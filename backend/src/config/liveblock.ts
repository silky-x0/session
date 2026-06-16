import { Liveblocks } from "@liveblocks/node";
import { config } from "./env";

export const liveblocks = new Liveblocks({
    secret: config.liveBlockSecretKey,
});
