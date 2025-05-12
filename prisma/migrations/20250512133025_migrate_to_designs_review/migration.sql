-- Step 1: Create new tables and types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReviewType') THEN
        CREATE TYPE "ReviewType" AS ENUM ('FIGMA', 'MANUAL');
    END IF;
END $$;

-- Step 2: Create new tables
CREATE TABLE "DesignsReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandGuidelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "figmaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "figmaFileId" TEXT,
    "reviewType" "ReviewType" NOT NULL DEFAULT 'FIGMA',
    CONSTRAINT "DesignsReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "designsReviewId" TEXT NOT NULL,
    "frameId" TEXT,
    "reviewJson" JSONB NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "originalFigmaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT,
    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes
CREATE INDEX "DesignsReview_userId_idx" ON "DesignsReview"("userId");
CREATE INDEX "DesignsReview_brandGuidelineId_idx" ON "DesignsReview"("brandGuidelineId");
CREATE INDEX "DesignsReview_figmaFileId_idx" ON "DesignsReview"("figmaFileId");
CREATE INDEX "Design_userId_idx" ON "Design"("userId");
CREATE INDEX "Design_designsReviewId_idx" ON "Design"("designsReviewId");
CREATE INDEX "Design_frameId_idx" ON "Design"("frameId");

-- Step 4: Add foreign key constraints
ALTER TABLE "DesignsReview" 
ADD CONSTRAINT "DesignsReview_brandGuidelineId_fkey" 
FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DesignsReview" 
ADD CONSTRAINT "DesignsReview_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Design" 
ADD CONSTRAINT "Design_designsReviewId_fkey" 
FOREIGN KEY ("designsReviewId") REFERENCES "DesignsReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Design" 
ADD CONSTRAINT "Design_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Safe data migration with proper column mappings
DO $$ 
BEGIN
    -- Migrate DesignReview data with correct column mappings
    INSERT INTO "DesignsReview" (
        "id", "userId", "brandGuidelineId", "name", 
        "description", "status", "figmaUrl", "createdAt", 
        "updatedAt", "figmaFileId", "reviewType"
    )
    SELECT 
        id,
        "userId",
        "brandGuidelineId",
        id,  -- Using id as name since name might not exist in old table
        NULL,  -- description is new
        status,
        NULL,  -- figmaUrl is new
        "createdAt",
        "updatedAt",
        NULL,  -- figmaFileId is new
        'FIGMA'::"ReviewType"
    FROM "DesignReview"
    ON CONFLICT DO NOTHING;

    -- Migrate FigmaFrame data with correct column mappings
    INSERT INTO "Design" (
        "id", "userId", "designsReviewId", "frameId",
        "reviewJson", "status", "originalFigmaUrl",
        "createdAt", "updatedAt", "fileName"
    )
    SELECT 
        ff."id",
        dr."userId",
        dr."id",
        ff."id",  -- using id as frameId
        COALESCE('{}'::jsonb, '{}'::jsonb),  -- Default empty JSON
        'PENDING'::"ReviewStatus",  -- Default status
        NULL,  -- originalFigmaUrl is new
        ff."createdAt",
        ff."updatedAt",
        ff."id"  -- using id as fileName
    FROM "FigmaFrame" ff
    JOIN "DesignReview" dr ON ff."brandGuidelineId" = dr."brandGuidelineId"
    ON CONFLICT DO NOTHING;
END $$;

-- Step 6: Update ReviewHistory safely
DO $$
BEGIN
    -- Add new column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ReviewHistory' 
        AND column_name = 'designsReviewId'
    ) THEN
        ALTER TABLE "ReviewHistory" ADD COLUMN "designsReviewId" TEXT;
    END IF;
END $$;

-- Copy data
UPDATE "ReviewHistory"
SET "designsReviewId" = "designReviewId"
WHERE "designReviewId" IS NOT NULL;

-- Make the column NOT NULL after data migration
ALTER TABLE "ReviewHistory" ALTER COLUMN "designsReviewId" SET NOT NULL;

-- Create new index and foreign key
CREATE INDEX "ReviewHistory_designsReviewId_idx" ON "ReviewHistory"("designsReviewId");

ALTER TABLE "ReviewHistory" 
ADD CONSTRAINT "ReviewHistory_designsReviewId_fkey" 
FOREIGN KEY ("designsReviewId") REFERENCES "DesignsReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Clean up old structures
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'ReviewHistory_designReviewId_fkey'
    ) THEN
        ALTER TABLE "ReviewHistory" DROP CONSTRAINT "ReviewHistory_designReviewId_fkey";
    END IF;
END $$;

DROP INDEX IF EXISTS "ReviewHistory_designReviewId_idx";
ALTER TABLE "ReviewHistory" DROP COLUMN IF EXISTS "designReviewId";

-- Finally, drop old tables
DROP TABLE IF EXISTS "DesignReview" CASCADE;
DROP TABLE IF EXISTS "FigmaFrame" CASCADE;
