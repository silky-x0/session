import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
  language: string;
  onMount?: (editor: any, monaco: any) => void;
}

export function CodeEditor({ language, onMount }: CodeEditorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="h-full w-full glass-panel rounded-lg overflow-hidden"
    >
      <Editor
        height="100%"
        language={language}
        defaultValue={`// 🚀 Welcome to the collaborative editor!
// Share the room URL to collaborate in real-time.

console.log('Hello, World!');
`}
        theme="vs-dark"
        onMount={onMount}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-[#050505]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineHeight: 1.6,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          renderLineHighlight: "all",
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 4,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </motion.div>
  );
}
