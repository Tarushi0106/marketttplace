import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all trending categories (for storefront)
export async function GET() {
  try {
    const categories = await prisma.trendingCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Error fetching trending categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new trending category (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, iconBgColor, isActive, sortOrder } = body;

    if (!name || !icon) {
      return NextResponse.json(
        { error: "Name and icon are required" },
        { status: 400 }
      );
    }

    const category = await prisma.trendingCategory.create({
      data: {
        name,
        description,
        icon,
        iconBgColor: iconBgColor || "#000000",
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Error creating trending category:", error);
    return NextResponse.json(
      { error: "Failed to create trending category" },
      { status: 500 }
    );
  }
}
