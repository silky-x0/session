import * as Y from "yjs";

const docs = new Map<string, Y.Doc>();

export const getYDoc = (roomName: string): Y.Doc => {
  if (!docs.has(roomName)) {
    docs.set(roomName, new Y.Doc());
  }
  return docs.get(roomName)!;
};

export const initializeDoc = (
  roomName: string,
  content: string,
  language: string,
  starterCode?: string,
  title?: string,
  difficulty?: string,
  hints?: string[],
  complexity?: { time: string; space: string },
  question?: string
) => {
  const doc = getYDoc(roomName);
  const monacoText = doc.getText("monaco");

  if (monacoText.length === 0) {
    doc.transact(() => {
      const initialContent = starterCode || content;
      monacoText.insert(0, initialContent);

      const metaMap = doc.getMap("meta");
      metaMap.set("language", language);

      if (title) metaMap.set("title", title);
      if (difficulty) metaMap.set("difficulty", difficulty);
      if (question) metaMap.set("question", question);
      if (hints && hints.length > 0) metaMap.set("hints", JSON.stringify(hints));
      if (complexity) metaMap.set("complexity", JSON.stringify(complexity));
      
      // If starterCode exists, store the full solution separately
      if (starterCode) {
        metaMap.set("starterCode", starterCode);
        metaMap.set("fullSolution", content);
      }
    });
  }
};
