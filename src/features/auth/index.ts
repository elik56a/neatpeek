// Re-export auth components and hooks for easier imports
export { default as AuthProvider } from './components/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { useRefreshUser } from './hooks/useRefreshUser';

// Use client-safe auth options to prevent bcrypt bundling issues
export { authOptionsClient as authOptions } from './config/auth-options-client';

