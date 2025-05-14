"use client";

import { useEffect } from "react";
import { APP_PAGES, appConfig } from "@/config/app";

export function useSubdomainRedirect() {
  useEffect(() => {
    const host = window.location.hostname;
    const path = window.location.pathname;

    const isAppRoute = APP_PAGES.some(page => path.startsWith(page));
    const { dev, prod } = appConfig.domains;

    if (host === dev.marketing && isAppRoute) {
      const target = window.location.href.replace(dev.marketing, dev.app);
      window.location.href = target;
    }

    if (host === prod.marketing && isAppRoute) {
      const target = window.location.href.replace(prod.marketing, prod.app);
      window.location.href = target;
    }
  }, []);
}
