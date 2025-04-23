"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CustomLoader } from "@/components/ui/custom-loader";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnalysisResults } from "./AnalysisResults";
import { DesignAnalysisResult, DesignReviewResult } from "../types";
import { useRouter } from "next/navigation";
import { useAppDataContext } from "@/providers/AppDataProvider";

/**
 * Adapts a session response to the DesignAnalysisResult format
 * expected by the AnalysisResults component
 */
function adaptSessionToAnalysisResult(session: any): DesignAnalysisResult {
  // If it's already in the right format, return it
  if (session.reviews) {
    return session as DesignAnalysisResult;
  }
  
  // Convert frameReviews to the reviews format expected by AnalysisResults
  const reviews: DesignReviewResult[] = session.frameReviews?.map((review: any) => {
    // Extract the reviewJson which contains most of the data we need
    const reviewJson = review.reviewJson || {};
    
    return {
      image: {
        frame_id: review.frame.frameId,
        name: review.frame.name,
        url: review.frame.imageUrl,
        ...((reviewJson.image || {}) as any)
      },
      brand_issues: reviewJson.brand_issues || [],
      general_issues: reviewJson.general_issues || [],
      positive_aspects: reviewJson.positive_aspects || [],
      design_score: reviewJson.design_score || {
        total: review.designScore,
        max_score: review.designScoreMax,
        breakdown: {
          brand_compliance: review.brandComplianceScore,
          visual_harmony: review.visualHarmonyScore,
          usability: review.usabilityScore,
          accessibility: review.accessibilityScore
        }
      }
    };
  }) || [];
  
  return {
    reviews,
    sessionId: session.id,
    brandId: session.brandGuidelineId,
    figmaUrl: session.figmaUrl,
    fileName: session.figmaFileName
  };
}

interface DesignReviewSessionProps {
  sessionId: string;
}

/**
 * Component for displaying a design review session
 */
function DesignReviewSession({ sessionId }: DesignReviewSessionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRecheckLoading, setIsRecheckLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reviewData, setReviewData] = useState<DesignAnalysisResult | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAppDataContext();

  // Fetch the design review data
  useEffect(() => {
    const fetchReview = async () => {
      try {
        // Fetch the review data - try the session endpoint first
        const response = await fetch(`/api/design-review/session/${sessionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch design review");
        }

        const data = await response.json();

        // Adapt the session data to the format expected by AnalysisResults
        const adaptedData = adaptSessionToAnalysisResult(data);

        setReviewData(adaptedData);
        setIsLoading(false);

        // Update the browser title with the file name
        if (adaptedData.fileName) {
          document.title = `${adaptedData.fileName} - Design Review`;
        }
      } catch (error) {
        console.error("Error fetching design review:", error);
        setError(error instanceof Error ? error : new Error("Failed to fetch design review"));
        setIsLoading(false);

        toast({
          title: "Error",
          description: "Failed to load design review. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (sessionId) {
      fetchReview();
    }
  }, [sessionId, toast]);

  // Handle recheck
  const handleRecheck = async (frameIds?: string[]) => {
    if (!reviewData) return;

    try {
      setIsRecheckLoading(true);

      // Get the brand ID from the review data
      const brandId = reviewData.brandId;

      // Get the Figma URL from the review data
      const figmaUrl = reviewData.figmaUrl;

      // Use provided frameIds or default to the first frame
      const selectedFrameIds = frameIds && frameIds.length > 0
        ? frameIds
        : [reviewData.reviews[0]?.image?.frame_id];

      if (!brandId || !figmaUrl || !selectedFrameIds.length) {
        throw new Error("Missing required data for recheck");
      }

      // Get the current user ID from context
      if (!user?.id) {
        throw new Error("User ID is required for recheck");
      }
      const userId = user.id;

      // Call the recheck API directly
      const response = await fetch('/api/design-review/recheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          figmaUrl,
          brandId,
          userId,
          frameIds: selectedFrameIds, // Include the selected frame IDs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to recheck design");
      }

      const data = await response.json();

      // Update the URL to include the session ID if it's not already there
      if (data.sessionId && data.sessionId !== sessionId) {
        // Use replace to update the URL without adding to history stack
        router.replace(`/design-review/${data.sessionId}`, { scroll: false });

        // Update the browser title with the file name
        if (data.fileName) {
          document.title = `${data.fileName} - Design Review`;
        }
      }

      // Show success toast with detailed information
      const fixedCount = data.changes?.fixed_count || 0;
      const partiallyFixedCount = data.changes?.partially_fixed_count || 0;
      const notFixedCount = data.changes?.not_fixed_count || 0;
      const newIssuesCount = data.changes?.new_issues_count || 0;

      let description = "Your design has been rechecked successfully.";

      if (fixedCount > 0 || partiallyFixedCount > 0 || notFixedCount > 0 || newIssuesCount > 0) {
        description = `${fixedCount} issues fixed, ${partiallyFixedCount} partially fixed, ${notFixedCount} not fixed`;
        if (newIssuesCount > 0) {
          description += `, ${newIssuesCount} new issues found`;
        }
      }

      toast({
        title: "Recheck Complete",
        description,
        variant: newIssuesCount > 0 ? "destructive" : "default",
      });

      // Refresh the review data - try the session endpoint first
      let refreshResponse = await fetch(`/api/design-review/session/${sessionId}`);

      // If the session endpoint fails, try the generic endpoint
      if (!refreshResponse.ok) {
        refreshResponse = await fetch(`/api/design-review/${sessionId}`);
      }

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const adaptedData = adaptSessionToAnalysisResult(refreshData);
        setReviewData(adaptedData);
      }
    } catch (error) {
      console.error("Error rechecking design:", error);
      setError(error instanceof Error ? error : new Error("Failed to recheck design"));

      toast({
        title: "Error",
        description: "Failed to recheck design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecheckLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CustomLoader size="lg" />
        <p className="mt-4 text-lg font-medium">Loading design review...</p>
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

  if (!reviewData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Design Review Not Found</h2>
              <p className="text-muted-foreground mb-6">The requested design review could not be found.</p>
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
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="mr-2"
            >
              <Link href="/design-review">
                <AlertCircle className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Review Results</h1>
          </div>
          <p className="text-muted-foreground">
            {reviewData.fileName || "Design Review"}
          </p>
        </div>

        <AnalysisResults
          result={reviewData!}
          onRecheck={handleRecheck}
          showTimeline={true}
          isRecheckLoading={isRecheckLoading}
        />
      </div>
    </div>
  );
}

export { DesignReviewSession };
