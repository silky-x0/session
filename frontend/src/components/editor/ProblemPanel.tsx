import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Clock, Zap } from "lucide-react";
import { useState } from "react";

interface ProblemMetadata {
  title?: string;
  difficulty?: string;
  timeLimit?: string;
  question?: string; // Mapped from 'description' or 'question'
}

interface ProblemPanelProps {
  metadata: ProblemMetadata;
}

export function ProblemPanel({ metadata }: ProblemPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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
              
              <div className="flex items-center gap-2 mt-3">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary">
                  Collaborative mode active — all changes sync in real-time
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
