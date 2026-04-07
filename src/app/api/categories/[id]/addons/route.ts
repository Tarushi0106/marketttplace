import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/categories/[id]/addons - Get addons for a category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";

    const addons = await prisma.categoryAddon.findMany({
      where: {
        categoryId: params.id,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
      include: includeProducts
        ? {
            products: {
              where: {
                product: {
                  status: "ACTIVE",
                },
              },
              select: {
                productId: true,
              },
            },
          }
        : undefined,
    });

    return NextResponse.json({
      success: true,
      data: addons,
    });
  } catch (error) {
    console.error("Error fetching category addons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addons" },
      { status: 500 }
    );
  }
}

// POST /api/categories/[id]/addons - Create a new category addon
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon, price, pricingType, billingCycle, monthlyPrice, yearlyPrice, options, isRequired, sortOrder } = body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check for duplicate addon name in this category
    const existingAddon = await prisma.categoryAddon.findFirst({
      where: {
        categoryId: params.id,
        name,
      },
    });

    if (existingAddon) {
      return NextResponse.json(
        { success: false, error: "Addon with this name already exists in this category" },
        { status: 400 }
      );
    }

    const addon = await prisma.categoryAddon.create({
      data: {
        categoryId: params.id,
        name,
        description,
        icon,
        price: parseFloat(price),
        pricingType: pricingType || "ONE_TIME",
        billingCycle: billingCycle || "ONE_TIME",
        monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
        yearlyPrice: yearlyPrice ? parseFloat(yearlyPrice) : null,
        options,
        isRequired: isRequired || false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: addon,
    });
  } catch (error) {
    console.error("Error creating category addon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create addon" },
      { status: 500 }
    );
  }
}
