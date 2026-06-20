"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedLiveblocksRoom = void 0;
const Y = __importStar(require("yjs"));
const liveblock_1 = require("../config/liveblock");
const seedLiveblocksRoom = async (roomId, aiResponse) => {
    const doc = new Y.Doc();
    doc.transact(() => {
        const monacoText = doc.getText("monaco");
        const initialContent = aiResponse.starterCode || aiResponse.content;
        monacoText.insert(0, initialContent);
        const metaMap = doc.getMap("meta");
        metaMap.set("language", aiResponse.language);
        if (aiResponse.title)
            metaMap.set("title", aiResponse.title);
        if (aiResponse.difficulty)
            metaMap.set("difficulty", aiResponse.difficulty);
        if (aiResponse.question)
            metaMap.set("question", aiResponse.question);
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
    await liveblock_1.liveblocks.createRoom(roomId, { defaultAccesses: ["room:write"] });
    await liveblock_1.liveblocks.sendYjsBinaryUpdate(roomId, update);
    doc.destroy();
};
exports.seedLiveblocksRoom = seedLiveblocksRoom;
