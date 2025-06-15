// src/app/(app)/copywriting/assistant/page.tsx
"use client"; // Needs to be client component for Tabs, state, etc.

import React, { useEffect, useState } from 'react';
import { CopywritingAssistant } from '@/features/copywriting/components/CopywritingAssistant';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Role, hasRole } from '@/features/auth/utils/rbac';

type CampaignBriefSummary = {
  id: string;
  objective: string;
};

const CopywritingAssistantPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [briefs, setBriefs] = useState<CampaignBriefSummary[]>([]);
  const [isLoadingBriefs, setIsLoadingBriefs] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      // Role check
      if (!hasRole(session?.user as any, [Role.MARKETER, Role.ADMIN])) {
        router.replace('/unauthorized');
        return;
      }

      // Fetch campaign briefs for the user/company to select from
      const fetchBriefs = async () => {
        setIsLoadingBriefs(true);
        try {
          // This API route doesn't exist yet. We'll need a simple one to list briefs.
          // For now, this will be a placeholder.
          // const response = await fetch('/api/campaign-briefs/list'); // Needs to be created
          // if (!response.ok) throw new Error('Failed to fetch briefs');
          // const data = await response.json();
          // setBriefs(data.briefs);

          // Placeholder data:
          console.warn("/api/campaign-briefs/list endpoint not implemented, using placeholder briefs for Copywriting Assistant.");
          setBriefs([
            { id: 'placeholder_brief_1', objective: 'Placeholder: Launch New Product Q3' },
            { id: 'placeholder_brief_2', objective: 'Placeholder: Increase Brand Awareness Summer Campaign' },
          ]);

        } catch (error) {
          console.error("Failed to fetch briefs:", error);
          // Handle error (e.g., toast message)
        } finally {
          setIsLoadingBriefs(false);
        }
      };
      fetchBriefs();

    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, session, router]);


  if (status === 'loading' || (status === 'authenticated' && isLoadingBriefs)) {
    return (
      <div className="container mx-auto py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading Copywriting Assistant...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && !hasRole(session?.user as any, [Role.MARKETER, Role.ADMIN]))) {
      // This case should be handled by the redirects in useEffect,
      // but as a fallback:
      return <p>Redirecting...</p>;
  }


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Copywriting Assistant</h1>
      </div>

      <CopywritingAssistant initialBriefs={briefs} />
    </div>
  );
};

export default CopywritingAssistantPage;
