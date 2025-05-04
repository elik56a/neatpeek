"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { appConfig } from "@/config/app";

interface FigmaConnectPromptProps {
  user?: User;
  onConnect?: () => void;
}

/**
 * Component that prompts the user to connect their Figma account
 * if they haven't already
 */
export function FigmaConnectPrompt({ user, onConnect }: FigmaConnectPromptProps) {
  // If user is undefined, we'll still show the connect prompt
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnectFigma = async () => {
    setIsConnecting(true);
    try {
      await signIn("figma", {
        callbackUrl: window.location.href,
        redirect: true,
      });

      if (onConnect) {
        onConnect();
      }
    } catch (error) {
      console.error("Failed to connect Figma:", error);
      toast({
        title: "Connection Failed",
        description: "There was an issue connecting to Figma. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // If the user already has a Figma token, don't show the prompt
  if (user?.figmaAccessToken) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to Figma</CardTitle>
        <CardDescription>
          To use the Design Review feature, you need to connect your Figma account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Connecting your Figma account allows {appConfig.name} to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Access your Figma files (read-only)</li>
          <li>Add comments to your designs</li>
          <li>Analyze your designs against brand guidelines</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={handleConnectFigma} disabled={isConnecting} className="w-full">
          {isConnecting ? "Connecting..." : "Connect Figma Account"}
        </Button>
      </CardFooter>
    </Card>
  );
}
