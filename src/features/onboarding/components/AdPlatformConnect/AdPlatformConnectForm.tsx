// src/features/onboarding/components/AdPlatformConnect/AdPlatformConnectForm.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Assuming you have or will create icons for these platforms
// For now, using simple text or placeholder icons
// import { Linkedin, Google, Facebook, Instagram } from 'lucide-react';

interface AdPlatform {
  name: string;
  apiName: string; // Used for API routes, e.g., 'linkedin', 'googleads'
  icon?: React.ElementType; // Placeholder for actual icon component
  description: string;
}

const platforms: AdPlatform[] = [
  { name: 'LinkedIn Ads', apiName: 'linkedin', description: 'Connect your LinkedIn Ads account to sync campaign data and insights.' },
  { name: 'Google Ads', apiName: 'googleads', description: 'Connect your Google Ads account for comprehensive campaign analysis.' },
  { name: 'Facebook Ads', apiName: 'facebook', description: 'Connect Facebook Ads to track performance and audiences.' },
  { name: 'Instagram Ads', apiName: 'instagram', description: 'Connect Instagram Ads to manage and evaluate your visual campaigns.' },
];

interface AdPlatformConnectFormProps {
  onConnectionSuccess?: (platformApiName: string) => void; // Callback when a platform is connected
  onSkip?: () => void;
  connectedPlatforms?: string[]; // List of apiNames for already connected platforms
}

export const AdPlatformConnectForm: React.FC<AdPlatformConnectFormProps> = ({
  onConnectionSuccess,
  onSkip,
  connectedPlatforms = [],
}) => {

  const handleConnect = (platformApiName: string) => {
    // Redirect to the backend API route that initiates the OAuth flow
    window.location.href = `/api/onboarding/ad-platforms/connect/${platformApiName}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connect Ad Platforms</CardTitle>
        <CardDescription>
          Connect your advertising accounts to enable data synchronization for campaign analysis and recommendations.
          This step is optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((platform) => {
          const isConnected = connectedPlatforms.includes(platform.apiName);
          return (
            <div key={platform.apiName} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">{platform.name}</h3>
                {platform.icon && React.createElement(platform.icon, { className: "h-6 w-6 mr-2 inline-block" })}
                <p className="text-sm text-muted-foreground">{platform.description}</p>
              </div>
              <Button
                onClick={() => handleConnect(platform.apiName)}
                disabled={isConnected}
              >
                {isConnected ? 'Connected' : `Connect ${platform.name}`}
              </Button>
            </div>
          );
        })}
        {onSkip && (
          <div className="flex justify-end pt-4">
            <Button variant="link" onClick={onSkip}>
              I'll do this later
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
