/**
 * Application configuration
 */
export const appConfig = {
  /**
   * Application name
   */
  name: "NeatPeek",

  /**
   * Application description
   */
  description: "AI-Powered Brand Compliance Platform",

  /**
   * Application email
   */
  supportEmail: "support@neatpeek.com",

  /**
   * Storage keys
   */
  storage: {
    theme: "neatpeek-theme",
  },
  /**
   * Application domains
   */
  domains: {
    prod: {
      app: "app.neatpeek.io",
      marketing: "www.neatpeek.io",
    },
    dev: {
      app: "app.dev.neatpeek.io",
      marketing: "dev.neatpeek.io",
    },
  },
};

export const APP_PAGES: string[] = [
  "/dashboard",
  "/login",
  "/register",
  "/brand-setup",
  "/design-review",
  "/design-history",
  "/settings",
  "/teams",
  "/company",
  "/company/settings",
  "/company/teams",
];
