// src/app/(app)/onboarding/brand-book/page.tsx
"use client";

import React from 'react';
import { BrandSetupForm } from '@/features/brand-setup/components/BrandSetupForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const BrandBookOnboardingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const companyId = (session?.user as any)?.companyId;

  const handleSuccessRedirect = (brandId: string) => {
    console.log('Brand Guideline created/updated with ID:', brandId);
    // Navigate to the next step of onboarding, e.g., ad platform connection
    router.push('/onboarding/ad-platform-connection'); // Example next step
  };

  const handleSkip = () => {
    // Navigate to the next step of onboarding
    router.push('/onboarding/ad-platform-connection'); // Example next step
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-60 w-full mb-4" />
        <Skeleton className="h-10 w-1/3 ml-auto" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null; // Or a loading spinner
  }

  if (!companyId && status === 'authenticated') {
    return (
        <div className="container mx-auto p-4 max-w-2xl text-center">
            <p className="text-red-600">Company information not found in your session.</p>
            <p className="text-sm text-muted-foreground mt-2">Please ensure your company setup is complete or contact support.</p>
            <Button variant="outline" asChild className="mt-4">
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/onboarding/company-profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Step 2: Upload Brand Book</h1>
      </div>
      <p className="text-muted-foreground">
        Upload your existing brand guidelines (PDF), design examples, or define custom rules.
        This will help NeatPeek understand your brand for reviews and content generation.
      </p>

      <BrandSetupForm
        mode="create" // Explicitly set to create mode for onboarding
        onSuccessRedirect={handleSuccessRedirect}
      />

      <div className="flex justify-end pt-4">
        <Button type="button" variant="outline" onClick={handleSkip}>
          Skip this step
        </Button>
      </div>
    </div>
  );
};

export default BrandBookOnboardingPage;
