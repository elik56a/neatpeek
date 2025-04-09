"use client";

import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Re-export for backward compatibility
export const useAuth = useAuthContext;
