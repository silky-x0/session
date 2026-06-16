import * as Y from "yjs";
import { liveblocks } from "../config/liveblock";

type AIResponse = {
  content: string;
  language: string;
  starterCode?: string;
  title?: string;
  difficulty?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  question?: string;
};

export const seedLiveblocksRoom = async (
  roomId: string,
  aiResponse: AIResponse,
) => {
  const doc = new Y.Doc();

  doc.transact(() => {
    const monacoText = doc.getText("monaco");

    const initialContent = aiResponse.starterCode || aiResponse.content;
    monacoText.insert(0, initialContent);

    const metaMap = doc.getMap("meta");
    metaMap.set("language", aiResponse.language);

    if (aiResponse.title) metaMap.set("title", aiResponse.title);
    if (aiResponse.difficulty) metaMap.set("difficulty", aiResponse.difficulty);
    if (aiResponse.question) metaMap.set("question", aiResponse.question);
    if (aiResponse.hints && aiResponse.hints.length > 0)
      metaMap.set("hints", JSON.stringify(aiResponse.hints));
    if (aiResponse.complexity)
      metaMap.set("complexity", JSON.stringify(aiResponse.complexity));

    // If starterCode exists, store the full solution separately
    if (aiResponse.starterCode) {
      metaMap.set("starterCode", aiResponse.starterCode);
      metaMap.set("fullSolution", aiResponse.content);
    }
  });

  const update = Y.encodeStateAsUpdate(doc);

  // Room must exist before we can push Yjs data into it
  await liveblocks.createRoom(roomId, { defaultAccesses: ["room:write"] });
  await liveblocks.sendYjsBinaryUpdate(roomId, update);

  doc.destroy();
};
