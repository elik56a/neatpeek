import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { storageProvider } from "@/services/storage";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, params } = await request.json();

    switch (action) {
      case "saveFile":
        const saveResult = await storageProvider.saveFile(params);
        return NextResponse.json(saveResult);

      case "getFileUrl":
        const url = storageProvider.getFileUrl(params.path);
        return NextResponse.json({ url });

      case "getFile":
        const buffer = await storageProvider.getFile(params.path);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });

      case "deleteFile":
        await storageProvider.deleteFile(params.path);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("File Service Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
