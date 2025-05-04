"use client";

import { Button } from "@/components/ui/button";
import { BrandSetupForm } from "@/features/brand-setup/components/BrandSetupForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditBrandGuidelinePageProps {
  params: {
    id: string;
  };
}

export default function EditBrandGuidelinePage({ params }: EditBrandGuidelinePageProps) {
  // Extract the ID from params to avoid Next.js warnings
  const id = params.id;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/brand-setup/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Brand Guideline</h1>
      </div>

      <BrandSetupForm brandId={id} mode="edit" />
    </div>
  );
}
