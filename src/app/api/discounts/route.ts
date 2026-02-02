import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - List all discounts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};

    if (status === "active") {
      where.isActive = true;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ];
    } else if (status === "expired") {
      where.expiresAt = { lt: new Date() };
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    const discounts = await prisma.discount.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: discounts });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

const createDiscountSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0),
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perUserLimit: z.number().int().min(1).optional().nullable(),
  applicableTo: z.enum(["ALL", "PRODUCTS", "CATEGORIES", "BUNDLES"]).optional(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

// POST - Create discount
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createDiscountSchema.parse(body);

    // Check if code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: "A discount with this code already exists" },
        { status: 400 }
      );
    }

    const { startsAt, expiresAt, ...discountData } = data;

    const discount = await prisma.discount.create({
      data: {
        ...discountData,
        code: data.code.toUpperCase(),
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ data: discount }, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}
