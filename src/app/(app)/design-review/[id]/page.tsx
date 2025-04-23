"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CustomLoader } from "@/components/ui/custom-loader";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Import components dynamically with SSR disabled to avoid useLayoutEffect warnings
const DesignReviewWithId = dynamic(
  () => import("@/features/design-review/components/DesignReviewWithId").then(mod => ({ default: mod.DesignReviewWithId })),
  { ssr: false, loading: () => <LoadingState /> }
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <CustomLoader size="lg" />
    <p className="mt-4 text-lg font-medium">Loading design review...</p>
  </div>
);

const ErrorState = dynamic(
  () => import("@/components/ui/error-state").then(mod => mod.ErrorState || {
    default: ({ error, action }: { error: Error, action: React.ReactNode }) => (
      <div className="container mx-auto py-8">
        <div className="border-destructive p-8 rounded-lg border">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 text-destructive mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Design Review</h2>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            {action}
          </div>
        </div>
      </div>
    )
  }),
  { ssr: false }
);

export default function DesignReviewByIdPage() {
  const params = useParams();
  const reviewId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch the design review data
  useEffect(() => {
    const fetchReview = async () => {
      try {
        // Validate reviewId
        if (!reviewId) {
          throw new Error("Review ID is required");
        }

        // We don't need to fetch the review data here since the DesignReviewWithId component
        // will handle that. We just need to make sure the ID is valid.
        setIsLoading(false);
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

    fetchReview();
  }, [reviewId, toast]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        action={
          <Button asChild>
            <Link href="/design-review">Go to Design Review</Link>
          </Button>
        }
      />
    );
  }

  return <DesignReviewWithId reviewId={reviewId} />;
}
