import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - List all bundles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  basePrice: true,
                  images: { take: 1 },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { items: true } },
        },
        orderBy: { sortOrder: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.bundle.count({ where }),
    ]);

    return NextResponse.json({
      data: bundles,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

const createBundleSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  image: z.string().optional(),
  price: z.number().min(0),
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
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).optional(),
    isRequired: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  })).optional(),
});

// POST - Create bundle
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createBundleSchema.parse(body);

    // Check if slug already exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { slug: data.slug },
    });

    if (existingBundle) {
      return NextResponse.json(
        { error: "A bundle with this slug already exists" },
        { status: 400 }
      );
    }

    const { items, validFrom, validUntil, ...bundleData } = data;

    const bundle = await prisma.bundle.create({
      data: {
        ...bundleData,
        discountValue: data.discountValue || 0,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        items: items ? {
          create: items.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            isRequired: item.isRequired ?? true,
            isDefault: item.isDefault ?? true,
            sortOrder: index,
          })),
        } : undefined,
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, basePrice: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: bundle }, { status: 201 });
  } catch (error) {
    console.error("Error creating bundle:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}
