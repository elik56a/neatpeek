"use client";

import { signIn } from "next-auth/react";

// Client-safe provider ID constant
const FIGMA_PROVIDER_ID = "figma";

/**
 * Checks if an API error response requires Figma authentication
 * and automatically redirects to Figma OAuth if needed
 *
 * @param errorData The error response data from the API
 * @returns true if redirect was triggered, false otherwise
 */
export async function handleFigmaAuthRedirect(errorData: any): Promise<boolean> {
  if (errorData?.requiresAuth && errorData?.redirectTo === FIGMA_PROVIDER_ID) {
    // Automatically redirect to Figma OAuth
    await signIn(FIGMA_PROVIDER_ID, {
      callbackUrl: window.location.href,
      redirect: true,
    });
    return true;
  }
  return false;
}
