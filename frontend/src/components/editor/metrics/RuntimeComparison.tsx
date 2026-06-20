import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { RuntimeComparisonData } from "./types";
import { useAnimatedNumber } from "./use-animated-number";

function deltaTone(improvementPercent: number) {
  if (improvementPercent >= 0) {
    return {
      label: "Improvement",
      icon: ArrowDown,
      className:
        "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
    };
  }
  if (improvementPercent > -10) {
    return {
      label: "Slight regression",
      icon: ArrowUp,
      className: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
    };
  }
  return {
    label: "Regression",
    icon: ArrowUp,
    className: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400",
  };
}

function Cell({ label, value, unit }: { label: string; value: number; unit: string }) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
        {Math.round(animated)}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}

export function RuntimeComparison({ data }: { data: RuntimeComparisonData }) {
  const tone = deltaTone(data.improvementPercent);
  const Icon =
    data.improvementPercent === 0 ? Minus : tone.icon;
  const animatedDelta = useAnimatedNumber(Math.abs(data.improvementPercent));

  return (
    <div className="grid grid-cols-3 items-end gap-4">
      <Cell label="Current run" value={data.current} unit="ms" />
      <Cell label="Previous run" value={data.previous} unit="ms" />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {tone.label}
        </span>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 font-mono text-sm font-semibold tabular-nums ring-1 ${tone.className}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {animatedDelta.toFixed(1)}%
        </motion.span>
      </div>
    </div>
  );
}
