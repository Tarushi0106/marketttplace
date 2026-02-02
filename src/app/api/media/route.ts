import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// GET - List all media
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (type && type !== "all") {
      if (type === "image") {
        where.mimeType = { startsWith: "image/" };
      } else if (type === "video") {
        where.mimeType = { startsWith: "video/" };
      } else if (type === "audio") {
        where.mimeType = { startsWith: "audio/" };
      } else if (type === "document") {
        where.mimeType = {
          in: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ],
        };
      }
    }

    if (folder) {
      where.folder = folder;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      data: media,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Upload media
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let url: string;
    let publicId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;

    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_CLOUD_NAME !== "placeholder" &&
      process.env.CLOUDINARY_API_KEY !== "placeholder";

    if (cloudinaryConfigured && file.type.startsWith("image/")) {
      try {
        const result = await uploadImage(buffer, { folder: `marketplace/${folder}` });
        url = result.secure_url;
        publicId = result.public_id;
        width = result.width;
        height = result.height;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, falling back to local:", cloudinaryError);
        url = await saveLocally(buffer, file.name, folder);
      }
    } else {
      url = await saveLocally(buffer, file.name, folder);
    }

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename: path.basename(url),
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        publicId,
        width,
        height,
        alt,
        folder,
      },
    });

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}

async function saveLocally(buffer: Buffer, filename: string, folder: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(filename);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${uniqueName}`;
}
