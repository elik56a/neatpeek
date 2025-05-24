"use client";
import { EnhancedBrandGuidelineDetails } from "@/features/brand-setup/components/EnhancedBrandGuidelineDetails";

export default function BrandGuidelinePage({ id }: { id: string }) {
  return (
    <div className="container py-6">
      <EnhancedBrandGuidelineDetails id={id} />
    </div>
  );
}
