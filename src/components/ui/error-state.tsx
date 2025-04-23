"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: Error;
  action?: React.ReactNode;
  title?: string;
}

export function ErrorState({ 
  error, 
  action, 
  title = "Error" 
}: ErrorStateProps) {
  return (
    <div className="container mx-auto py-8">
      <Card className="border-destructive">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            {action}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
