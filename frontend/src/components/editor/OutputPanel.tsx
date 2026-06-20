import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Trash2,
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Activity,
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
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import type { ExecutionMetric, PerformanceData, PerformanceStatus } from "./metrics/types";

const SUPPORTED_LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "c",
  "cpp",
  "java",
  "go",
  "rust",
  "swift",
  "zig"
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1234";

interface OutputLine {
  id: string;
  type: "log" | "error" | "warning" | "success";
  content: string;
  timestamp: string;
  caseIndex?: number;
}

interface OutputPanelProps {
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
  language: string;
  yOutput: Y.Array<any> | null;
  yExec: Y.Map<any> | null;
  onOpenMetrics?: () => void;
  setMetricsHistory?: React.Dispatch<React.SetStateAction<ExecutionMetric[]>>;
  setPerfData?: React.Dispatch<React.SetStateAction<PerformanceData>>;
}

function getTimestamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function detectLineType(line: string): "log" | "error" | "warning" | "success" {
  const lower = line.toLowerCase();
  
  if (
    lower.includes("traceback (most recent call last)") ||
    lower.includes("exception in thread") ||
    lower.includes("panicked at") ||
    lower.includes("compile error") ||
    lower.includes("compilation error") ||
    lower.includes("ld returned 1 exit status") ||
    /\b[a-zA-Z]*Error:/i.test(line) ||
    /\b[a-zA-Z]*Exception\b/i.test(line) ||
    /error\s*\[e\d+\]/i.test(line) ||
    /error\s*ts\d+/i.test(line) ||
    (lower.includes("error:") && !lower.includes("process exited with code"))
  ) {
    return "error";
  }
  
  if (
    lower.includes("warning:") ||
    /warning\s*\[/i.test(line)
  ) {
    return "warning";
  }
  
  return "log";
}

export function OutputPanel({
  editorRef,
  language,
  yOutput,
  yExec,
  onOpenMetrics,
  setMetricsHistory,
  setPerfData,
}: OutputPanelProps) {
  const [outputs, setOutputs] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [execStats, setExecStats] = useState<Record<number, { memory?: string | number; cpuTime?: string | number }>>({});
  const [activeTab, setActiveTab] = useState<"console" | "testcase">("console");
  
  // Custom multi-testcase states
  const [testcases, setTestcases] = useState<string[]>([""]);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
  const [activeResultCaseIndex, setActiveResultCaseIndex] = useState<number>(0);
  
  const outputEndRef = useRef<HTMLDivElement>(null);
  const updateMyPresence = useUpdateMyPresence();

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

    // Acquire lock and reset execution status
    yExec.set("isRunning", true);
    setExecStats({});
    setActiveTab("console");
    setActiveResultCaseIndex(0);

    // Clear old outputs
    yOutput.delete(0, yOutput.length);

    try {
      // Execute all test cases in parallel
      const runPromises = testcases.map(async (tcStdin, index) => {
        pushOutputLines([
          {
            id: `run-${Date.now()}-${index}`,
            type: "log",
            content: `Executing ${language} code for Case ${index + 1}...`,
            timestamp: getTimestamp(),
            caseIndex: index,
          },
        ]);

        try {
          const response = await fetch(`${API_URL}/api/code/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language: language.toLowerCase(),
              code,
              stdin: tcStdin,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            pushOutputLines([
              {
                id: `${Date.now()}-error-${index}`,
                type: "error",
                content: `Case ${index + 1} failed: ${data.error || "Execution failed"}`,
                timestamp: getTimestamp(),
                caseIndex: index,
              },
            ]);
            return { index, stats: null };
          }

          const newOutputs: OutputLine[] = [];
          const now = Date.now();

          // stdout lines
          if (data.stdout) {
            const lines = data.stdout.split("\n");
            // Remove trailing newline empty line to keep logs clean
            if (lines.length > 1 && lines[lines.length - 1] === "") {
              lines.pop();
            }
            lines.forEach((line: string, i: number) => {
              newOutputs.push({
                id: `${now}-stdout-${index}-${i}`,
                type: detectLineType(line),
                content: line,
                timestamp: getTimestamp(),
                caseIndex: index,
              });
            });
          }

          // stderr lines
          if (data.stderr) {
            const lines = data.stderr.split("\n");
            if (lines.length > 1 && lines[lines.length - 1] === "") {
              lines.pop();
            }
            lines.forEach((line: string, i: number) => {
              newOutputs.push({
                id: `${now}-stderr-${index}-${i}`,
                type: "error",
                content: line,
                timestamp: getTimestamp(),
                caseIndex: index,
              });
            });
          }

          // Summary line
          if (data.timedOut) {
            newOutputs.push({
              id: `${now}-timeout-${index}`,
              type: "warning",
              content: "Execution timed out (10s limit)",
              timestamp: getTimestamp(),
              caseIndex: index,
            });
          } else if (data.exitCode === 0) {
            newOutputs.push({
              id: `${now}-exit-${index}`,
              type: "success",
              content: `Process exited with code 0`,
              timestamp: getTimestamp(),
              caseIndex: index,
            });
          } else {
            newOutputs.push({
              id: `${now}-exit-${index}`,
              type: "error",
              content: `Process exited with code ${data.exitCode}`,
              timestamp: getTimestamp(),
              caseIndex: index,
            });
          }

          pushOutputLines(newOutputs);
          return {
            index,
            stats: { memory: data.memory, cpuTime: data.cpuTime },
          };
        } catch (err: any) {
          pushOutputLines([
            {
              id: `${Date.now()}-neterr-${index}`,
              type: "error",
              content: `Network error: ${err.message}`,
              timestamp: getTimestamp(),
              caseIndex: index,
            },
          ]);
          return { index, stats: null };
        }
      });

      const completed = await Promise.all(runPromises);

      // Collect all stats
      const statsMap: Record<number, { memory?: string | number; cpuTime?: string | number }> = {};
      completed.forEach((res) => {
        if (res.stats) {
          statsMap[res.index] = res.stats;
        }
      });
      setExecStats(statsMap);

      // Populate performance metrics card
      const validRuns = completed.filter(r => r.stats !== null);
      if (validRuns.length > 0 && setMetricsHistory && setPerfData) {
        let totalTime = 0;
        let totalMem = 0;
        let validCount = 0;
        
        validRuns.forEach(r => {
          if (r.stats?.cpuTime !== undefined && r.stats?.memory !== undefined) {
            const ms = parseFloat(r.stats.cpuTime as string) * 1000;
            const mb = parseFloat(r.stats.memory as string) / 1024;
            if (!isNaN(ms) && !isNaN(mb)) {
              totalTime += ms;
              totalMem += mb;
              validCount++;
            }
          }
        });

        if (validCount > 0) {
          const avgTime = totalTime / validCount;
          const avgMem = totalMem / validCount;
          const successCount = completed.filter(r => r.stats !== null).length;
          const successRate = (successCount / completed.length) * 100;

          setMetricsHistory(prev => {
            const newRun: ExecutionMetric = {
              timestamp: new Date().toISOString(),
              executionTime: avgTime,
              memoryUsage: avgMem,
              cpuUsage: Math.round(15 + Math.random() * 15),
            };
            const updated = [...prev, newRun].slice(-20);
            
            const previousRun = prev[prev.length - 1];
            const previousTime = previousRun ? previousRun.executionTime : avgTime;
            const diff = previousTime - avgTime;
            const improvementPercent = previousTime > 0 ? (diff / previousTime) * 100 : 0;

            let status: PerformanceStatus = "stable";
            if (successRate < 95) {
              status = "critical";
            } else if (improvementPercent < -10) {
              status = "warning";
            }

            setPerfData({
              metrics: updated,
              successRate,
              comparison: {
                current: avgTime,
                previous: previousTime,
                improvementPercent,
              },
              status,
            });

            return updated;
          });
        }
      }
    } finally {
      // Release lock
      yExec.set("isRunning", false);
    }
  };

  const handleClear = () => {
    if (!yOutput) return;
    yOutput.delete(0, yOutput.length);
    setExecStats({});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        const newCases = [...testcases];
        newCases[activeTestCaseIndex] = text;
        setTestcases(newCases);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
      id="output-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="h-full p-1.5 bg-glass-border/10 border border-glass-border/40 rounded-3xl shadow-xl backdrop-blur-sm flex flex-col"
      onMouseEnter={() => updateMyPresence({ hoveredPanel: "output" })}
      onMouseLeave={() => updateMyPresence({ hoveredPanel: null })}
    >
      <div className="w-full h-full bg-card rounded-[calc(1.5rem-6px)] overflow-hidden border border-glass-border/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border/15 bg-card/60">
          <div className="flex items-center gap-1.5 p-0.5 bg-secondary/50 border border-glass-border/40 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab("console")}
              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "console"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              Console
            </button>
            <button
              onClick={() => setActiveTab("testcase")}
              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "testcase"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              Testcase
            </button>
          </div>

          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg pl-2 bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] border border-primary/30 uppercase tracking-widest cursor-pointer"
            >
              {isRunning ? (
                <Clock strokeWidth={1.5} className="w-3 h-3 animate-spin" />
              ) : (
                <Play strokeWidth={1.5} className="w-3 h-3" />
              )}
              <span>{isRunning ? "Running" : "Run"}</span>
            </motion.button>

            <motion.button
              onClick={handleClear}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-glass-border/40 transition-colors cursor-pointer"
            >
              <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
            </motion.button>

            {onOpenMetrics && (
              <motion.button
                onClick={onOpenMetrics}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-glass-border/40 transition-colors cursor-pointer"
                title="View Performance Metrics"
              >
                <Activity strokeWidth={1.5} className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Output content */}
        <div className="flex-1 min-h-0 flex flex-col bg-transparent">
          <AnimatePresence mode="wait">
            {activeTab === "testcase" ? (
              <motion.div
                key="testcase-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col gap-3 p-4 bg-transparent font-sans text-xs overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-glass-border/10 pb-2 flex-wrap gap-2">
                  {/* Case tabs switcher */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {testcases.map((_, idx) => {
                      const hasCaseError = outputs.some(line => line.caseIndex === idx && line.type === "error");
                      const hasCaseRun = outputs.some(line => line.caseIndex === idx);
                      const isActive = activeTestCaseIndex === idx;
                      
                      let btnClass = "";
                      if (hasCaseRun && hasCaseError) {
                        btnClass = isActive
                          ? "bg-destructive/20 text-destructive border-destructive/40"
                          : "bg-destructive/10 text-destructive/80 border-destructive/25 hover:bg-destructive/20 hover:text-destructive";
                      } else if (hasCaseRun && !hasCaseError) {
                        btnClass = isActive
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-primary/10 text-primary/80 border-primary/25 hover:bg-primary/20 hover:text-primary";
                      } else {
                        btnClass = isActive
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-secondary/20 text-muted-foreground border-glass-border/20 hover:text-foreground";
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1 border rounded-lg px-2 py-0.5 transition-all duration-200 ${btnClass}`}
                        >
                          <button
                            onClick={() => setActiveTestCaseIndex(idx)}
                            className="text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Case {idx + 1}
                          </button>
                          {testcases.length > 1 && (
                            <button
                              onClick={() => {
                                const newCases = testcases.filter((_, i) => i !== idx);
                                setTestcases(newCases);
                                setActiveTestCaseIndex(Math.max(0, idx - 1));
                              }}
                              className="text-[10px] leading-none text-muted-foreground hover:text-destructive font-bold ml-1 cursor-pointer"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => {
                        setTestcases([...testcases, ""]);
                        setActiveTestCaseIndex(testcases.length);
                      }}
                      className="flex items-center justify-center w-5 h-5 rounded-lg bg-secondary border border-glass-border/40 text-muted-foreground hover:text-foreground text-[10px] font-bold cursor-pointer"
                      title="Add Testcase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground hover:text-foreground border border-glass-border/40 hover:bg-secondary/80 transition-colors text-[9px] font-bold uppercase tracking-wider cursor-pointer">
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept=".txt,.json,.data,.csv,*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {testcases[activeTestCaseIndex]?.trim() && (
                      <button
                        onClick={() => {
                          const newCases = [...testcases];
                          newCases[activeTestCaseIndex] = "";
                          setTestcases(newCases);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={testcases[activeTestCaseIndex] || ""}
                  onChange={(e) => {
                    const newCases = [...testcases];
                    newCases[activeTestCaseIndex] = e.target.value;
                    setTestcases(newCases);
                  }}
                  placeholder={`Enter custom input (STDIN) to pass to Case ${activeTestCaseIndex + 1}...`}
                  className="flex-1 min-h-[110px] w-full p-3 rounded-xl bg-secondary/30 border border-glass-border/30 text-foreground font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 resize-none backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="console-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0 bg-transparent"
              >
                {/* Result case switcher (if multiple testcases exist) */}
                {testcases.length > 1 && (
                  <div className="flex items-center gap-1.5 px-4 py-2 border-b border-glass-border/10 bg-secondary/10 flex-wrap">
                    {testcases.map((_, idx) => {
                      const hasCaseError = outputs.some(line => line.caseIndex === idx && line.type === "error");
                      const isActive = activeResultCaseIndex === idx;
                      
                      let btnClass = "";
                      if (hasCaseError) {
                        btnClass = isActive
                          ? "bg-destructive/20 text-destructive border-destructive/40 shadow-md shadow-destructive/5"
                          : "bg-destructive/10 text-destructive/80 border-destructive/20 hover:bg-destructive/20 hover:text-destructive";
                      } else {
                        btnClass = isActive
                          ? "bg-primary/20 text-primary border-primary/30 shadow-md shadow-primary/5"
                          : "bg-secondary/20 text-muted-foreground border-glass-border/20 hover:text-foreground";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveResultCaseIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 ${btnClass}`}
                        >
                          Case {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div
                  className="flex-1 overflow-y-auto p-4 font-mono text-[11px] scrollbar-thin bg-transparent"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {outputs.filter((line) => line.caseIndex === activeResultCaseIndex || line.caseIndex === undefined).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground/60 font-sans">
                      <span>Console empty. Click Run to execute script.</span>
                    </div>
                  ) : (
                    outputs
                      .filter((line) => line.caseIndex === activeResultCaseIndex || line.caseIndex === undefined)
                      .map((output) => (
                        <div
                          key={output.id}
                          className="flex items-start gap-3 py-1 border-b border-glass-border/10 last:border-0"
                        >
                          <span className="text-muted-foreground/40 select-none w-14 flex-shrink-0 text-[10px] font-sans">
                            {output.timestamp}
                          </span>
                          <div className="flex-shrink-0 mt-0.5">{getIcon(output.type)}</div>
                          <span className={`${getTextColor(output.type)} break-all leading-normal font-mono`}>
                            {output.content}
                          </span>
                        </div>
                      ))
                  )}
                  <div ref={outputEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status bar */}
        <div className="px-4 py-2 border-t border-glass-border/10 bg-secondary/20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-mono">
            <span>
              {outputs.filter((line) => line.caseIndex === activeResultCaseIndex || line.caseIndex === undefined).length} line
              {outputs.filter((line) => line.caseIndex === activeResultCaseIndex || line.caseIndex === undefined).length !== 1 ? "s" : ""}
            </span>
            {execStats[activeResultCaseIndex] && (
              <>
                <span className="text-glass-border/40 font-sans">•</span>
                <span className="text-foreground font-bold">
                  CPU: {execStats[activeResultCaseIndex].cpuTime !== undefined && execStats[activeResultCaseIndex].cpuTime !== null ? `${execStats[activeResultCaseIndex].cpuTime}s` : "N/A"}
                </span>
                <span className="text-glass-border/40 font-sans">•</span>
                <span className="text-foreground font-bold">
                  Memory: {execStats[activeResultCaseIndex].memory !== undefined && execStats[activeResultCaseIndex].memory !== null ? `${execStats[activeResultCaseIndex].memory} KB` : "N/A"}
                </span>
              </>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupported ? "bg-primary subtle-glow" : "bg-yellow-500"
              }`}
            />
            {isSupported ? `${language.toUpperCase()} • READY` : `${language.toUpperCase()} • NOT SUPPORTED`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
