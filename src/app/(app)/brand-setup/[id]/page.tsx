"use client";

import { EnhancedBrandGuidelineDetails } from "@/features/brand-setup/components/EnhancedBrandGuidelineDetails";

interface BrandGuidelinePageProps {
  params: {
    id: string;
  };
}

export default function BrandGuidelinePage({ params }: BrandGuidelinePageProps) {
  return (
    <div className="container py-6">
      <EnhancedBrandGuidelineDetails id={params.id} />
    </div>
  );
}
