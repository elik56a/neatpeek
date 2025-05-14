// src/utils/getAppUrl.ts

import { appConfig } from "@/config/app";

export function getAppUrl(path: string = ""): string {
  if (typeof window === "undefined") return path;

  const host = window.location.hostname;
  const { dev, prod } = appConfig.domains;

  // Local development
  if (host.includes("localhost")) {
    return path;
  }

  // Dev deployment
  if (host === dev.marketing) {
    return `https://${dev.app}${path}`;
  }

  // Prod deployment (assumes www subdomain or root)
  if (host === prod.marketing || host === prod.marketing.replace("www.", "")) {
    return `https://${prod.app}${path}`;
  }

  // Fallback (local or unknown env)
  return path;
}

export const getMarketingUrl = (path: string) => {
  if (typeof window === "undefined") return path;

  const host = window.location.hostname;
  const { dev, prod } = appConfig.domains;

  // Local development
  if (host.includes("localhost")) {
    return path;
  }

  // Dev deployment
  if (host === dev.app) {
    return `https://${dev.marketing}${path}`;
  }

  // Prod deployment (assumes www subdomain or root)
  if (host === prod.app || host === prod.app.replace("www.", "")) {
    return `https://${prod.marketing}${path}`;
  }

  // Fallback (local or unknown env)
  return path;
};

export function getLoginUrl(): string {
  return getAppUrl("/login");
}

export function getRegisterUrl(): string {
  return getAppUrl("/register");
}
