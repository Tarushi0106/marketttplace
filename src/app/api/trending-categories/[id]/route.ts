import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch single trending category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.trendingCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Trending category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Error fetching trending category:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending category" },
      { status: 500 }
    );
  }
}

// PUT - Update trending category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, iconBgColor, isActive, sortOrder } = body;

    const category = await prisma.trendingCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
        ...(iconBgColor && { iconBgColor }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Error updating trending category:", error);
    return NextResponse.json(
      { error: "Failed to update trending category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete trending category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.trendingCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Trending category deleted" });
  } catch (error) {
    console.error("Error deleting trending category:", error);
    return NextResponse.json(
      { error: "Failed to delete trending category" },
      { status: 500 }
    );
  }
}
