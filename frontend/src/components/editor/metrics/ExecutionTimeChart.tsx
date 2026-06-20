import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExecutionMetric } from "./types";

interface Props {
  data: ExecutionMetric[];
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as ExecutionMetric & { runIndex: number };
  const time = new Date(point.timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <div className="rounded-md border border-border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <div className="mb-1 flex items-center justify-between gap-4 text-muted-foreground">
        <span>Run #{point.runIndex + 1}</span>
        <span className="font-mono tabular-nums">{time}</span>
      </div>
      <div className="space-y-0.5 font-mono tabular-nums text-popover-foreground">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Exec</span>
          <span>{point.executionTime} ms</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Memory</span>
          <span>{point.memoryUsage} MB</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">CPU</span>
          <span>{point.cpuUsage}%</span>
        </div>
      </div>
    </div>
  );
}

export function ExecutionTimeChart({ data }: Props) {
  const indexed = data.map((d, i) => ({ ...d, runIndex: i }));
  const min = Math.min(...data.map((d) => d.executionTime));
  const max = Math.max(...data.map((d) => d.executionTime));
  const pad = Math.max(4, Math.round((max - min) * 0.2));

  return (
    <div
      role="img"
      aria-label={`Execution time over last ${data.length} runs, min ${min}ms, max ${max}ms`}
      className="h-[220px] w-full text-foreground"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={indexed} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="execFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.12} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="runIndex"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            tickFormatter={(v) => `#${v + 1}`}
            interval={3}
            minTickGap={16}
          />
          <YAxis
            domain={[Math.max(0, min - pad), max + pad]}
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            tickFormatter={(v) => `${v}ms`}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "var(--color-border)",
              strokeDasharray: "3 3",
            }}
          />
          <Area
            type="monotone"
            dataKey="executionTime"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeOpacity={0.9}
            fill="url(#execFill)"
            dot={false}
            activeDot={{
              r: 3.5,
              strokeWidth: 2,
              stroke: "var(--color-background)",
              fill: "currentColor",
            }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
