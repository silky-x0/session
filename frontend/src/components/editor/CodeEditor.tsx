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
  language?: string;
}

export function CodeEditor({ onMount, language = "javascript" }: CodeEditorProps) {
  const { settings, theme } = useTheme();
  const updateMyPresence = useUpdateMyPresence();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Disable TS/JS diagnostics when language is not JS or TS.
  // Monaco's TypeScript worker runs on every model regardless of the set
  // language, producing false-positive red squiggles for Python, C++, etc.
  useEffect(() => {
    if (!monacoRef.current) return;
    const isJsTs = language === "javascript" || language === "typescript";
    const opts = isJsTs
      ? { noSemanticValidation: false, noSyntaxValidation: false }
      : { noSemanticValidation: true,  noSyntaxValidation: true  };
    monacoRef.current.languages.typescript.javascriptDefaults.setDiagnosticsOptions(opts);
    monacoRef.current.languages.typescript.typescriptDefaults.setDiagnosticsOptions(opts);
  }, [language]);

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

    // Configure TypeScript / JavaScript compiler options so each file/buffer is treated as an isolated module
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      isolatedModules: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      isolatedModules: true,
    });

    // Suppress TS/JS diagnostics immediately on mount if language is non-JS/TS
    const isJsTs = language === "javascript" || language === "typescript";
    const opts = isJsTs
      ? { noSemanticValidation: false, noSyntaxValidation: false }
      : { noSemanticValidation: true,  noSyntaxValidation: true  };
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(opts);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(opts);

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
          defaultLanguage={language}
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
