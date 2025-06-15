// src/app/(app)/onboarding/complete/page.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OnboardingCompletePage = () => {
  return (
    <div className="container mx-auto py-10 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-4">Onboarding Complete!</h1>
      <p className="text-muted-foreground mb-2"> {/* Adjusted margin */}
        You're all set up. You can now explore the dashboard and start creating your first campaign.
      </p>
      <p className="text-sm text-muted-foreground mb-8"> {/* New paragraph */}
        If you connected any ad platforms, historical data will be synced in the background and will appear in your dashboard once processed.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
};
export default OnboardingCompletePage;
