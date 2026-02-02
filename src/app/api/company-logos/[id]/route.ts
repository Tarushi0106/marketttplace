import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch single company logo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logo = await prisma.companyLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      return NextResponse.json(
        { error: "Company logo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: logo });
  } catch (error) {
    console.error("Error fetching company logo:", error);
    return NextResponse.json(
      { error: "Failed to fetch company logo" },
      { status: 500 }
    );
  }
}

// PUT - Update company logo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, logo, website, isActive, sortOrder } = body;

    const companyLogo = await prisma.companyLogo.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(logo && { logo }),
        ...(website !== undefined && { website }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ data: companyLogo });
  } catch (error) {
    console.error("Error updating company logo:", error);
    return NextResponse.json(
      { error: "Failed to update company logo" },
      { status: 500 }
    );
  }
}

// DELETE - Delete company logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.companyLogo.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Company logo deleted" });
  } catch (error) {
    console.error("Error deleting company logo:", error);
    return NextResponse.json(
      { error: "Failed to delete company logo" },
      { status: 500 }
    );
  }
}
