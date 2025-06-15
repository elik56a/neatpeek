// src/app/(app)/campaign-brief/new/page.tsx
"use client";

import React from 'react';
import { CampaignBriefForm } from '@/features/campaign-brief/components/CampaignBriefForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Role, hasRole } from '@/features/auth/utils/rbac'; // Import RBAC utils

const NewCampaignBriefPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Role check
  if (status === 'authenticated' && !hasRole(session?.user as any, [Role.MARKETER, Role.ADMIN])) {
    router.replace('/unauthorized'); // Or some other appropriate page
    return <p>Redirecting...</p>;
  }
  if (status === 'unauthenticated') {
      router.replace('/login');
      return <p>Redirecting...</p>;
  }


  if (status === 'loading') {
      return <p>Loading user session...</p>;
  }


  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard"> {/* Or back to a list of briefs */}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Campaign Brief</h1>
      </div>

      <p className="text-muted-foreground">
        Fill out the details below to generate a comprehensive campaign brief.
        This will help align your team and kickstart the creative process.
      </p>

      <CampaignBriefForm />
    </div>
  );
};

export default NewCampaignBriefPage;
