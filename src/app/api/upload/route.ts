import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    // Check origin for admin panel requests
    const origin = request.headers.get("origin") || request.headers.get("referer");

    // Allow requests from localhost (admin panel)
    if (!origin?.includes("localhost:3000") && !origin?.includes("127.0.0.1:3000")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/x-icon"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, ICO" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Cloudinary first, fall back to local storage
    let url: string;

    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_CLOUD_NAME !== "placeholder" &&
      process.env.CLOUDINARY_API_KEY !== "placeholder";

    if (cloudinaryConfigured) {
      // Upload to Cloudinary
      try {
        const result = await uploadImage(buffer, { folder: `marketplace/${folder}` });
        url = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, falling back to local:", cloudinaryError);
        url = await saveLocally(buffer, file.name, folder);
      }
    } else {
      // Save locally if Cloudinary not configured
      url = await saveLocally(buffer, file.name, folder);
    }

    return NextResponse.json({
      url,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

async function saveLocally(buffer: Buffer, filename: string, folder: string): Promise<string> {
  // Create uploads directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const ext = path.extname(filename);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  // Save file
  await writeFile(filePath, buffer);

  // Return public URL
  return `/uploads/${folder}/${uniqueName}`;
}
