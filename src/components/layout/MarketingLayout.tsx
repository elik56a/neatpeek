
"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout = ({ children }: MarketingLayoutProps)  =>{
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export default MarketingLayout;
