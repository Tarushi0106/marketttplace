import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
        },
        seoMetadata: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  template: z.string().optional().nullable(),
  isHomepage: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  sections: z.array(z.object({
    id: z.string().optional(),
    type: z.string(),
    title: z.string().optional().nullable(),
    content: z.any(),
    settings: z.any().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })).optional(),
});

// PUT - Update page
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
    const data = updatePageSchema.parse(body);

    const existingPage = await prisma.page.findUnique({ where: { id } });
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check slug uniqueness
    if (data.slug && data.slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If setting as homepage, unset other homepages
    if (data.isHomepage && !existingPage.isHomepage) {
      await prisma.page.updateMany({
        where: { isHomepage: true, id: { not: id } },
        data: { isHomepage: false },
      });
    }

    const { sections, ...pageData } = data;

    // Update page and sections in a transaction
    const page = await prisma.$transaction(async (tx) => {
      // If sections are provided, handle them
      if (sections) {
        // Delete existing sections and create new ones
        await tx.pageSection.deleteMany({ where: { pageId: id } });
        await tx.pageSection.createMany({
          data: sections.map((section, index) => ({
            pageId: id,
            type: section.type,
            title: section.title,
            content: section.content || {},
            settings: section.settings || {},
            isActive: section.isActive ?? true,
            sortOrder: section.sortOrder ?? index,
          })),
        });
      }

      return tx.page.update({
        where: { id },
        data: {
          ...pageData,
          publishedAt: data.status === "PUBLISHED" && !existingPage.publishedAt
            ? new Date()
            : existingPage.publishedAt,
        },
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error("Error updating page:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// DELETE - Delete page
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

    const existingPage = await prisma.page.findUnique({ where: { id } });
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (existingPage.isHomepage) {
      return NextResponse.json(
        { error: "Cannot delete the homepage. Set another page as homepage first." },
        { status: 400 }
      );
    }

    await prisma.page.delete({ where: { id } });

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
