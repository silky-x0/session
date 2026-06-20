import { motion } from "framer-motion";
import type { PerformanceStatus } from "./types";

const labels: Record<PerformanceStatus, string> = {
  stable: "Stable",
  warning: "Warning",
  critical: "Critical",
};

const styles: Record<PerformanceStatus, { dot: string; text: string; ring: string }> = {
  stable: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  critical: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-500/20",
  },
};

export function StatusBadge({ status }: { status: PerformanceStatus }) {
  const s = styles[status];
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`System status: ${labels[status]}`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs font-medium ring-1 ${s.ring} ${s.text}`}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        <motion.span
          className={`absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60`}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>
      {labels[status]}
    </div>
  );
}
