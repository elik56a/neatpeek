"use client";

import { useAuth, useRefreshUser } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { updateUserProfile } from "../utils/api";

export interface ProfileFormData {
  name: string;
  email: string;
  company: string;
  role: string;
}

export function useProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshUser } = useRefreshUser();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use a ref to store the initial form data to avoid re-renders
  const initialFormDataRef = useRef<ProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.companyName || "",
    role: user?.role || "Design Manager",
  });

  // Use local state that doesn't depend on user prop changes
  const [formData, setFormData] = useState<ProfileFormData>(initialFormDataRef.current);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the form state directly without using a callback
    // This prevents unnecessary re-renders
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    // Add a very subtle highlight effect
    const inputElement = e.target;
    inputElement.style.transition = "background-color 0.3s ease";
    inputElement.style.backgroundColor = "rgba(var(--primary), 0.03)";
    setTimeout(() => {
      inputElement.style.backgroundColor = "";
    }, 300);
  };

  const handleSubmit = async () => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);

    try {
      // Call the API utility function
      const updatedUser = await updateUserProfile({
        name: formData.name,
        company: formData.company,
        role: formData.role,
      });

      // Update the local form state with the returned data
      // Use the ref approach to avoid re-renders
      const updatedForm = {
        ...formData,
        name: updatedUser.name,
        company: updatedUser.companyName || formData.company,
        role: updatedUser.role || formData.role,
      };

      // Update the form state without causing a re-render cascade
      setFormData(updatedForm);

      // Update the ref value too
      initialFormDataRef.current = updatedForm;

      // Show success animation and message
      setSaveSuccess(true);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });

      // Reset success state after animation
      setTimeout(() => setSaveSuccess(false), 2000);

      // Update the session in the background without waiting for it
      refreshUser({
        name: updatedUser.name,
        companyName: updatedUser.companyName,
        role: updatedUser.role,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error.message as string)
            : "There was an error updating your profile. Please try again.",
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
