"use client";

import { MarketingLayout } from "@/features/marketing";

export default function MarketingRootLayout({ children }: { children: React.ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
