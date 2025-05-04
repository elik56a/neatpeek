import { NextResponse } from "next/server";

// Mock database for demonstration purposes
const mockDatabase = new Map();

// POST: Create or update brand guidelines
export async function POST(request: Request) {
  const formData = await request.formData();
  const brandId = formData.get("brandId") || Date.now().toString();

  const brandData = {
    brandName: formData.get("brandName"),
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    accentColor: formData.get("accentColor"),
    primaryFont: formData.get("primaryFont"),
    secondaryFont: formData.get("secondaryFont"),
    spacing: formData.get("spacing"),
    additionalNotes: formData.get("additionalNotes"),
    customRules: JSON.parse(formData.get("customRules") || "[]"),
    logo: formData.get("logo"),
    guidelinesFile: formData.get("guidelinesFile"),
    designImages: formData.getAll("designImages"),
  };

  mockDatabase.set(brandId, brandData);
  console.log({
    brandId,
    brandData,
  });

  return NextResponse.json({ success: true, brandId });
}

// GET: Fetch brand data
export async function GET(request: Request) {
  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId");

  //   if (!brandId || !mockDatabase.has(brandId)) {
  //     return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
  //   }

  return NextResponse.json({ success: true, data: mockDatabase.get(brandId) });
}

// DELETE: Delete brand guidelines
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId");

  if (!brandId || !mockDatabase.has(brandId)) {
    return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
  }

  mockDatabase.delete(brandId);

  return NextResponse.json({ success: true });
}
