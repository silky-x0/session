import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Clock, Lightbulb, Unlock, X } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ProblemMetadata {
  title?: string;
  difficulty?: string;
  timeLimit?: string;
  question?: string; // Mapped from 'description' or 'question'
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  if (!metadata.title) return null;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-primary bg-primary/20 border-primary/30";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/20 border-yellow-500/30";
      case "Hard":
        return "text-destructive bg-destructive/20 border-destructive/30";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <>
      <motion.div
        layout
        className="glass-panel border-b border-border mb-3 rounded-lg overflow-hidden"
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-card/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{metadata.title}</span>
            
            {metadata.difficulty && (
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getDifficultyColor(
                  metadata.difficulty
                )}`}
              >
                {metadata.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {metadata.timeLimit && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {metadata.timeLimit}
              </span>
            )}
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && metadata.question && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground border-t border-border/50">
                <p className="leading-relaxed whitespace-pre-wrap">{metadata.question}</p>
                
                {/* Complexity */}
                {metadata.complexity && (
                  <div className="mt-3 text-xs">
                    <span className="font-semibold text-foreground">Complexity:</span>{" "}
                    Time: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{metadata.complexity.time}</code>,{" "}
                    Space: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{metadata.complexity.space}</code>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {metadata.hints && metadata.hints.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHints(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Show Hints ({metadata.hints.length})
                    </button>
                  )}
                  
                  {metadata.fullSolution && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSolution(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Reveal Solution
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hints Modal */}
      <AnimatePresence>
        {showHints && metadata.hints && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHints(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50"
            >
              <div className="glass-panel border-2 border-primary/50 rounded-lg p-5 max-h-[400px] overflow-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Hints
                  </h3>
                  <button
                    onClick={() => setShowHints(false)}
                    className="p-1 rounded-md hover:bg-card/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  {metadata.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="font-semibold text-foreground">{index + 1}.</span>
                      <span className="leading-relaxed">{hint}</span>
                    </div>
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSolution(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl z-50"
            >
              <div className="glass-panel border-2 border-destructive/50 rounded-lg p-5 max-h-[80vh] overflow-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                    <Unlock className="w-5 h-5" />
                    Solution
                  </h3>
                  <button
                    onClick={() => setShowSolution(false)}
                    className="p-1 rounded-md hover:bg-card/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    maxHeight: '60vh',
                    background: 'rgba(0, 0, 0, 0.3)',
                  }}
                  showLineNumbers
                  wrapLines
                  lineNumberStyle={{
                    minWidth: '3em',
                    paddingRight: '1em',
                    color: '#858585',
                    userSelect: 'none',
                  }}
                >
                  {metadata.fullSolution}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
