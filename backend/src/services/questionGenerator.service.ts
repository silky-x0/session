import { patchLiveblocksQuestionSlot, seedQuestionTextSlot } from "./liveblocks.service";
import { generateAIContentGemini } from "./gemini.service";
import { buildFollowUpPrompt } from "./ai/prompts";
import { normalizeLanguage } from "../utils/languageMapper";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateRemainingQuestions(
  roomId: string,
  originalPrompt: string,
  type: "problem" | "profile",
  previousTitles: string[],
  startFromIndex: number = 1
): Promise<void> {
  for (let i = startFromIndex; i <= 4; i++) {
    // Mark slot as generating
    await patchLiveblocksQuestionSlot(roomId, i, { status: "generating", version: 0 });

    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      try {
        const followUpPrompt = buildFollowUpPrompt(type, originalPrompt, previousTitles, i + 1);
        const result = await generateAIContentGemini(followUpPrompt);
        
        if (result.title) {
            previousTitles.push(result.title);
        }

        await patchLiveblocksQuestionSlot(roomId, i, {
          status: "ready",
          title: result.title,
          difficulty: result.difficulty,
          question: result.question,
          language: normalizeLanguage(result.language),
          hints: result.hints,
          complexity: result.complexity,
          starterCode: result.starter_code,
          fullSolution: result.content,
          version: 1,
        });
        
        if (result.starter_code || result.content) {
            await seedQuestionTextSlot(roomId, i, result.starter_code || result.content);
        }

        success = true;
      } catch (err) {
        attempts++;
        if (attempts < 3) {
          await sleep(1000 * 2 ** attempts); // 2s, 4s backoff
        }
      }
    }

    if (!success) {
      await patchLiveblocksQuestionSlot(roomId, i, { status: "error" });
    }
  }
}
