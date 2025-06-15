// src/app/(app)/onboarding/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// This page can determine which step of onboarding the user should be on.
// For now, it will just redirect to the first step (company-profile).
const OnboardingPage = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Logic to determine current onboarding step can be added here.
      // For example, check if company profile is filled, then brand book, etc.
      // Default to the first step if no specific logic yet.
      router.replace('/onboarding/company-profile');
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  return (
    <div>
      <p>Loading onboarding...</p>
      {/* You can add a loader here */}
    </div>
  );
};

export default OnboardingPage;
