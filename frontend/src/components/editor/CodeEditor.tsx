import { motion } from "framer-motion";
import { Suspense, lazy, useEffect, useRef } from "react";

import { Loader2 } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";

const Editor = lazy(() => import("@monaco-editor/react"));

function EditorLoader() {
  return (
    <div className='h-full w-full flex items-center justify-center bg-background'>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className='w-8 h-8 text-primary' />
      </motion.div>
    </div>
  );
}

interface CodeEditorProps {
  onMount?: (editor: any, monaco: any) => void;
}

export function CodeEditor({ onMount }: CodeEditorProps) {
  const { settings, theme } = useTheme();
  const updateMyPresence = useUpdateMyPresence();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Update Monaco options dynamically when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        lineHeight: settings.fontSize * settings.lineHeight,
        minimap: { enabled: settings.minimap },
      });
    }
  }, [settings.fontSize, settings.lineHeight, settings.minimap]);

  // Update Monaco theme dynamically when theme state changes
  useEffect(() => {
    if (monacoRef.current) {
      const monacoTheme = theme === "light" ? "vs" : theme === "contrast" ? "hc-black" : "neon-dark";
      monacoRef.current.editor.setTheme(monacoTheme);
    }
  }, [theme]);

  const handleEditorDidMount = (editorInstance: any, monaco: any) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;
    
    // Configure Monaco options on initial mount
    editorInstance.updateOptions({
      fontSize: settings.fontSize,
      lineHeight: settings.fontSize * settings.lineHeight,
      minimap: { enabled: settings.minimap },
    });

    onMount?.(editorInstance, monaco);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className='h-full w-full glass-panel rounded-lg overflow-hidden'
      onMouseEnter={() => updateMyPresence({ hoveredPanel: "editor" })}
      onMouseLeave={() => updateMyPresence({ hoveredPanel: null })}
    >
      <Suspense fallback={<EditorLoader />}>
        <Editor
          height='100%'
          defaultLanguage='javascript'
          defaultValue=""
          theme={theme === "light" ? "vs" : theme === "contrast" ? "hc-black" : "neon-dark"}
          onMount={handleEditorDidMount}
          loading={<EditorLoader />}

          options={{
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderLineHighlight: "all",
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
