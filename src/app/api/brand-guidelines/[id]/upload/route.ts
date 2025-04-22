import { brandSetupService } from "@/features/brand-setup/services";
import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Upload files for a brand guideline
 */
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // Extract the ID from the context params
  const { id } = await Promise.resolve(context.params);
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to upload files" },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get the brand guideline
    const brandGuideline = await brandSetupService.getBrandGuideline(id);

    if (!brandGuideline) {
      return NextResponse.json(
        { error: "Brand guideline not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to upload files to this brand guideline" },
        { status: 403 }
      );
    }

    // Parse the multipart form data
    const formData = await req.formData();

    // Get the PDF file if available
    const pdfFile = formData.get('pdfFile');
    if (pdfFile && typeof pdfFile !== 'string') {
      // Convert the blob/file to a buffer
      const arrayBuffer = await (pdfFile as unknown as { arrayBuffer(): Promise<ArrayBuffer> }).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Get filename and mimetype safely
      const filename = (pdfFile as any).name || 'document.pdf';
      const mimeType = (pdfFile as any).type || 'application/pdf';

      await brandSetupService.uploadBrandGuidelinePdf({
        brandGuidelineId: id,
        buffer,
        filename,
        mimeType,
      });
    }

    // Get the design images if available
    const designImages: Array<{
      buffer: Buffer;
      filename: string;
      mimeType: string;
      name?: string;
      description?: string;
    }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('designImages') && typeof value !== 'string') {
        // Convert the blob/file to a buffer
        const arrayBuffer = await (value as unknown as { arrayBuffer(): Promise<ArrayBuffer> }).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get filename and mimetype safely
        const filename = (value as any).name || 'image.jpg';
        const mimeType = (value as any).type || 'image/jpeg';

        // Get the image name and description if available
        const nameKey = key.replace('designImages', 'designImageNames');
        const descriptionKey = key.replace('designImages', 'designImageDescriptions');

        designImages.push({
          buffer,
          filename,
          mimeType,
          name: formData.get(nameKey) as string || undefined,
          description: formData.get(descriptionKey) as string || undefined,
        });
      }
    }

    if (designImages.length > 0) {
      await brandSetupService.uploadDesignImages({
        brandGuidelineId: id,
        images: designImages,
      });
    }

    // Get the custom rules if available
    const customRulesJson = formData.get('customRules') as string | null;
    if (customRulesJson) {
      const customRules = JSON.parse(customRulesJson);

      if (Array.isArray(customRules) && customRules.length > 0) {
        await brandSetupService.addCustomRules({
          brandGuidelineId: id,
          rules: customRules,
        });
      }
    }

    // Start the analysis if requested
    const startAnalysis = formData.get('startAnalysis') === 'true';
    if (startAnalysis) {
      await brandSetupService.startAnalysis(id);
    }

    // Get the updated brand guideline
    const updatedBrandGuideline = await brandSetupService.getBrandGuideline(id);

    return NextResponse.json(updatedBrandGuideline);
  } catch (error) {
    console.error("Error uploading files:", error);

    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
