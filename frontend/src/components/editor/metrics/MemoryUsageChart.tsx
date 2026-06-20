import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { ExecutionMetric } from "./types";

export function MemoryUsageChart({ data }: { data: ExecutionMetric[] }) {
  const min = Math.min(...data.map((d) => d.memoryUsage));
  const max = Math.max(...data.map((d) => d.memoryUsage));
  return (
    <div
      role="img"
      aria-label={`Memory usage trend, min ${min}MB, max ${max}MB`}
      className="h-16 w-full text-muted-foreground"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="memFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - 2, max + 2]} />
          <Area
            type="monotone"
            dataKey="memoryUsage"
            stroke="currentColor"
            strokeWidth={1.5}
            fill="url(#memFill)"
            dot={false}
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
