import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";
    const activeOnly = searchParams.get("activeOnly") === "true";

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: {
          // Return all subcategories for admin editing, only active for storefront
          ...(activeOnly && { where: { isActive: true } }),
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            products: true,
            subCategories: true,
          },
        },
        ...(includeProducts && {
          products: {
            where: { status: "ACTIVE" },
            take: 12,
            orderBy: { salesCount: "desc" },
            include: {
              images: { take: 1 },
            },
          },
        }),
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT - Update category
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
    const {
      name,
      slug,
      description,
      image,
      heroImage,
      icon,
      iconBgColor,
      isTrending,
      isActive,
      sortOrder,
      subCategories,
    } = body;

    // Build update data object with only provided fields
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (heroImage !== undefined) updateData.heroImage = heroImage;
    if (icon !== undefined) updateData.icon = icon;
    if (iconBgColor !== undefined) updateData.iconBgColor = iconBgColor;
    if (isTrending !== undefined) updateData.isTrending = isTrending;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Check for slug uniqueness if slug is being updated
    if (slug) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle subcategories if provided
    if (subCategories !== undefined && Array.isArray(subCategories)) {
      // Check for duplicate subcategory slugs (excluding current category's subcategories)
      const newSubSlugs = subCategories.map((s: any) => s.slug);
      const existingSubCategories = await prisma.subCategory.findMany({
        where: {
          slug: { in: newSubSlugs },
          categoryId: { not: id },
        },
      });

      if (existingSubCategories.length > 0) {
        return NextResponse.json(
          { error: `Subcategory slug "${existingSubCategories[0].slug}" already exists in another category` },
          { status: 400 }
        );
      }

      // Get current subcategories
      const currentSubCategories = await prisma.subCategory.findMany({
        where: { categoryId: id },
      });
      const currentSubIds = currentSubCategories.map(s => s.id);

      // Determine which subcategories to create, update, or delete
      const submittedIds = subCategories
        .filter((s: any) => s.id)
        .map((s: any) => s.id);
      const toDelete = currentSubIds.filter(cid => !submittedIds.includes(cid));

      // Use transaction for atomic updates
      await prisma.$transaction(async (tx) => {
        // Update category
        await tx.category.update({
          where: { id },
          data: updateData,
        });

        // Delete removed subcategories
        if (toDelete.length > 0) {
          await tx.subCategory.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        // Create or update subcategories
        for (const sub of subCategories as any[]) {
          if (sub.id && currentSubIds.includes(sub.id)) {
            // Update existing subcategory
            await tx.subCategory.update({
              where: { id: sub.id },
              data: {
                name: sub.name,
                slug: sub.slug,
                description: sub.description || "",
                image: sub.image || "",
                icon: sub.icon || null,
                iconBgColor: sub.iconBgColor || null,
                isActive: sub.isActive ?? true,
                sortOrder: sub.sortOrder ?? 0,
              },
            });
          } else {
            // Create new subcategory
            await tx.subCategory.create({
              data: {
                categoryId: id,
                name: sub.name,
                slug: sub.slug,
                description: sub.description || "",
                image: sub.image || "",
                icon: sub.icon || null,
                iconBgColor: sub.iconBgColor || null,
                isActive: sub.isActive ?? true,
                sortOrder: sub.sortOrder ?? 0,
              },
            });
          }
        }
      });
    } else {
      // Just update the category without touching subcategories
      await prisma.category.update({
        where: { id },
        data: updateData,
      });
    }

    // Fetch and return updated category with subcategories
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            products: true,
            subCategories: true,
          },
        },
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
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

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products. Remove or reassign products first." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
