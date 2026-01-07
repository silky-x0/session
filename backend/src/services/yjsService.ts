import * as Y from "yjs";

const docs = new Map<string, Y.Doc>();

export const getYDoc = (roomName: string): Y.Doc => {
  if (!docs.has(roomName)) {
    docs.set(roomName, new Y.Doc());
  }
  return docs.get(roomName)!;
};

export const initializeDoc = (roomName: string, content: string, language: string) => {
    const doc = getYDoc(roomName);
    const monacoText = doc.getText("monaco");
    
    // Only initialize if empty to avoid overwriting existing work
    if (monacoText.length === 0) {
        doc.transact(() => {
            monacoText.insert(0, content);
            const metaMap = doc.getMap("meta");
            metaMap.set("language", language);
        });
    }
};
