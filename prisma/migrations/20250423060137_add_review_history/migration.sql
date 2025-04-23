/*
  Warnings:

  - You are about to drop the column `figmaFileId` on the `FigmaFrame` table. All the data in the column will be lost.
  - You are about to drop the `FigmaComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FigmaFile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[figmaFileKey,frameId]` on the table `FigmaFrame` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brandGuidelineId` to the `DesignReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DesignReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brandGuidelineId` to the `FigmaFrame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `figmaFileKey` to the `FigmaFrame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `figmaFileName` to the `FigmaFrame` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReviewHistoryAction" AS ENUM ('INITIAL_REVIEW', 'RECHECK', 'NEW_ISSUES_FOUND', 'ISSUES_FIXED', 'ISSUES_PARTIALLY_FIXED');

-- DropForeignKey
ALTER TABLE "FigmaComment" DROP CONSTRAINT "FigmaComment_frameId_fkey";

-- DropForeignKey
ALTER TABLE "FigmaComment" DROP CONSTRAINT "FigmaComment_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "FigmaFile" DROP CONSTRAINT "FigmaFile_projectId_fkey";

-- DropForeignKey
ALTER TABLE "FigmaFrame" DROP CONSTRAINT "FigmaFrame_figmaFileId_fkey";

-- DropIndex
DROP INDEX "FigmaFrame_figmaFileId_idx";

-- AlterTable
ALTER TABLE "DesignReview" ADD COLUMN     "brandGuidelineId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FigmaFrame" DROP COLUMN "figmaFileId",
ADD COLUMN     "brandGuidelineId" TEXT NOT NULL,
ADD COLUMN     "figmaFileKey" TEXT NOT NULL,
ADD COLUMN     "figmaFileName" TEXT NOT NULL,
ADD COLUMN     "lastSynced" TIMESTAMP(3);

-- DropTable
DROP TABLE "FigmaComment";

-- DropTable
DROP TABLE "FigmaFile";

-- CreateTable
CREATE TABLE "ReviewHistory" (
    "id" TEXT NOT NULL,
    "designReviewId" TEXT NOT NULL,
    "action" "ReviewHistoryAction" NOT NULL,
    "summary" TEXT NOT NULL,
    "changes" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewHistory_designReviewId_idx" ON "ReviewHistory"("designReviewId");

-- CreateIndex
CREATE INDEX "ReviewHistory_timestamp_idx" ON "ReviewHistory"("timestamp");

-- CreateIndex
CREATE INDEX "DesignReview_userId_idx" ON "DesignReview"("userId");

-- CreateIndex
CREATE INDEX "DesignReview_brandGuidelineId_idx" ON "DesignReview"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "FigmaFrame_brandGuidelineId_idx" ON "FigmaFrame"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "FigmaFrame_figmaFileKey_idx" ON "FigmaFrame"("figmaFileKey");

-- CreateIndex
CREATE UNIQUE INDEX "FigmaFrame_figmaFileKey_frameId_key" ON "FigmaFrame"("figmaFileKey", "frameId");

-- AddForeignKey
ALTER TABLE "FigmaFrame" ADD CONSTRAINT "FigmaFrame_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHistory" ADD CONSTRAINT "ReviewHistory_designReviewId_fkey" FOREIGN KEY ("designReviewId") REFERENCES "DesignReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
