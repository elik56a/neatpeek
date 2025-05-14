"use client";

import { useAuth } from "@/features/auth";
import { AppLayout } from "@/features/layout";
import { useSubdomainRedirect } from "@/hooks/useSubdomainRedirect";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useSubdomainRedirect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <AppLayout>{children}</AppLayout>;
}
