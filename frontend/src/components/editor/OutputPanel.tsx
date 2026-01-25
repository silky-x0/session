import { motion, AnimatePresence } from "framer-motion";
import { Play, Trash2, Terminal, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface OutputLine {
  id: string;
  type: "log" | "error" | "warning" | "success";
  content: string;
  timestamp: string;
}

export function OutputPanel() {
  const [outputs, setOutputs] = useState<OutputLine[]>([
    {
      id: "1",
      type: "log",
      content: "Welcome to the session editor!",
      timestamp: "12:00:01",
    },
    {
      id: "2",
      type: "success",
      content: "Connected to room successfully",
      timestamp: "12:00:02",
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    const newOutput: OutputLine = {
      id: Date.now().toString(),
      type: "log",
      content: "Hello, World!",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    timeoutRef.current = window.setTimeout(() => {
      setOutputs((prev) => [...prev, newOutput]);
      setIsRunning(false);
      timeoutRef.current = null;
    }, 500);
  };

  const handleClear = () => {
    setOutputs([]);
  };

  const getIcon = (type: OutputLine["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="w-3.5 h-3.5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-3.5 h-3.5 text-primary" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-muted-foreground" />;
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
      className="h-full flex flex-col glass-panel rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Output</span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleRun}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 text-xs font-medium transition-colors border border-primary/30"
          >
            <Play className={`w-3 h-3 ${isRunning ? "animate-pulse" : ""}`} />
            {isRunning ? "Running..." : "Run"}
          </motion.button>

          <motion.button
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs scrollbar-thin bg-black/50">
        <AnimatePresence>
          {outputs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-muted-foreground"
            >
              <span>No output yet. Click Run to execute code.</span>
            </motion.div>
          ) : (
            outputs.map((output, index) => (
              <motion.div
                key={output.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0"
              >
                <span className="text-muted-foreground/60 select-none w-16 flex-shrink-0">
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
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 border-t border-border bg-card/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-mono">
          {outputs.length} line{outputs.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Ready
        </span>
      </div>
    </motion.div>
  );
}
