import { motion } from "framer-motion";
import { Suspense, lazy, useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

const Editor = lazy(() => import("@monaco-editor/react"));

function EditorLoader() {
  return (
    <div className='h-full w-full flex items-center justify-center bg-[#050505]'>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className='w-8 h-8 text-primary' />
      </motion.div>
    </div>
  );
}

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

interface CodeEditorProps {
  onMount?: (editor: any, monaco: any) => void;
}

export function CodeEditor({ onMount }: CodeEditorProps) {
  const isMobile = useIsMobile();
  const editorInstanceRef = useCallback(
    (editorInstance: any, monaco: any) => {
      // Update options based on viewport
      if (editorInstance) {
        editorInstance.updateOptions({
          minimap: { enabled: !isMobile },
          fontSize: isMobile ? 12 : 14,
          lineNumbersMinChars: isMobile ? 3 : 4,
          lineDecorationsWidth: isMobile ? 4 : 10,
          padding: { top: isMobile ? 8 : 16, bottom: isMobile ? 8 : 16 },
        });
      }
      onMount?.(editorInstance, monaco);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className='h-full w-full glass-panel rounded-lg overflow-hidden'
    >
      <Suspense fallback={<EditorLoader />}>
        <Editor
          height='100%'
          defaultLanguage='javascript'
          defaultValue=""
          theme='vs-dark'
          onMount={editorInstanceRef}
          loading={<EditorLoader />}
          options={{
            fontSize: isMobile ? 12 : 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: !isMobile, scale: 1 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: isMobile ? 8 : 16, bottom: isMobile ? 8 : 16 },
            lineHeight: 1.6,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderLineHighlight: "all",
            lineDecorationsWidth: isMobile ? 4 : 10,
            lineNumbersMinChars: isMobile ? 3 : 4,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </Suspense>
    </motion.div>
  );
}
