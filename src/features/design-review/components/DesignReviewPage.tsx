"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomLoader } from "@/components/ui/custom-loader";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BrandGuideline, useBrandGuidelines } from "@/hooks/useBrandGuidelines";
import { useAppDataContext } from "@/providers/AppDataProvider";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DesignReview } from "./DesignReview";

/**
 * Design Review Page Component
 */
export function DesignReviewPage() {
  const { company } = useAppDataContext();
  const { guidelines, isLoading } = useBrandGuidelines({
    companyId: company?.id
  });
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string>("");

  // Set the first guideline as selected when guidelines are loaded
  useEffect(() => {
    if (guidelines && guidelines.length > 0 && !selectedGuidelineId) {
      setSelectedGuidelineId(guidelines[0].id);
    }
  }, [guidelines, selectedGuidelineId]);

  // Handle guideline selection
  const handleGuidelineChange = (value: string) => {
    setSelectedGuidelineId(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CustomLoader size="lg" />
        <p className="mt-4 text-lg font-medium">Loading brand guidelines...</p>
      </div>
    );
  }

  // No guidelines state
  if (!guidelines || guidelines.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Design Review</CardTitle>
            <CardDescription>
              Check your designs against your brand guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium mt-4">No Brand Guidelines Found</h3>
              <p className="text-muted-foreground mt-2">
                You need to create brand guidelines before you can use the Design Review feature.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <a
              href="/brand-setup"
              className="text-primary hover:underline"
            >
              Create Brand Guidelines
            </a>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Brand guideline selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Brand Guideline</CardTitle>
            <CardDescription>
              Choose which brand guidelines to check your designs against
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="guidelineSelect">Brand Guideline</Label>
              <Select
                value={selectedGuidelineId}
                onValueChange={handleGuidelineChange}
              >
                <SelectTrigger id="guidelineSelect" className="w-full">
                  <SelectValue placeholder="Select a brand guideline" />
                </SelectTrigger>
                <SelectContent>
                  {guidelines?.map((guideline: BrandGuideline) => (
                    <SelectItem key={guideline.id} value={guideline.id}>
                      {guideline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Design Review */}
        {selectedGuidelineId ? (
          <DesignReview brandId={selectedGuidelineId} />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Please select a brand guideline to continue</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
