import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Trash2,
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MutableRefObject,
} from "react";
import type { editor } from "monaco-editor";
import * as Y from "yjs";

const SUPPORTED_LANGUAGES = ["python", "javascript", "c", "cpp"];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1234";

interface OutputLine {
  id: string;
  type: "log" | "error" | "warning" | "success";
  content: string;
  timestamp: string;
}

interface OutputPanelProps {
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
  language: string;
  yOutput: Y.Array<any> | null;
  yExec: Y.Map<any> | null;
}

function getTimestamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function OutputPanel({
  editorRef,
  language,
  yOutput,
  yExec,
}: OutputPanelProps) {
  const [outputs, setOutputs] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const isSupported = SUPPORTED_LANGUAGES.includes(language.toLowerCase());

  
  const syncFromYjs = useCallback(() => {
    if (!yOutput) return;
    setOutputs(yOutput.toArray() as OutputLine[]);
  }, [yOutput]);

  
  const syncExecState = useCallback(() => {
    if (!yExec) return;
    setIsRunning(!!yExec.get("isRunning"));
  }, [yExec]);

  useEffect(() => {
    if (!yOutput || !yExec) return;

    
    syncFromYjs();
    syncExecState();

    
    yOutput.observe(syncFromYjs);
    yExec.observe(syncExecState);

    return () => {
      yOutput.unobserve(syncFromYjs);
      yExec.unobserve(syncExecState);
    };
  }, [yOutput, yExec, syncFromYjs, syncExecState]);

  
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputs]);


  const pushOutputLines = (lines: OutputLine[]) => {
    if (!yOutput) return;
    yOutput.push(lines);
  };

  const handleRun = async () => {
    if (!yExec || !yOutput) return;

    
    if (yExec.get("isRunning")) return;

    const code = editorRef.current?.getValue();
    if (!code?.trim()) {
      pushOutputLines([
        {
          id: Date.now().toString(),
          type: "warning",
          content: "No code to execute.",
          timestamp: getTimestamp(),
        },
      ]);
      return;
    }

    // Acquire lock
    yExec.set("isRunning", true);

    // Add a "running" indicator
    pushOutputLines([
      {
        id: `run-${Date.now()}`,
        type: "log",
        content: `Executing ${language} code...`,
        timestamp: getTimestamp(),
      },
    ]);

    try {
      const response = await fetch(`${API_URL}/api/code/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: language.toLowerCase(), code }),
      });

      const data = await response.json();

      if (!response.ok) {
        pushOutputLines([
          {
            id: Date.now().toString(),
            type: "error",
            content: data.error || "Execution failed",
            timestamp: getTimestamp(),
          },
        ]);
        return;
      }

      const newOutputs: OutputLine[] = [];
      const now = Date.now();

      // stdout lines
      if (data.stdout) {
        const lines = data.stdout
          .split("\n")
          .filter((l: string) => l.length > 0);
        lines.forEach((line: string, i: number) => {
          newOutputs.push({
            id: `${now}-stdout-${i}`,
            type: "log",
            content: line,
            timestamp: getTimestamp(),
          });
        });
      }

      // stderr lines
      if (data.stderr) {
        const lines = data.stderr
          .split("\n")
          .filter((l: string) => l.length > 0);
        lines.forEach((line: string, i: number) => {
          newOutputs.push({
            id: `${now}-stderr-${i}`,
            type: "error",
            content: line,
            timestamp: getTimestamp(),
          });
        });
      }

      // Summary line
      if (data.timedOut) {
        newOutputs.push({
          id: `${now}-timeout`,
          type: "warning",
          content: "Execution timed out (10s limit)",
          timestamp: getTimestamp(),
        });
      } else if (data.exitCode === 0) {
        newOutputs.push({
          id: `${now}-exit`,
          type: "success",
          content: "Process exited with code 0",
          timestamp: getTimestamp(),
        });
      } else {
        newOutputs.push({
          id: `${now}-exit`,
          type: "error",
          content: `Process exited with code ${data.exitCode}`,
          timestamp: getTimestamp(),
        });
      }

      pushOutputLines(newOutputs);
    } catch (err: any) {
      pushOutputLines([
        {
          id: Date.now().toString(),
          type: "error",
          content: `Network error: ${err.message}`,
          timestamp: getTimestamp(),
        },
      ]);
    } finally {
      // Release lock
      yExec.set("isRunning", false);
    }
  };

  const handleClear = () => {
    if (!yOutput) return;
    yOutput.delete(0, yOutput.length);
  };

  const getIcon = (type: OutputLine["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className='w-3.5 h-3.5 text-destructive' />;
      case "warning":
        return <AlertTriangle className='w-3.5 h-3.5 text-yellow-500' />;
      case "success":
        return <CheckCircle className='w-3.5 h-3.5 text-primary' />;
      default:
        return <Terminal className='w-3.5 h-3.5 text-muted-foreground' />;
    }
  };

  const getTextColor = (type: OutputLine["type"]) => {
    switch (type) {
      case "error":
        return "text-destructive";
      case "warning":
        return "text-yellow-500";
      case "success":
        return "text-primary";
      default:
        return "text-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className='h-full flex flex-col glass-panel rounded-lg overflow-hidden'
    >
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-card/50'>
        <div className='flex items-center gap-2'>
          <Terminal className='w-4 h-4 text-primary' />
          <span className='text-sm font-semibold text-foreground'>Output</span>
        </div>

        <div className='flex items-center gap-2'>
          <motion.button
            onClick={handleRun}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isRunning || !isSupported}
            title={
              isRunning
                ? "Code is running..."
                : !isSupported
                  ? `"${language}" is not supported for execution`
                  : "Run code"
            }
            className='flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors border border-primary/30'
          >
            {isRunning ? (
              <Clock className='w-3 h-3 animate-spin' />
            ) : (
              <Play className='w-3 h-3' />
            )}
            {isRunning ? "Running..." : "Run"}
          </motion.button>

          <motion.button
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'
          >
            <Trash2 className='w-3.5 h-3.5' />
          </motion.button>
        </div>
      </div>

      {/* Output content */}
      <div className='flex-1 overflow-y-auto p-3 font-mono text-xs scrollbar-thin bg-black/50'>
        <AnimatePresence>
          {outputs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex items-center justify-center h-full text-muted-foreground'
            >
              <span>No output yet. Click Run to execute code.</span>
            </motion.div>
          ) : (
            outputs.map((output, index) => (
              <motion.div
                key={output.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className='flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0'
              >
                <span className='text-muted-foreground/60 select-none w-16 flex-shrink-0'>
                  {output.timestamp}
                </span>
                {getIcon(output.type)}
                <span className={`${getTextColor(output.type)} break-all`}>
                  {output.content}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={outputEndRef} />
      </div>

      {/* Status bar */}
      <div className='px-4 py-2 border-t border-border bg-card/30 flex items-center justify-between'>
        <span className='text-[10px] text-muted-foreground font-mono'>
          {outputs.length} line{outputs.length !== 1 ? "s" : ""}
        </span>
        <span className='flex items-center gap-1 text-[10px] text-muted-foreground'>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupported ? "bg-primary" : "bg-yellow-500"
            }`}
          />
          {isSupported ? `${language} • Ready` : `${language} • Not supported`}
        </span>
      </div>
    </motion.div>
  );
}
