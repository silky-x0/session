import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ExecutionMetric } from "./types";

function MemoryTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ExecutionMetric & { runIndex: number };
  const time = new Date(point.timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <div className="rounded-md border border-border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <div className="mb-1 flex items-center justify-between gap-4 text-muted-foreground">
        <span>{point.label ?? `Run #${point.runIndex + 1}`}</span>
        <span className="font-mono tabular-nums">{time}</span>
      </div>
      <div className="font-mono tabular-nums text-popover-foreground">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Memory</span>
          <span>{point.memoryUsage.toFixed(2)} MB</span>
        </div>
      </div>
    </div>
  );
}

export function MemoryUsageChart({ data }: { data: ExecutionMetric[] }) {
  const indexed = data.map((d, i) => ({ ...d, runIndex: i }));
  const min = Math.min(...data.map((d) => d.memoryUsage));
  const max = Math.max(...data.map((d) => d.memoryUsage));
  return (
    <div
      role="img"
      aria-label={`Memory usage trend, min ${min}MB, max ${max}MB`}
      className="h-14 sm:h-16 w-full text-foreground"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={indexed} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <defs>
            <linearGradient id="memFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Hidden XAxis gives Recharts an anchor for hover mapping */}
          <XAxis dataKey="runIndex" hide />
          <YAxis hide domain={[Math.max(0, min - 2), max + 2]} />
          <Tooltip
            content={<MemoryTooltip />}
            cursor={{ stroke: "var(--color-border)", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="memoryUsage"
            stroke="currentColor"
            strokeWidth={2}
            fill="url(#memFill)"
            dot={data.length <= 20 ? { r: 2.5, fill: "currentColor", strokeWidth: 0 } : false}
            activeDot={{ r: 3, strokeWidth: 2, stroke: "var(--color-background)", fill: "currentColor" }}
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
