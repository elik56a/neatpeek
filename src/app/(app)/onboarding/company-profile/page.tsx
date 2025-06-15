// src/app/(app)/onboarding/company-profile/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { CompanyProfileForm, CompanyProfileFormData } from '@/features/onboarding/components/CompanyProfileForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Define a simple type for the fetched profile data
interface FetchedCompanyProfile extends CompanyProfileFormData {
  // Add any other fields that your GET /api/onboarding/company-profile returns if different
}


const CompanyProfileOnboardingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<CompanyProfileFormData> | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const companyId = (session?.user as any)?.companyId; // Adjust based on your session structure

  useEffect(() => {
    if (status === 'authenticated' && companyId) {
      const fetchProfile = async () => {
        setIsLoadingData(true);
        try {
          const response = await fetch('/api/onboarding/company-profile');
          if (response.ok) {
            const result: { data: FetchedCompanyProfile } = await response.json();
            setInitialData(result.data);
          } else if (response.status === 404) {
            setInitialData({}); // No existing data, start fresh
          } else {
            // Handle other errors if needed
            console.error('Failed to fetch company profile status:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch company profile:', error);
          // Potentially show a toast error
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchProfile();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, companyId, router]);

  const handleSuccess = (data: CompanyProfileFormData) => {
    console.log('Company profile saved, navigating to brand book upload.');
    router.push('/onboarding/brand-book');
  };

  const handleSkip = () => {
    console.log('Company profile skipped, navigating to brand book upload.');
    router.push('/onboarding/brand-book');
  };

  if (status === 'loading' || isLoadingData) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-10 w-1/3 ml-auto" />
      </div>
    );
  }

  if (!companyId) {
    // This case should ideally be handled by middleware or a wrapper component
    // if session is authenticated but companyId is missing.
    return <div className="container mx-auto p-4">Error: Company information not found. Please contact support.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Company Profile</h1>
      <p className="text-muted-foreground mb-6">
        Tell us about your company. This information will help tailor your experience.
      </p>
      <CompanyProfileForm
        companyId={companyId}
        initialData={initialData}
        onSuccess={handleSuccess}
        onSkip={handleSkip} // You can choose to implement skipping or not
      />
    </div>
  );
};

export default CompanyProfileOnboardingPage;
