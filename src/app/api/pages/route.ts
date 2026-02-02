import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - List all pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const template = searchParams.get("template");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (template && template !== "all") {
      where.template = template;
    }

    const pages = await prisma.page.findMany({
      where,
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { sections: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

const createPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  template: z.string().optional(),
  isHomepage: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  sections: z.array(z.object({
    type: z.string(),
    title: z.string().optional(),
    content: z.any(),
    settings: z.any().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })).optional(),
});

// POST - Create page
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createPageSchema.parse(body);

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: data.slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    // If setting as homepage, unset other homepages
    if (data.isHomepage) {
      await prisma.page.updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false },
      });
    }

    const { sections, ...pageData } = data;

    const page = await prisma.page.create({
      data: {
        ...pageData,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        sections: sections ? {
          create: sections.map((section, index) => ({
            type: section.type,
            title: section.title,
            content: section.content || {},
            settings: section.settings || {},
            isActive: section.isActive ?? true,
            sortOrder: section.sortOrder ?? index,
          })),
        } : undefined,
      },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: page }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
