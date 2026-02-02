import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all trending categories (for storefront)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        isTrending: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        iconBgColor: true,
        image: true,
      },
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
