/*
  Warnings:

  - You are about to drop the column `sessionId` on the `DesignReview` table. All the data in the column will be lost.
  - You are about to drop the column `frameId` on the `ReviewHistory` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `ReviewHistory` table. All the data in the column will be lost.
  - You are about to drop the `DesignReviewSession` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `brandGuidelineId` to the `DesignReview` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `DesignReview` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `designReviewId` to the `ReviewHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DesignReview" DROP CONSTRAINT "DesignReview_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "DesignReview" DROP CONSTRAINT "DesignReview_userId_fkey";

-- DropForeignKey
ALTER TABLE "DesignReviewSession" DROP CONSTRAINT "DesignReviewSession_brandGuidelineId_fkey";

-- DropForeignKey
ALTER TABLE "DesignReviewSession" DROP CONSTRAINT "DesignReviewSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewHistory" DROP CONSTRAINT "ReviewHistory_sessionId_fkey";

-- DropIndex
DROP INDEX "DesignReview_sessionId_idx";

-- DropIndex
DROP INDEX "ReviewHistory_frameId_idx";

-- DropIndex
DROP INDEX "ReviewHistory_sessionId_idx";

-- AlterTable
ALTER TABLE "DesignReview" DROP COLUMN "sessionId",
ADD COLUMN     "brandGuidelineId" TEXT NOT NULL,
ADD COLUMN     "originalFigmaUrl" TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ReviewHistory" DROP COLUMN "frameId",
DROP COLUMN "sessionId",
ADD COLUMN     "designReviewId" TEXT NOT NULL;

-- DropTable
DROP TABLE "DesignReviewSession";

-- CreateIndex
CREATE INDEX "DesignReview_userId_idx" ON "DesignReview"("userId");

-- CreateIndex
CREATE INDEX "DesignReview_brandGuidelineId_idx" ON "DesignReview"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "ReviewHistory_designReviewId_idx" ON "ReviewHistory"("designReviewId");

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHistory" ADD CONSTRAINT "ReviewHistory_designReviewId_fkey" FOREIGN KEY ("designReviewId") REFERENCES "DesignReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
