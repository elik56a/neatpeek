
"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default MarketingLayout;
