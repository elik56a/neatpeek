-- CreateTable
CREATE TABLE "BrandGuideline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "pdfPath" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "processingMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandGuideline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignImage" (
    "id" TEXT NOT NULL,
    "brandGuidelineId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRule" (
    "id" TEXT NOT NULL,
    "brandGuidelineId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandRule" (
    "id" TEXT NOT NULL,
    "brandGuidelineId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandGuideline_userId_idx" ON "BrandGuideline"("userId");

-- CreateIndex
CREATE INDEX "DesignImage_brandGuidelineId_idx" ON "DesignImage"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "CustomRule_brandGuidelineId_idx" ON "CustomRule"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "BrandRule_brandGuidelineId_idx" ON "BrandRule"("brandGuidelineId");

-- CreateIndex
CREATE INDEX "BrandRule_category_idx" ON "BrandRule"("category");

-- AddForeignKey
ALTER TABLE "BrandGuideline" ADD CONSTRAINT "BrandGuideline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignImage" ADD CONSTRAINT "DesignImage_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRule" ADD CONSTRAINT "CustomRule_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandRule" ADD CONSTRAINT "BrandRule_brandGuidelineId_fkey" FOREIGN KEY ("brandGuidelineId") REFERENCES "BrandGuideline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
