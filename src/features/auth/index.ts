// Re-export auth components and hooks for easier imports
export { default as AuthProvider } from "./components/AuthProvider";
export { useAuth } from "./hooks/useAuth";
export { useRefreshUser } from "./hooks/useRefreshUser";

// Use client-safe auth options to prevent Prisma bundling issues
export { authOptionsSafe as authOptions } from "./config/auth-options-safe";
