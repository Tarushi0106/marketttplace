import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - Get single bundle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bundle = await prisma.bundle.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                category: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        seoMetadata: true,
      },
    });

    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ data: bundle });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}

const updateBundleSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().min(0).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isCustomizable: z.boolean().optional(),
  minItems: z.number().int().optional().nullable(),
  maxItems: z.number().int().optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).optional(),
    isRequired: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  })).optional(),
});

// PUT - Update bundle
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
    const data = updateBundleSchema.parse(body);

    const existingBundle = await prisma.bundle.findUnique({ where: { id } });
    if (!existingBundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    // Check slug uniqueness if updating
    if (data.slug && data.slug !== existingBundle.slug) {
      const slugExists = await prisma.bundle.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A bundle with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const { items, validFrom, validUntil, ...bundleData } = data;

    // Update bundle and items in a transaction
    const bundle = await prisma.$transaction(async (tx) => {
      // If items are provided, delete existing and create new
      if (items) {
        await tx.bundleItem.deleteMany({ where: { bundleId: id } });
        await tx.bundleItem.createMany({
          data: items.map((item, index) => ({
            bundleId: id,
            productId: item.productId,
            quantity: item.quantity || 1,
            isRequired: item.isRequired ?? true,
            isDefault: item.isDefault ?? true,
            sortOrder: index,
          })),
        });
      }

      return tx.bundle.update({
        where: { id },
        data: {
          ...bundleData,
          validFrom: validFrom !== undefined ? (validFrom ? new Date(validFrom) : null) : undefined,
          validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : undefined,
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, basePrice: true },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    return NextResponse.json({ data: bundle });
  } catch (error) {
    console.error("Error updating bundle:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

// DELETE - Delete bundle
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

    const existingBundle = await prisma.bundle.findUnique({ where: { id } });
    if (!existingBundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    await prisma.bundle.delete({ where: { id } });

    return NextResponse.json({ message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json(
      { error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}
