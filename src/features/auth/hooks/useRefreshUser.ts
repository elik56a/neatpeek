"use client";

import { useSession } from "next-auth/react";
import { useCallback, useRef } from "react";

/**
 * Custom hook to refresh user data in the session
 * This is useful after updating user profile data
 */
export function useRefreshUser() {
  const { data: session, update } = useSession();
  // Use a ref to track if an update is in progress
  const updateInProgressRef = useRef(false);

  const refreshUser = useCallback(
    (userData: any) => {
      if (!session || !update || updateInProgressRef.current) return false;

      // Set the update in progress flag
      updateInProgressRef.current = true;

      // Use a non-blocking approach to update the session
      // This prevents the page from reloading
      const timeoutId = setTimeout(() => {
        // Use a minimal update approach
        update({
          user: {
            ...userData,
          },
        })
          .then(() => {
            // Clear the update in progress flag after a delay
            setTimeout(() => {
              updateInProgressRef.current = false;
            }, 500);
          })
          .catch(error => {
            console.error("Failed to refresh user data:", error);
            updateInProgressRef.current = false;
          });
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [update]
  );

  return { refreshUser };
}
