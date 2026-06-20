import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { ExecutionTimeChart } from "./ExecutionTimeChart";
import { MemoryUsageChart } from "./MemoryUsageChart";
import { MetricStat } from "./MetricStat";
import { RuntimeComparison } from "./RuntimeComparison";
import { StatusBadge } from "./StatusBadge";
import { mockPerformanceData } from "./mock-data";
import type { PerformanceData } from "./types";

interface Props {
  data?: PerformanceData;
  loading?: boolean;
  className?: string;
}

function pctChange(curr: number, prev: number) {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-muted/60 ${className}`}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-7 w-24" />
          </div>
        ))}
      </div>
      <Shimmer className="h-[220px] w-full" />
      <Shimmer className="h-16 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Shimmer className="h-12" />
        <Shimmer className="h-12" />
        <Shimmer className="h-12" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Activity className="h-6 w-6 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">No execution data yet</p>
      <p className="text-xs text-muted-foreground">
        Run your code to start collecting performance metrics.
      </p>
    </div>
  );
}

export function PerformanceMetricsCard({
  data = mockPerformanceData,
  loading = false,
  className = "",
}: Props) {
  const hasData = data.metrics.length > 0;
  const latest = hasData ? data.metrics[data.metrics.length - 1] : null;
  const prev =
    data.metrics.length > 1 ? data.metrics[data.metrics.length - 2] : null;

  const execDelta = latest && prev ? pctChange(latest.executionTime, prev.executionTime) : undefined;
  const memDelta = latest && prev ? pctChange(latest.memoryUsage, prev.memoryUsage) : undefined;
  const cpuDelta = latest && prev ? pctChange(latest.cpuUsage, prev.cpuUsage) : undefined;

  return (
    <motion.section
      aria-label="Performance metrics"
      tabIndex={0}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.005 }}
      className={`group rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:border-foreground/15 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Performance Metrics
          </h2>
          <p className="text-xs text-muted-foreground">
            Last {data.metrics.length} executions
          </p>
        </div>
        <StatusBadge status={data.status} />
      </header>

      <div className="px-6 py-5">
        {loading ? (
          <LoadingState />
        ) : !hasData || !latest ? (
          <EmptyState />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <MetricStat
                label="Execution"
                value={latest.executionTime}
                unit="ms"
                deltaPercent={execDelta}
              />
              <MetricStat
                label="Memory"
                value={latest.memoryUsage}
                unit="MB"
                deltaPercent={memDelta}
              />
              <MetricStat
                label="CPU"
                value={latest.cpuUsage}
                unit="%"
                deltaPercent={cpuDelta}
              />
              <MetricStat
                label="Success rate"
                value={data.successRate}
                unit="%"
                precision={1}
                lowerIsBetter={false}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Execution time
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  ms / run
                </span>
              </div>
              <ExecutionTimeChart data={data.metrics} />
            </div>

            <div className="space-y-2 border-t border-border/60 pt-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Memory usage
                </h3>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {latest.memoryUsage} MB
                </span>
              </div>
              <MemoryUsageChart data={data.metrics} />
            </div>

            <div className="border-t border-border/60 pt-5">
              <RuntimeComparison data={data.comparison} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
