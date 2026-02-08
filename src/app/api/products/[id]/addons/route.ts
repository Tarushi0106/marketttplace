import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/products/[id]/addons - Get addons for a product (including category addons)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch product with category
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Get product-specific addons
    const productAddons = await prisma.productAddon.findMany({
      where: {
        productId: params.id,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // Get category addons (if product has a category)
    let categoryAddons: any[] = [];
    if (product.categoryId) {
      categoryAddons = await prisma.categoryAddon.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
        },
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        productAddons,
        categoryAddons,
        total: productAddons.length + categoryAddons.length,
      },
    });
  } catch (error) {
    console.error("Error fetching addons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addons" },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/addons - Create a new product addon
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
    const { name, description, price, pricingType, isRequired, categoryAddonId, sortOrder } = body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // If categoryAddonId is provided, verify it exists
    let categoryAddon = null;
    if (categoryAddonId) {
      categoryAddon = await prisma.categoryAddon.findUnique({
        where: { id: categoryAddonId },
      });

      if (!categoryAddon) {
        return NextResponse.json(
          { success: false, error: "Category addon not found" },
          { status: 404 }
        );
      }
    }

    const addon = await prisma.productAddon.create({
      data: {
        productId: params.id,
        name,
        description,
        price: parseFloat(price),
        pricingType: pricingType || "ONE_TIME",
        isRequired: isRequired || false,
        categoryAddonId,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: addon,
    });
  } catch (error) {
    console.error("Error creating product addon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create addon" },
      { status: 500 }
    );
  }
}
