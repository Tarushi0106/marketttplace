import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - Get single discount
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

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true } },
      },
    });

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    return NextResponse.json({ data: discount });
  } catch (error) {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount" },
      { status: 500 }
    );
  }
}

const updateDiscountSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value: z.number().min(0).optional(),
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

// PUT - Update discount
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
    const data = updateDiscountSchema.parse(body);

    const existingDiscount = await prisma.discount.findUnique({ where: { id } });
    if (!existingDiscount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    // Check code uniqueness if updating
    if (data.code && data.code.toUpperCase() !== existingDiscount.code) {
      const codeExists = await prisma.discount.findUnique({
        where: { code: data.code.toUpperCase() },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "A discount with this code already exists" },
          { status: 400 }
        );
      }
    }

    const { startsAt, expiresAt, code, ...discountData } = data;

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        ...discountData,
        ...(code && { code: code.toUpperCase() }),
        startsAt: startsAt !== undefined ? (startsAt ? new Date(startsAt) : null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      },
    });

    return NextResponse.json({ data: discount });
  } catch (error) {
    console.error("Error updating discount:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount
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

    const existingDiscount = await prisma.discount.findUnique({ where: { id } });
    if (!existingDiscount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    await prisma.discount.delete({ where: { id } });

    return NextResponse.json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}
