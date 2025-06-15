// src/app/(app)/onboarding/ad-platform-connection/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { AdPlatformConnectForm } from '@/features/onboarding/components/AdPlatformConnect/AdPlatformConnectForm';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdPlatformConnectionPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]); // Store API names

  // Placeholder for fetching already connected platforms for the user
  useEffect(() => {
    const fetchConnectedPlatforms = async () => {
      // API call to get user's AdPlatformConnection records
      // e.g., GET /api/user/ad-platform-connections
      // For now, this is a placeholder
      // setConnectedPlatforms(['linkedin']); // Example
    };
    if (status === 'authenticated') {
      fetchConnectedPlatforms();
    }
  }, [status]);

  useEffect(() => {
    const callbackStatus = searchParams.get('status');
    const platform = searchParams.get('platform');
    const message = searchParams.get('message');

    if (callbackStatus === 'success' && platform) {
      toast({
        title: 'Connection Successful',
        description: `Successfully connected to ${platform}. Historical data will begin syncing in the background.` // Updated message
      });
      setConnectedPlatforms(prev => [...new Set([...prev, platform])]);

      // Optionally, automatically trigger the sync API after successful connection
      // fetch(`/api/onboarding/ad-platforms/sync/${platform}`, { method: 'POST' })
      //   .then(res => res.json())
      //   .then(data => console.log(data.message))
      //   .catch(err => console.error(`Failed to auto-trigger sync for ${platform}`, err));

      router.replace('/onboarding/ad-platform-connection');
    } else if (callbackStatus === 'error' && platform) {
      toast({ title: 'Connection Failed', description: `Failed to connect to ${platform}: ${message || 'Unknown error'}`, variant: 'destructive' });
      router.replace('/onboarding/ad-platform-connection');
    }
  }, [searchParams, toast, router]);


  const handleSkipOrNext = () => {
    // Navigate to the next step of onboarding (e.g., background sync or completion)
    // For now, let's assume this is the last major interactive step for this subtask.
    router.push('/onboarding/complete'); // Placeholder for a completion page/step
  };

  if (status === 'loading') {
    return <div className="container mx-auto p-4">Loading...</div>;
  }
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/onboarding/brand-book">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Step 3: Connect Ad Platforms</h1>
      </div>

      <AdPlatformConnectForm
        onSkip={handleSkipOrNext}
        connectedPlatforms={connectedPlatforms}
      />

      <div className="flex justify-end pt-4">
        <Button onClick={handleSkipOrNext}>
          Finish Onboarding / Next Step
        </Button>
      </div>
    </div>
  );
};

export default AdPlatformConnectionPage;
