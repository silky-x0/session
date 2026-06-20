export interface ExecutionMetric {
  timestamp: string;
  executionTime: number; // ms
  memoryUsage: number; // MB
  cpuUsage: number; // %
}

export interface RuntimeComparisonData {
  current: number;
  previous: number;
  improvementPercent: number; // positive = improvement (faster)
}

export type PerformanceStatus = "stable" | "warning" | "critical";

export interface PerformanceData {
  metrics: ExecutionMetric[];
  successRate: number; // 0..100
  comparison: RuntimeComparisonData;
  status: PerformanceStatus;
}
