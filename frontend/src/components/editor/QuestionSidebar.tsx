import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Lightbulb,
  ListOrdered,
  Loader2,
  RotateCcw,
  Unlock,
} from "lucide-react";

export interface QuestionSlot {
  status: "pending" | "generating" | "ready" | "error";
  title?: string;
  difficulty?: string;
  question?: string;
  language?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  starterCode?: string;
  fullSolution?: string;
  version?: number;
}

export interface PresenceDot {
  name: string;
  color: string;
}

interface QuestionSidebarProps {
  questions: QuestionSlot[];
  activeIndex: number;
  onSelect: (index: number) => void;
  presenceByQuestion: Map<number, PresenceDot[]>;
  onRetry?: (index: number) => void;
}

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case "Easy":
      return "text-primary bg-primary/10 border-primary/30";
    case "Medium":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    case "Hard":
      return "text-red-500 bg-red-500/10 border-red-500/30";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};

function AvatarDots({ dots }: { dots: PresenceDot[] }) {
  if (dots.length === 0) return null;
  return (
    <span className='flex items-center' aria-label={`${dots.length} collaborator(s) here`}>
      {dots.slice(0, 4).map((dot, i) => (
        <span
          key={`${dot.name}-${i}`}
          title={dot.name}
          style={{ backgroundColor: dot.color, marginLeft: i === 0 ? 0 : -6 }}
          className='w-4 h-4 rounded-full border border-background shadow-sm shrink-0'
        />
      ))}
      {dots.length > 4 && (
        <span className='ml-0.5 text-[10px] text-muted-foreground font-mono'>
          +{dots.length - 4}
        </span>
      )}
    </span>
  );
}

function QuestionRow({
  slot,
  index,
  isActive,
  isExpanded,
  dots,
  onSelect,
  onToggleExpand,
  onRetry,
}: {
  slot: QuestionSlot;
  index: number;
  isActive: boolean;
  isExpanded: boolean;
  dots: PresenceDot[];
  onSelect: () => void;
  onToggleExpand: () => void;
  onRetry?: () => void;
}) {
  const qLabel = `Q${index + 1}`;
  const baseRow = "rounded-xl border transition-all duration-200";

  if (slot.status === "pending") {
    return (
      <div
        className={`${baseRow} border-border/40 bg-card/40 opacity-50 cursor-not-allowed px-3 py-2.5`}
        title='Still generating…'
        aria-disabled='true'
      >
        <div className='flex items-center gap-2.5'>
          <span className='flex-shrink-0 w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[11px] font-mono font-bold text-muted-foreground'>
            {index + 1}
          </span>
          <span className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
            <Clock className='w-3.5 h-3.5' />
            {qLabel} · Pending
          </span>
        </div>
      </div>
    );
  }

  if (slot.status === "generating") {
    return (
      <div
        className={`${baseRow} border-border/40 bg-card/40 opacity-70 px-3 py-2.5`}
        title='Still generating…'
        aria-disabled='true'
      >
        <div className='flex items-center gap-2.5'>
          <span className='flex-shrink-0 w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[11px] font-mono font-bold text-muted-foreground'>
            {index + 1}
          </span>
          <span className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
            <Loader2 className='w-3.5 h-3.5 animate-spin' />
            {qLabel} · Generating…
          </span>
        </div>
      </div>
    );
  }

  if (slot.status === "error") {
    return (
      <div
        className={`${baseRow} px-3 py-2.5 ${
          isActive
            ? "border-neon-pulse/60 bg-neon-pulse/[0.07]"
            : "border-red-500/30 bg-red-500/[0.04]"
        }`}
      >
        <div className='flex items-center gap-2.5'>
          <span className='flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[11px] font-mono font-bold text-red-500'>
            {index + 1}
          </span>
          <span className='flex items-center gap-1.5 text-xs text-red-500 font-medium flex-1 min-w-0'>
            <AlertTriangle className='w-3.5 h-3.5 shrink-0' />
            {qLabel} · Failed
          </span>
          {onRetry && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              aria-label={`Retry generating question ${index + 1}`}
              className='flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer shrink-0'
            >
              <RotateCcw className='w-3 h-3' />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseRow} overflow-hidden ${
        isActive
          ? "border-neon-pulse/60 bg-neon-pulse/[0.07] shadow-[0_0_16px_rgba(38,166,91,0.12)]"
          : "border-border/50 bg-card/60 hover:border-border hover:bg-card"
      }`}
    >
      <div className='flex items-center gap-2 px-2.5 py-2'>
        <button
          onClick={onSelect}
          aria-label={`Switch to question ${index + 1}${slot.title ? `: ${slot.title}` : ""}`}
          aria-current={isActive}
          className='flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer'
        >
          <span
            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold border ${
              isActive
                ? "bg-neon-pulse/15 border-neon-pulse/40 text-foreground"
                : "bg-secondary/60 border-border/60 text-muted-foreground"
            }`}
          >
            {index + 1}
          </span>
          <span className='flex-1 min-w-0'>
            <span className='block truncate text-[13px] font-semibold text-foreground leading-tight'>
              {slot.title || `Question ${index + 1}`}
            </span>
            <span className='flex items-center gap-1.5 mt-1'>
              {slot.difficulty && (
                <span
                  className={`px-1.5 py-px text-[10px] font-mono font-bold rounded border uppercase tracking-wider ${getDifficultyColor(slot.difficulty)}`}
                >
                  {slot.difficulty}
                </span>
              )}
              <AvatarDots dots={dots} />
            </span>
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
          aria-expanded={isExpanded}
          className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer shrink-0'
        >
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className='block'
          >
            <ChevronDown className='w-4 h-4' />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className='overflow-hidden'
          >
            <div className='px-3 pb-3 pt-1 space-y-2.5 border-t border-border/40'>
              {slot.question && (
                <p className='text-xs font-mono text-foreground/75 leading-relaxed whitespace-pre-wrap pt-2'>
                  {slot.question}
                </p>
              )}
              {slot.hints && slot.hints.length > 0 && (
                <details className='group/hints rounded-lg bg-blue-500/[0.07] border border-blue-500/20 px-2.5 py-2'>
                  <summary className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-500 cursor-pointer list-none'>
                    <Lightbulb className='w-3.5 h-3.5' />
                    Hints ({slot.hints.length})
                  </summary>
                  <ul className='mt-1.5 space-y-1.5'>
                    {slot.hints.map((hint, i) => (
                      <li
                        key={i}
                        className='text-xs font-mono text-foreground/75 leading-relaxed'
                      >
                        <span className='text-blue-500 font-bold mr-1.5'>
                          {i + 1}.
                        </span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {slot.fullSolution && (
                <details className='group/solution rounded-lg bg-purple-500/[0.07] border border-purple-500/20 px-2.5 py-2'>
                  <summary className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-500 cursor-pointer list-none'>
                    <Unlock className='w-3.5 h-3.5' />
                    Solution
                  </summary>
                  <pre className='mt-1.5 text-[11px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar'>
                    {slot.fullSolution}
                  </pre>
                </details>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuestionSidebar({
  questions,
  activeIndex,
  onSelect,
  presenceByQuestion,
  onRetry,
}: QuestionSidebarProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(activeIndex);

  if (questions.length === 0) return null;

  const readyCount = questions.filter((q) => q.status === "ready").length;

  const handleSelect = (index: number) => {
    onSelect(index);
    setExpandedIndex(index);
  };

  return (
    <div
      id='question-sidebar'
      aria-label='Question browser'
      className='flex flex-col h-full min-h-0 glass-panel rounded-lg overflow-hidden'
    >
      <div className='flex items-center gap-2 px-3 py-2.5 border-b border-border/50 shrink-0'>
        <ListOrdered className='w-4 h-4 text-muted-foreground' />
        <span className='text-xs font-display font-bold uppercase tracking-[0.15em] text-foreground'>
          Questions
        </span>
        <span className='ml-auto text-[11px] font-mono text-muted-foreground'>
          {readyCount}/{questions.length}
        </span>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-1.5'>
        {questions.map((slot, index) => (
          <QuestionRow
            key={index}
            slot={slot}
            index={index}
            isActive={index === activeIndex}
            isExpanded={expandedIndex === index && slot.status === "ready"}
            dots={presenceByQuestion.get(index) ?? []}
            onSelect={() => handleSelect(index)}
            onToggleExpand={() =>
              setExpandedIndex((prev) => (prev === index ? null : index))
            }
            onRetry={onRetry ? () => onRetry(index) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
