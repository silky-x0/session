import { motion, AnimatePresence } from "framer-motion";
import { Code2, Clock, Lightbulb, Unlock, X, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "../ThemeContext";
import { useUpdateMyPresence, useOthers } from "@liveblocks/react/suspense";

interface ProblemMetadata {
  title?: string;
  difficulty?: string;
  timeLimit?: string;
  question?: string; 
  hints?: string[];
  complexity?: { time: string; space: string };
  fullSolution?: string;
}

interface ProblemPanelProps {
  metadata: ProblemMetadata;
  language: string; 
  onSolutionClick?: () => void;
}

export function ProblemPanel({ metadata, language }: ProblemPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const { theme } = useTheme();
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  const collaboratorsInProblem = others.filter(
    (other) => other.presence?.hoveredPanel === "problem"
  );
  const isSomeoneInProblem = collaboratorsInProblem.length > 0;
  const partnerColor = collaboratorsInProblem[0]?.presence?.info?.color || "var(--color-primary)";

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showHints) setShowHints(false);
        else if (showSolution) setShowSolution(false);
        else setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showHints, showSolution]);

  if (!metadata.title) return null;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-primary bg-primary/10 border-primary/30 shadow-md";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30 shadow-md";
      case "Hard":
        return "text-red-500 bg-red-500/10 border-red-500/30 shadow-md";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Slim Side Tab) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="problem-tab"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setIsOpen(true)}
            aria-label="Open Problem Description"
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 pl-2 pr-4 py-6 rounded-r-xl bg-background/80 backdrop-blur-md border border-l-0 border-primary/30 text-primary shadow-md hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 group flex flex-col items-center gap-4 cursor-pointer min-h-[48px] min-w-[48px]"
            title="Open Problem Description"
          >
            {isSomeoneInProblem && (
              <span
                style={{ backgroundColor: partnerColor }}
                className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full animate-pulse border border-background shadow-md"
              />
            )}
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="[writing-mode:vertical-lr] text-[10px] font-display font-black uppercase tracking-[0.3em] opacity-80 group-hover:opacity-100 transition-opacity">Problem</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-[4px] z-40 lg:bg-transparent lg:backdrop-blur-0"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="problem-panel"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 250, mass: 0.8 }}
            className="fixed left-0 top-0 h-full w-[90%] sm:w-[450px] z-50 bg-background/75 backdrop-blur-xl border-r border-border/50 shadow-2xl flex flex-col text-foreground"
            role="dialog"
            aria-label="Problem Description Panel"
            onMouseEnter={() => updateMyPresence({ hoveredPanel: "problem" })}
            onMouseLeave={() => updateMyPresence({ hoveredPanel: null })}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-secondary/40">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-display font-bold uppercase text-foreground tracking-[0.15em]">Problem Details</h2>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-0.5">Workspace / {metadata.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Problem Panel"
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 md:px-6 md:py-4">
              <div className="space-y-4">
                {/* Title & Difficulty */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-display font-black uppercase text-foreground leading-tight tracking-[0.05em]">{metadata.title}</h1>
                    {metadata.difficulty && (
                      <span
                        className={`shrink-0 px-2 py-1 text-[10px] font-mono font-bold rounded border uppercase tracking-[0.1em] ${getDifficultyColor(
                          metadata.difficulty
                        )}`}
                      >
                        {metadata.difficulty}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {metadata.timeLimit && (
                      <span className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/50 font-mono text-xs">
                        <Clock className="w-4 h-4 text-primary" />
                        {metadata.timeLimit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-border/50 via-border/20 to-transparent" />

                {/* Question Body */}
                {metadata.question && (
                  <div className="prose prose-sm max-w-none">
                    <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-[14px] font-mono tracking-wide">
                      {metadata.question}
                    </div>
                  </div>
                )}

                {/* Complexity */}
                {metadata.complexity && (
                  <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent" />
                    <h3 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Target Complexity</h3>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 mb-1.5 uppercase font-mono tracking-wider">Time</p>
                        <code className="px-2 py-1 rounded bg-primary/10 text-[13px] font-mono font-medium text-primary border border-primary/20">{metadata.complexity.time}</code>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/80 mb-1.5 uppercase font-mono tracking-wider">Space</p>
                        <code className="px-2 py-1 rounded bg-primary/10 text-[13px] font-mono font-medium text-primary border border-primary/20">{metadata.complexity.space}</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                  {metadata.hints && metadata.hints.length > 0 && (
                    <button
                      onClick={() => setShowHints(true)}
                      className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-100 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                        <span className="tracking-[0.15em] font-display uppercase text-xs font-bold">View Hints</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">{metadata.hints.length}</span>
                    </button>
                  )}
                  
                  {metadata.fullSolution && (
                    <button
                      onClick={() => setShowSolution(true)}
                      className="flex items-center justify-center gap-4 w-full px-6 py-4 text-sm font-medium rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-100 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
                    >
                      <Unlock className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
                      <span className="tracking-[0.15em] font-display uppercase text-xs font-bold">Reveal Solution</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border/50 bg-background text-[11px] text-muted-foreground flex justify-center items-center tracking-wide">
              <span>Press <kbd className="bg-secondary px-1.5 py-0.5 rounded border border-border font-mono text-foreground/75 mx-1">ESC</kbd> to close panel</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hints Modal */}
      <AnimatePresence>
        {showHints && metadata.hints && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowHints(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60]"
              aria-hidden="true"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg z-[70]"
              role="dialog"
              aria-label="Hints"
            >
              <div className="bg-card border border-blue-500/30 rounded-2xl p-6 md:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <Lightbulb className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase text-foreground tracking-[0.1em]">Problem Hints</h3>
                      <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">{metadata.hints.length} hints available</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHints(false)}
                    aria-label="Close Hints"
                    className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {metadata.hints.map((hint, index) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      key={index} 
                      className="flex gap-6 p-6 rounded-xl bg-secondary/30 border border-border/50 hover:border-blue-500/30 transition-colors group"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 text-sm font-bold flex items-center justify-center border border-blue-500/30">{index + 1}</span>
                      <span className="text-[14px] font-mono text-foreground/80 leading-relaxed pt-1">{hint}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Solution Modal */}
      <AnimatePresence>
        {showSolution && metadata.fullSolution && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSolution(false)}
              className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[60]"
              aria-hidden="true"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-5xl z-[70]"
              role="dialog"
              aria-label="Solution"
            >
              <div className="bg-card border border-purple-500/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-border/50 bg-secondary/40 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Unlock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase text-foreground tracking-[0.1em]">Optimal Solution</h3>
                      <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">Language: {language}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSolution(false)}
                    aria-label="Close Solution"
                    className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                  <SyntaxHighlighter
                    language={language.toLowerCase()}
                    style={theme === "light" ? prism : vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '32px 24px',
                      borderRadius: '0',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      background: 'transparent',
                    }}
                    showLineNumbers
                    wrapLines
                    lineNumberStyle={{
                      minWidth: '3.5em',
                      paddingRight: '2em',
                      color: '#444',
                      textAlign: 'right',
                      userSelect: 'none',
                    }}
                  >
                    {metadata.fullSolution}
                  </SyntaxHighlighter>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
