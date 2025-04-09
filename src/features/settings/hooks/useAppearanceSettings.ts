"use client";

import { useTheme } from "@/features/theme";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { updateAppearanceSettings } from "../utils/api";

export interface AppearanceSettings {
  theme: string;
  fontSize: string;
  colorScheme: string;
}

export function useAppearanceSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: theme,
    fontSize: "normal",
    colorScheme: "default",
  });

  const handleThemeChange = (value: string) => {
    setSettings((prev) => ({ ...prev, theme: value }));
    // Apply theme change immediately
    setTheme(value as "light" | "dark" | "system");
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // This is a placeholder - the API endpoint doesn't exist yet
      await updateAppearanceSettings(settings);
      
      setSaveSuccess(true);
      toast({
        title: "Appearance settings updated",
        description: "Your appearance preferences have been saved successfully.",
      });
      
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to update appearance settings:", error);
      toast({
        title: "Update failed",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? error.message as string
          : "There was an error updating your appearance settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    saveSuccess,
    handleThemeChange,
    handleChange,
    handleSubmit
  };
}
