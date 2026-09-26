import * as Y from "yjs";
import { liveblocks } from "../config/liveblock";

export type QuestionSlot = {
  status: "pending" | "generating" | "ready" | "error";
  title?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  question?: string;
  language?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  starterCode?: string;
  fullSolution?: string;
  version?: number;
};

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
    const q0Text = doc.getText("monaco-q0");

    const initialContent = aiResponse.starterCode || aiResponse.content;
    q0Text.insert(0, initialContent);

    const metaMap = doc.getMap("meta");
    metaMap.set("language", aiResponse.language);

    if (aiResponse.title) metaMap.set("title", aiResponse.title);
    if (aiResponse.difficulty) metaMap.set("difficulty", aiResponse.difficulty);
    if (aiResponse.question) metaMap.set("question", aiResponse.question);
    if (aiResponse.hints && aiResponse.hints.length > 0)
      metaMap.set("hints", JSON.stringify(aiResponse.hints));
    if (aiResponse.complexity)
      metaMap.set("complexity", JSON.stringify(aiResponse.complexity));

    if (aiResponse.starterCode) {
      metaMap.set("starterCode", aiResponse.starterCode);
      metaMap.set("fullSolution", aiResponse.content);
    }
    
    const yQuestions = doc.getArray("questions");
    
    const q0Slot = new Y.Map();
    q0Slot.set("status", "ready");
    if (aiResponse.title) q0Slot.set("title", aiResponse.title);
    if (aiResponse.difficulty) q0Slot.set("difficulty", aiResponse.difficulty);
    if (aiResponse.question) q0Slot.set("question", aiResponse.question);
    if (aiResponse.language) q0Slot.set("language", aiResponse.language);
    if (aiResponse.hints) q0Slot.set("hints", aiResponse.hints);
    if (aiResponse.complexity) q0Slot.set("complexity", aiResponse.complexity);
    if (aiResponse.starterCode) q0Slot.set("starterCode", aiResponse.starterCode);
    if (aiResponse.content) q0Slot.set("fullSolution", aiResponse.content);
    q0Slot.set("version", 1);

    const p1 = new Y.Map(); p1.set("status", "pending");
    const p2 = new Y.Map(); p2.set("status", "pending");
    const p3 = new Y.Map(); p3.set("status", "pending");
    const p4 = new Y.Map(); p4.set("status", "pending");

    yQuestions.insert(0, [q0Slot, p1, p2, p3, p4]);
  });

  const update = Y.encodeStateAsUpdate(doc);

  await liveblocks.createRoom(roomId, { defaultAccesses: ["room:write"] });
  await liveblocks.sendYjsBinaryUpdate(roomId, Buffer.from(update));

  doc.destroy();
};

export async function patchLiveblocksQuestionSlot(
  roomId: string,
  slotIndex: number,
  updates: Partial<QuestionSlot>
): Promise<void> {
  const currentBinary = await liveblocks.getYjsDocumentAsBinaryUpdate(roomId);

  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, new Uint8Array(currentBinary));

  let deltaUpdate: Uint8Array | null = null;
  ydoc.on("update", (update: Uint8Array) => {
    deltaUpdate = update;
  });

  ydoc.transact(() => {
    const yarray = ydoc.getArray<Y.Map<any>>("questions");
    const slot = yarray.get(slotIndex);
    if (slot) {
      Object.entries(updates).forEach(([key, value]) => {
        slot.set(key, value);
      });
    }
  });

  if (deltaUpdate) {
    await liveblocks.sendYjsBinaryUpdate(roomId, Buffer.from(deltaUpdate));
  }

  ydoc.destroy();
}

export async function seedQuestionTextSlot(
  roomId: string,
  slotIndex: number,
  content: string
): Promise<void> {
  const currentBinary = await liveblocks.getYjsDocumentAsBinaryUpdate(roomId);

  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, new Uint8Array(currentBinary));

  let deltaUpdate: Uint8Array | null = null;
  ydoc.on("update", (update: Uint8Array) => {
    deltaUpdate = update;
  });

  ydoc.transact(() => {
    const qText = ydoc.getText(`monaco-q${slotIndex}`);
    if (qText.length === 0 && content) {
      qText.insert(0, content);
    }
  });

  if (deltaUpdate) {
    await liveblocks.sendYjsBinaryUpdate(roomId, Buffer.from(deltaUpdate));
  }

  ydoc.destroy();
}
