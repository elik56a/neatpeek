"use client";

import { EnhancedBrandGuidelineDetails } from "@/features/brand-setup/components/EnhancedBrandGuidelineDetails";

interface BrandGuidelinePageProps {
  params: {
    id: string;
  };
}

export default function BrandGuidelinePage({ params }: BrandGuidelinePageProps) {
  // Extract the ID directly to avoid the warning
  const id = params.id;

  return (
    <div className="container py-6">
      <EnhancedBrandGuidelineDetails id={id} />
    </div>
  );
}
