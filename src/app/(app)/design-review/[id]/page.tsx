"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CustomLoader } from "@/components/ui/custom-loader";

// Import components dynamically with SSR disabled to avoid useLayoutEffect warnings
const DesignReviewWithId = dynamic(
  () =>
    import("@/features/design-review/components/DesignReviewWithId").then(mod => ({
      default: mod.DesignReviewWithId,
    })),
  { ssr: false, loading: () => <LoadingState /> }
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <CustomLoader size="lg" />
    <p className="mt-4 text-lg font-medium">Loading design review...</p>
  </div>
);

export default function DesignReviewByIdPage() {
  const { id } = useParams();

  return <DesignReviewWithId reviewId={id as string} />;
}
