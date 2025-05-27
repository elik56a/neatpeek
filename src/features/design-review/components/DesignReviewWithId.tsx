"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CustomLoader } from "@/components/ui/custom-loader";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnalysisResults } from "./AnalysisResults";
import { DesignReviewProcessingState } from "./DesignReviewProcessingState";
import { useAppDataContext } from "@/providers/AppDataProvider";
import { useDesignReview } from "../hooks";
import { isReviewProcessing, isReviewFailed } from "../utils/status-helpers";

interface DesignReviewWithIdProps {
  reviewId: string;
}

/**
 * Component for displaying a design review by ID
 */
function DesignReviewWithId({ reviewId }: DesignReviewWithIdProps) {
  const { user } = useAppDataContext();
  const {
    getDesignsReview,
    designsReview,
    recheckDesign,
    isLoading,
    error,
    isRecheckLoading,
    pollReviewStatus,
  } = useDesignReview();

  useEffect(() => {
    getDesignsReview(reviewId);
  }, [reviewId]);

  useEffect(() => {
    if (designsReview && isReviewProcessing(designsReview.status)) {
      pollReviewStatus(reviewId);
    }
  }, [designsReview?.status, reviewId, pollReviewStatus]);

  // Handle recheck
  const handleRecheck = async (frameIds?: string[]) => {
    if (!designsReview) return;
    const brandId = designsReview.brandGuidelineId;
    const selectedFrameIds =
      frameIds && frameIds.length > 0 ? frameIds : [designsReview.designs[0]?.frameId];

    if (!brandId || !reviewId || !selectedFrameIds.length) {
      throw new Error("Missing required data for recheck");
    }

    if (!user?.id) {
      throw new Error("User ID is required for recheck");
    }

    await recheckDesign({
      designsReviewId: reviewId,
      brandId,
      userId: user.id,
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

  // Show processing state
  if (isReviewProcessing(designsReview.status)) {
    return <DesignReviewProcessingState designsReview={designsReview} />;
  }

  // Show failed state
  if (isReviewFailed(designsReview.status)) {
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
              <h1 className="text-3xl font-bold">Design Review Failed</h1>
            </div>
          </div>

          <Card className="border-destructive">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We encountered an error while analyzing your design. Please try again or contact
                  support if the problem persists.
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/design-review">Try Again</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/design-review">Go Back</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show completed results
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
          designsReview={designsReview}
          onRecheck={handleRecheck}
          showTimeline={true}
          isRecheckLoading={isRecheckLoading}
        />
      </div>
    </div>
  );
}

export { DesignReviewWithId };
