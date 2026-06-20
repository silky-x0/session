import type { PerformanceData } from "./types";

export const mockPerformanceData: PerformanceData = {
  metrics: [
    { timestamp: new Date(Date.now() - 19 * 60000).toISOString(), executionTime: 145, memoryUsage: 48, cpuUsage: 25 },
    { timestamp: new Date(Date.now() - 18 * 60000).toISOString(), executionTime: 155, memoryUsage: 50, cpuUsage: 28 },
    { timestamp: new Date(Date.now() - 17 * 60000).toISOString(), executionTime: 130, memoryUsage: 45, cpuUsage: 20 },
    { timestamp: new Date(Date.now() - 16 * 60000).toISOString(), executionTime: 142, memoryUsage: 47, cpuUsage: 22 },
    { timestamp: new Date(Date.now() - 15 * 60000).toISOString(), executionTime: 160, memoryUsage: 52, cpuUsage: 30 },
    { timestamp: new Date(Date.now() - 14 * 60000).toISOString(), executionTime: 150, memoryUsage: 49, cpuUsage: 27 },
    { timestamp: new Date(Date.now() - 13 * 60000).toISOString(), executionTime: 135, memoryUsage: 46, cpuUsage: 21 },
    { timestamp: new Date(Date.now() - 12 * 60000).toISOString(), executionTime: 128, memoryUsage: 44, cpuUsage: 19 },
    { timestamp: new Date(Date.now() - 11 * 60000).toISOString(), executionTime: 140, memoryUsage: 48, cpuUsage: 24 },
    { timestamp: new Date(Date.now() - 10 * 60000).toISOString(), executionTime: 152, memoryUsage: 51, cpuUsage: 29 },
    { timestamp: new Date(Date.now() - 9 * 60000).toISOString(), executionTime: 148, memoryUsage: 50, cpuUsage: 26 },
    { timestamp: new Date(Date.now() - 8 * 60000).toISOString(), executionTime: 138, memoryUsage: 47, cpuUsage: 23 },
    { timestamp: new Date(Date.now() - 7 * 60000).toISOString(), executionTime: 132, memoryUsage: 45, cpuUsage: 20 },
    { timestamp: new Date(Date.now() - 6 * 60000).toISOString(), executionTime: 125, memoryUsage: 44, cpuUsage: 18 },
    { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), executionTime: 141, memoryUsage: 47, cpuUsage: 24 },
    { timestamp: new Date(Date.now() - 4 * 60000).toISOString(), executionTime: 158, memoryUsage: 52, cpuUsage: 30 },
    { timestamp: new Date(Date.now() - 3 * 60000).toISOString(), executionTime: 146, memoryUsage: 49, cpuUsage: 26 },
    { timestamp: new Date(Date.now() - 2 * 60000).toISOString(), executionTime: 134, memoryUsage: 46, cpuUsage: 21 },
    { timestamp: new Date(Date.now() - 1 * 60000).toISOString(), executionTime: 152, memoryUsage: 50, cpuUsage: 27 },
    { timestamp: new Date().toISOString(), executionTime: 124, memoryUsage: 48, cpuUsage: 23 },
  ],
  successRate: 99.2,
  comparison: {
    current: 124,
    previous: 152,
    improvementPercent: 18.4,
  },
  status: "stable",
};
