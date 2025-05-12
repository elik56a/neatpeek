"use client";

import { useEffect, useState } from "react";
import { clientLogger } from "@/services/logger";
import { HealthCheckResponse } from "../types/health";

export function HealthCheck() {
  const [healthInfo, setHealthInfo] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkHealth = async () => {
    try {
      clientLogger.info("Checking system health", {
        module: "HealthCheck",
      });

      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealthInfo(data);
      setLastChecked(new Date().toISOString());

      clientLogger.info("Health check completed", {
        module: "HealthCheck",
        metadata: data,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      setLastChecked(new Date().toISOString());

      clientLogger.error(error.message, {
        module: "HealthCheck",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800">System Status: Unhealthy</h2>
        <p className="text-red-600">Error: {error.message}</p>
        <p className="text-sm text-gray-500">
          Last checked: {new Date(lastChecked).toLocaleString()}
        </p>
      </div>
    );
  }

  if (!healthInfo) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Checking system health...</p>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">System Health Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded ${healthInfo.status === "healthy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {healthInfo.status}
            </span>
          </p>
          {healthInfo.status === "healthy" ? (
            <>
              <p>
                <span className="font-medium">Environment:</span> {healthInfo.environment}
              </p>
              <p>
                <span className="font-medium">Uptime:</span> {Math.floor(healthInfo.uptime / 60)}{" "}
                minutes
              </p>
              <p>
                <span className="font-medium">Last Checked:</span>{" "}
                {new Date(lastChecked).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-red-600">
              Error:{" "}
              {healthInfo.status === "unhealthy" && "error" in healthInfo
                ? healthInfo.error
                : "Unknown error"}
            </p>
          )}
        </div>

        {healthInfo.status === "healthy" && (
          <div className="space-y-2">
            <h3 className="font-medium">Memory Usage</h3>
            <p>
              <span className="font-medium">RSS:</span> {formatBytes(healthInfo.memory.rss)}
            </p>
            <p>
              <span className="font-medium">Heap Total:</span>{" "}
              {formatBytes(healthInfo.memory.heapTotal)}
            </p>
            <p>
              <span className="font-medium">Heap Used:</span>{" "}
              {formatBytes(healthInfo.memory.heapUsed)}
            </p>
            <p>
              <span className="font-medium">External:</span>{" "}
              {formatBytes(healthInfo.memory.external)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
