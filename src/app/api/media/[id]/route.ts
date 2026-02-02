import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";

// GET - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

const updateMediaSchema = z.object({
  alt: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  folder: z.string().optional(),
});

// PUT - Update media metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateMediaSchema.parse(body);

    const existingMedia = await prisma.media.findUnique({ where: { id } });
    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const media = await prisma.media.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("Error updating media:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingMedia = await prisma.media.findUnique({ where: { id } });
    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Try to delete local file if it's a local upload
    if (existingMedia.url.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", existingMedia.url);
        await unlink(filePath);
      } catch (fileError) {
        console.error("Error deleting local file:", fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // TODO: If using Cloudinary, delete from Cloudinary using publicId
    // if (existingMedia.publicId) {
    //   await deleteFromCloudinary(existingMedia.publicId);
    // }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
