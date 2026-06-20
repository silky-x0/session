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
exports.initializeDoc = exports.getYDoc = void 0;
const Y = __importStar(require("yjs"));
const docs = new Map();
const getYDoc = (roomName) => {
    if (!docs.has(roomName)) {
        docs.set(roomName, new Y.Doc());
    }
    return docs.get(roomName);
};
exports.getYDoc = getYDoc;
const initializeDoc = (roomName, content, language, starterCode, title, difficulty, hints, complexity, question) => {
    const doc = (0, exports.getYDoc)(roomName);
    const monacoText = doc.getText("monaco");
    if (monacoText.length === 0) {
        doc.transact(() => {
            const initialContent = starterCode || content;
            monacoText.insert(0, initialContent);
            const metaMap = doc.getMap("meta");
            metaMap.set("language", language);
            if (title)
                metaMap.set("title", title);
            if (difficulty)
                metaMap.set("difficulty", difficulty);
            if (question)
                metaMap.set("question", question);
            if (hints && hints.length > 0)
                metaMap.set("hints", JSON.stringify(hints));
            if (complexity)
                metaMap.set("complexity", JSON.stringify(complexity));
            // If starterCode exists, store the full solution separately
            if (starterCode) {
                metaMap.set("starterCode", starterCode);
                metaMap.set("fullSolution", content);
            }
        });
    }
};
exports.initializeDoc = initializeDoc;
