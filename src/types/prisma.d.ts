import { PrismaClient } from "@prisma/client";

declare module "@prisma/client" {
  namespace Prisma {
    interface $DesignsReviewExtensionScalar extends DesignsReview {
      $designsReview: {
        id: string;
        designs: Design[];
      };
    }
    interface $DesignExtensionScalar extends Design {
      $design: {
        id: string;
        reviewJson: ReviewJson;
      };
    }
  }
  interface PrismaClient {
    user: {
      findUnique: (args: {
        where: { email: string };
        select: {
          id: true;
          companyId: true;
        };
      }) => Promise<{
        id: string;
        companyId: string | null;
      } | null>;
    };
    team: {
      findUnique: (args: {
        where: { id: string };
        select: {
          companyId: true;
        };
      }) => Promise<{
        companyId: string | null;
      } | null>;
    };
    designsReview: {
      findUnique: (args: {
        where: { id: string };
        include: {
          user: true;
          brandGuideline: true;
          designs: true;
        };
      }) => Promise<{
        user: User;
        brandGuideline: BrandGuideline;
      } | null>;
    };
  }
}
