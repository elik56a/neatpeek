/**
 * Re-export middleware from the auth feature
 * Next.js requires the middleware file to be at the root of the src directory
 */
export { config, middleware } from "@/features/auth/middleware";
