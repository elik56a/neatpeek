"use client";

import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { updateSecuritySettings } from "../utils/api";

export interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

export function useSecuritySettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<SecurityFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      // This is a placeholder - the API endpoint doesn't exist yet
      await updateSecuritySettings({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        twoFactorEnabled: formData.twoFactorEnabled,
      });

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setSaveSuccess(true);
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
      });

      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to update security settings:", error);
      toast({
        title: "Update failed",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error.message as string)
            : "There was an error updating your security settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    saveSuccess,
    handleChange,
    handleSubmit,
  };
}
