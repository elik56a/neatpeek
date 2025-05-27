import { useState, useCallback, useRef } from "react";
import { useInterval } from "./useInterval";

// Constants for polling
const DEFAULT_POLL_INTERVAL = 3000; // 3 seconds
const DEFAULT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const TIMEOUT_CHECK_INTERVAL = 60000; // 1 minute

interface UsePollOptions {
  pollInterval?: number;
  timeout?: number;
}

interface UsePollReturn {
  isPolling: boolean;
  startPolling: (id: string, onStatusChange?: (status: string) => void) => void;
  stopPolling: () => void;
}

/**
 * Centralized polling hook for any resource
 * @param pollCallback - Function to call on each poll iteration
 * @param options - Polling configuration options
 */
export function usePoll(
  pollCallback: (id: string) => Promise<void>,
  options: UsePollOptions = {}
): UsePollReturn {
  const { pollInterval = DEFAULT_POLL_INTERVAL, timeout = DEFAULT_TIMEOUT } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const onStatusChangeRef = useRef<((status: string) => void) | undefined>();

  // Main polling callback
  const pollCallbackWrapper = useCallback(async () => {
    if (!currentId) return;

    try {
      await pollCallback(currentId);
    } catch (error) {
      console.error("Error in poll callback:", error);
    }
  }, [currentId, pollCallback]);

  // Use useInterval for main polling
  useInterval(pollCallbackWrapper, isPolling && currentId ? pollInterval : null);

  // Timeout check
  useInterval(
    () => {
      if (startTime && Date.now() - startTime > timeout) {
        setIsPolling(false);
        setCurrentId(null);
        setStartTime(null);
        console.log("Polling stopped due to timeout");
      }
    },
    startTime ? TIMEOUT_CHECK_INTERVAL : null
  );

  /**
   * Start polling for a resource
   * @param id - Resource ID to poll
   * @param onStatusChange - Optional callback for status changes
   */
  const startPolling = useCallback(
    (id: string, onStatusChange?: (status: string) => void) => {
      if (isPolling && currentId === id) return;

      onStatusChangeRef.current = onStatusChange;
      setCurrentId(id);
      setIsPolling(true);
      setStartTime(Date.now());
    },
    [isPolling, currentId]
  );

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setCurrentId(null);
    setStartTime(null);
    onStatusChangeRef.current = undefined;
  }, []);

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}
