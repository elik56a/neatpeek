export interface HealthInfo {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export interface HealthError {
  status: "unhealthy";
  error: string;
  timestamp: string;
}

export type HealthCheckResponse = HealthInfo | HealthError;
