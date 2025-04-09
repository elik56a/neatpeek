"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SaveButtonProps {
  isLoading: boolean;
  saveSuccess: boolean;
  onClick: () => void;
}

export function SaveButton({ isLoading, saveSuccess, onClick }: SaveButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={saveSuccess ? "bg-green-600 hover:bg-green-700 transition-colors duration-300" : "transition-colors duration-300"}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : saveSuccess ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Saved!
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </>
      )}
    </Button>
  );
}
