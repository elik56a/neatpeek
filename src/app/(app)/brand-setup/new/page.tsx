"use client";

import { BrandSetupForm } from "@/features/brand-setup/components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBrandSetupPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/brand-setup">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Brand Guideline</h1>
      </div>

      <BrandSetupForm />
    </div>
  );
}
