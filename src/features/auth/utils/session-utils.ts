/**
 * Utility functions for session management
 */

/**
 * Force a complete session refresh by reloading the page
 * This is a more reliable way to ensure the session is fully updated
 */
export const forceSessionRefresh = () => {
  // Use window.location.reload() to force a complete refresh
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};
