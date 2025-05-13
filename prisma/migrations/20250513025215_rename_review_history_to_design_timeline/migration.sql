-- CreateEnum (must come before usage)
CREATE TYPE "ReviewTimelineAction" AS ENUM (
  'INITIAL_REVIEW',
  'RECHECK',
  'NEW_ISSUES_FOUND',
  'ISSUES_FIXED',
  'ISSUES_PARTIALLY_FIXED'
);

-- CreateTable (target destination for migration)
CREATE TABLE "DesignTimeline" (
  "id" TEXT NOT NULL,
  "action" "ReviewTimelineAction" NOT NULL,
  "summary" TEXT NOT NULL,
  "changes" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "designId" TEXT NOT NULL,

  CONSTRAINT "DesignTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignTimeline_designId_idx" ON "DesignTimeline"("designId");
CREATE INDEX "DesignTimeline_timestamp_idx" ON "DesignTimeline"("timestamp");

-- ✅ Migrate ONLY rows with valid foreign keys
INSERT INTO "DesignTimeline" (
  "id",
  "action",
  "summary",
  "changes",
  "timestamp",
  "designId"
)
SELECT
  "id",
  "action"::text::"ReviewTimelineAction", -- Cast enum to new type
  "summary",
  "changes",
  "timestamp",
  "designsReviewId" AS "designId"
FROM "ReviewHistory"
WHERE "designsReviewId" IS NOT NULL
  AND "designsReviewId" IN (SELECT "id" FROM "Design");

-- Drop foreign key first
ALTER TABLE "ReviewHistory"
  DROP CONSTRAINT "ReviewHistory_designsReviewId_fkey";

-- Drop old table
DROP TABLE "ReviewHistory";

-- Drop old enum
DROP TYPE "ReviewHistoryAction";

-- Add FK constraint to new table
ALTER TABLE "DesignTimeline"
  ADD CONSTRAINT "DesignTimeline_designId_fkey"
  FOREIGN KEY ("designId") REFERENCES "Design"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
