
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MarketingLayout from "@/components/layout/MarketingLayout";
import LandingPage from "@/components/pages/marketing/LandingPage";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in and redirect to dashboard if needed
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <MarketingLayout>
      <LandingPage />
    </MarketingLayout>
  );
}
