import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";
    const includeSubCategories = searchParams.get("includeSubCategories") !== "false";

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        subCategories: includeSubCategories
          ? {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
              include: {
                _count: {
                  select: { products: { where: { status: "ACTIVE" } } },
                },
              },
            }
          : false,
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
        ...(includeProducts && {
          products: {
            where: { status: "ACTIVE" },
            take: 6,
            orderBy: { salesCount: "desc" },
            include: {
              images: { take: 1 },
            },
          },
        }),
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

const subCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  iconBgColor: z.string().optional(),
  isTrending: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  subCategories: z.array(subCategorySchema).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createCategorySchema.parse(body);

    // Extract subcategories from data
    const { subCategories, ...categoryData } = data;

    // Check if category slug is unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // Check for duplicate subcategory slugs
    if (subCategories && subCategories.length > 0) {
      const subSlugs = subCategories.map(s => s.slug);
      const existingSubCategories = await prisma.subCategory.findMany({
        where: { slug: { in: subSlugs } },
      });

      if (existingSubCategories.length > 0) {
        return NextResponse.json(
          { error: `Subcategory slug "${existingSubCategories[0].slug}" already exists` },
          { status: 400 }
        );
      }
    }

    // Create category with subcategories in a transaction
    const category = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.category.create({
        data: categoryData,
      });

      // Create subcategories if provided
      if (subCategories && subCategories.length > 0) {
        await tx.subCategory.createMany({
          data: subCategories.map((sub, index) => ({
            categoryId: newCategory.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description || "",
            image: sub.image || "",
            isActive: sub.isActive ?? true,
            sortOrder: sub.sortOrder ?? index,
          })),
        });
      }

      // Return the category with subcategories
      return tx.category.findUnique({
        where: { id: newCategory.id },
        include: {
          subCategories: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: { products: true },
          },
        },
      });
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
