import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Upload design files for a review
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "You must be logged in to upload files" }, { status: 401 });
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the multipart form data
    const formData = await req.formData();

    // Get the design review ID
    const designsReviewId = formData.get("designsReviewId") as string;
    if (!designsReviewId) {
      return NextResponse.json({ error: "Design review ID is required" }, { status: 400 });
    }

    const { DesignReviewService } = await import(
      "@/features/design-review/services/design-review-service"
    );
    const designReviewService = DesignReviewService.getInstance();

    // Get the design review
    const designReview = await designReviewService.getDesignsReview(designsReviewId);
    if (!designReview) {
      return NextResponse.json({ error: "Design review not found" }, { status: 404 });
    }

    // Check if the user owns the design review
    if (designReview.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to upload files to this design review" },
        { status: 403 }
      );
    }

    // Check if this is a manual review
    if (designReview.reviewType !== "MANUAL") {
      return NextResponse.json(
        { error: "Files can only be uploaded to manual reviews" },
        { status: 400 }
      );
    }

    // Process the uploaded files
    const files: Array<{
      buffer: Buffer;
      filename: string;
      mimeType: string;
    }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file") && value instanceof Blob) {
        try {
          // Convert Blob to Buffer
          const arrayBuffer = await value.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Get filename and mimetype
          const filename = value.name || `file-${Date.now()}`;
          const mimeType = value.type || "application/octet-stream";

          files.push({ buffer, filename, mimeType });
        } catch (error) {
          console.error("Error processing file:", error);
          return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
        }
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files were uploaded" }, { status: 400 });
    }

    // Upload the files
    const designs = await designReviewService.uploadDesignFiles({
      designsReviewId,
      userId: user.id,
      files,
    });

    return NextResponse.json(designs);
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
