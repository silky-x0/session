import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useAnimatedNumber } from "./use-animated-number";

export interface MetricStatProps {
  label: string;
  value: number;
  unit?: string;
  deltaPercent?: number;
  /** When true, a decrease in value is considered an improvement (default true). */
  lowerIsBetter?: boolean;
  precision?: number;
}

function formatValue(v: number, precision = 0) {
  return v.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function MetricStat({
  label,
  value,
  unit,
  deltaPercent,
  lowerIsBetter = true,
  precision = 0,
}: MetricStatProps) {
  const animated = useAnimatedNumber(value);
  const hasDelta = typeof deltaPercent === "number";
  const isPositiveDir = (deltaPercent ?? 0) > 0;
  const isImprovement = hasDelta
    ? lowerIsBetter
      ? !isPositiveDir
      : isPositiveDir
    : false;

  const deltaColor = !hasDelta
    ? ""
    : isImprovement
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-amber-600 dark:text-amber-400";

  const ariaDirection = hasDelta
    ? `${isPositiveDir ? "up" : "down"} ${Math.abs(deltaPercent!).toFixed(1)} percent`
    : "";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      role="group"
      aria-label={`${label}: ${formatValue(value, precision)}${unit ?? ""}${
        ariaDirection ? `, ${ariaDirection}` : ""
      }`}
      className="flex min-w-0 flex-col gap-1"
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {formatValue(animated, precision)}
          {unit && (
            <span className="ml-0.5 text-sm font-normal text-muted-foreground">{unit}</span>
          )}
        </span>
        {hasDelta && (
          <motion.span
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${deltaColor}`}
          >
            {isPositiveDir ? (
              <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
            )}
            {Math.abs(deltaPercent!).toFixed(1)}%
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
