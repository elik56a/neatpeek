"use client";

import { use } from "react";
import { EnhancedBrandGuidelineDetails } from "@/features/brand-setup/components/EnhancedBrandGuidelineDetails";
import { PageParams } from "@/types/general";

interface BrandGuidelinePageProps extends PageParams<{ id: string }> {}

export default function BrandGuidelinePage({ params }: BrandGuidelinePageProps) {
  const { id } = use(params);

  return (
    <div className="container py-6">
      <EnhancedBrandGuidelineDetails id={id} />
    </div>
  );
}
