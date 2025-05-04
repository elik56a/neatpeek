"use client";

import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { updateNotificationSettings } from "../utils/api";

export interface NotificationSettings {
  designChecksComplete: boolean;
  designChecksFailed: boolean;
  commentsOnDesigns: boolean;
  brandUpdates: boolean;
  marketingEmails: boolean;
}

export function useNotificationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<NotificationSettings>({
    designChecksComplete: true,
    designChecksFailed: true,
    commentsOnDesigns: true,
    brandUpdates: true,
    marketingEmails: false,
  });

  const handleChange = (key: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // This is a placeholder - the API endpoint doesn't exist yet
      await updateNotificationSettings(settings);

      setSaveSuccess(true);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved successfully.",
      });

      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast({
        title: "Update failed",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error.message as string)
            : "There was an error updating your notification settings. Please try again.",
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
    handleChange,
    handleSubmit,
  };
}
