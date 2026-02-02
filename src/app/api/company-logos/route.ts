import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all company logos (for storefront)
export async function GET() {
  try {
    const logos = await prisma.companyLogo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: logos });
  } catch (error) {
    console.error("Error fetching company logos:", error);
    return NextResponse.json(
      { error: "Failed to fetch company logos" },
      { status: 500 }
    );
  }
}

// POST - Create a new company logo (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logo, website, isActive, sortOrder } = body;

    if (!name || !logo) {
      return NextResponse.json(
        { error: "Name and logo URL are required" },
        { status: 400 }
      );
    }

    const companyLogo = await prisma.companyLogo.create({
      data: {
        name,
        logo,
        website: website || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ data: companyLogo }, { status: 201 });
  } catch (error) {
    console.error("Error creating company logo:", error);
    return NextResponse.json(
      { error: "Failed to create company logo" },
      { status: 500 }
    );
  }
}
