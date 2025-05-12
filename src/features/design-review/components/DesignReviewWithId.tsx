"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CustomLoader } from "@/components/ui/custom-loader";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnalysisResults } from "./AnalysisResults";
import { useAppDataContext } from "@/providers/AppDataProvider";
import { useDesignReview } from "../hooks";

interface DesignReviewWithIdProps {
  reviewId: string;
}

/**
 * Component for displaying a design review by ID
 */
function DesignReviewWithId({ reviewId }: DesignReviewWithIdProps) {
  const { user } = useAppDataContext();
  const { getDesignsReview, designsReview, recheckDesign, isLoading, error, isRecheckLoading } =
    useDesignReview();

  useEffect(() => {
    getDesignsReview(reviewId);
  }, []);

  // Handle recheck
  const handleRecheck = async (frameIds?: string[]) => {
    if (!designsReview) return;
    const brandId = designsReview.brandGuidelineId;
    const selectedFrameIds =
      frameIds && frameIds.length > 0 ? frameIds : [designsReview.designs[0]?.frameId];

    if (!brandId || !reviewId || !selectedFrameIds.length) {
      throw new Error("Missing required data for recheck");
    }

    // Get the current user ID from context
    if (!user?.id) {
      throw new Error("User ID is required for recheck");
    }
    const userId = user.id;

    // Call the recheck API directly
    await recheckDesign({
      designsReviewId: reviewId,
      brandId,
      userId,
      frameIds: selectedFrameIds,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CustomLoader size="lg" />
        <p className="mt-4 text-lg font-medium">Loading your design review...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Design Review</h2>
              <p className="text-muted-foreground mb-6">{error.message}</p>
              <Button asChild>
                <Link href="/design-review">Go to Design Review</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!designsReview?.id) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Design Review Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The requested design review could not be found.
              </p>
              <Button asChild>
                <Link href="/design-review">Go to Design Review</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/design-review">
                <AlertCircle className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Review Results</h1>
          </div>
        </div>

        <AnalysisResults
          designsReview={designsReview!}
          onRecheck={handleRecheck}
          showTimeline={true}
          isRecheckLoading={isRecheckLoading}
        />
      </div>
    </div>
  );
}

export { DesignReviewWithId };
