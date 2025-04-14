"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface RecheckButtonProps {
  onRecheck: () => void;
  className?: string;
}

/**
 * Button component for rechecking design
 */
export function RecheckButton({ onRecheck, className }: RecheckButtonProps) {
  return (
    <Button 
      onClick={onRecheck}
      className={className}
    >
      <FileText className="mr-2 h-4 w-4" />
      Recheck Design
    </Button>
  );
}
