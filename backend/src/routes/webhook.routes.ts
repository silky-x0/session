import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { handleWebhook } from "../controllers/webhook.controller";
import { verifyLiveblocksWebhook } from "../middleware/verifyLiveblocksWebhook";

const router = Router();

router.use(verifyLiveblocksWebhook);
router.post("/", asyncHandler(handleWebhook));

export default router;