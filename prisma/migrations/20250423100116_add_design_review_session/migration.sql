/*
  Warnings:

  - You are about to drop the column `brandGuidelineId` on the `DesignReview` table. All the data in the column will be lost.
  - You are about to drop the column `originalFigmaUrl` on the `DesignReview` table. All the data in the column will be lost.
  - You are about to drop the column `designReviewId` on the `ReviewHistory` table. All the data in the column will be lost.
  - Added the required column `sessionId` to the `DesignReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `ReviewHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DesignReview" DROP CONSTRAINT "DesignReview_brandGuidelineId_fkey";

-- DropForeignKey
ALTER TABLE "DesignReview" DROP CONSTRAINT "DesignReview_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewHistory" DROP CONSTRAINT "ReviewHistory_designReviewId_fkey";

-- DropIndex
DROP INDEX "DesignReview_brandGuidelineId_idx";

-- DropIndex
DROP INDEX "DesignReview_userId_idx";

-- DropIndex
DROP INDEX "ReviewHistory_designReviewId_idx";

-- Create DesignReviewSession table first
-- CreateTable
CREATE TABLE "DesignReviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandGuidelineId" TEXT NOT NULL,
    "figmaUrl" TEXT NOT NULL,
    "figmaFileKey" TEXT NOT NULL,
    "figmaFileName" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignReviewSession_pkey" PRIMARY KEY ("id")
);

-- Create a session for each existing design review
INSERT INTO "DesignReviewSession" ("id", "userId", "brandGuidelineId", "figmaUrl", "figmaFileKey", "figmaFileName", "status", "createdAt", "updatedAt")
SELECT
    dr."id" || '_session', -- Create a unique ID for the session
    dr."userId",
    dr."brandGuidelineId",
    COALESCE(dr."originalFigmaUrl", 'https://figma.com/unknown'), -- Use originalFigmaUrl or default
    ff."figmaFileKey", -- Get from related FigmaFrame
    ff."figmaFileName", -- Get from related FigmaFrame
    dr."status",
    dr."createdAt",
    dr."updatedAt"
FROM "DesignReview" dr
JOIN "FigmaFrame" ff ON dr."frameId" = ff."id";

-- Now alter the DesignReview table to add sessionId
-- AlterTable
ALTER TABLE "DesignReview"
ADD COLUMN "sessionId" TEXT;

-- Update existing design reviews to link to their sessions
UPDATE "DesignReview"
SET "sessionId" = "id" || '_session'
WHERE "sessionId" IS NULL;

-- Now make sessionId required
ALTER TABLE "DesignReview"
ALTER COLUMN "sessionId" SET NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- Finally drop the columns we don't need anymore
ALTER TABLE "DesignReview"
DROP COLUMN "brandGuidelineId",
DROP COLUMN "originalFigmaUrl";

-- AlterTable for ReviewHistory
ALTER TABLE "ReviewHistory"
ADD COLUMN "frameId" TEXT,
ADD COLUMN "sessionId" TEXT;

-- Update existing history entries to link to the new sessions
UPDATE "ReviewHistory" rh
SET "sessionId" = dr."sessionId",
    "frameId" = dr."frameId"
FROM "DesignReview" dr
WHERE rh."designReviewId" = dr."id";

-- Now make sessionId required
ALTER TABLE "ReviewHistory"
ALTER COLUMN "sessionId" SET NOT NULL;

-- Finally drop the designReviewId column
ALTER TABLE "ReviewHistory"
DROP COLUMN "designReviewId";

-- CreateTable already done above

-- CreateIndex
CREATE INDEX "DesignReviewSession_userId_idx" ON "DesignReviewSession"("userId");

-- CreateIndex
CREATE INDEX "DesignReviewSession_brandGuidelineId_idx" ON "DesignReviewSession"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "DesignReview_sessionId_idx" ON "DesignReview"("sessionId");

-- CreateIndex
CREATE INDEX "ReviewHistory_sessionId_idx" ON "ReviewHistory"("sessionId");

-- CreateIndex
CREATE INDEX "ReviewHistory_frameId_idx" ON "ReviewHistory"("frameId");

-- AddForeignKey
ALTER TABLE "DesignReviewSession" ADD CONSTRAINT "DesignReviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReviewSession" ADD CONSTRAINT "DesignReviewSession_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DesignReviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHistory" ADD CONSTRAINT "ReviewHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DesignReviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
