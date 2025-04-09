import { brandSetupService } from "@/features/brand-setup/services";
import { prisma } from "@/lib/prisma";
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
    const pdfFile = formData.get('pdfFile') as File | null;
    if (pdfFile) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      await brandSetupService.uploadBrandGuidelinePdf({
        brandGuidelineId: id,
        buffer,
        filename: pdfFile.name,
        mimeType: pdfFile.type,
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
      if (key.startsWith('designImages') && value instanceof File) {
        const file = value as File;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Get the image name and description if available
        const nameKey = key.replace('designImages', 'designImageNames');
        const descriptionKey = key.replace('designImages', 'designImageDescriptions');

        designImages.push({
          buffer,
          filename: file.name,
          mimeType: file.type,
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
