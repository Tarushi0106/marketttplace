import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { monthlyPrice, yearlyPrice, discountPercent } = body;

    console.log("Saving recurring prices:", { productId, monthlyPrice, yearlyPrice, discountPercent });

    // First try to find existing record
    const existing = await prisma.productRecurringPrice.findFirst({
      where: { productId },
    });

    let recurringPrices;
    if (existing) {
      // Update existing
      recurringPrices = await prisma.productRecurringPrice.update({
        where: { id: existing.id },
        data: {
          monthlyPrice,
          yearlyPrice,
          monthlySavings: discountPercent,
        },
      });
    } else {
      // Create new
      recurringPrices = await prisma.productRecurringPrice.create({
        data: {
          productId,
          monthlyPrice,
          yearlyPrice,
          monthlySavings: discountPercent,
          currency: "INR",
          isActive: true,
        },
      });
    }

    console.log("Saved recurring prices:", recurringPrices);
    return NextResponse.json(recurringPrices);
  } catch (error) {
    console.error("Error saving recurring prices:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save recurring prices" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const recurringPrices = await prisma.productRecurringPrice.findFirst({
      where: { productId },
    });

    return NextResponse.json(recurringPrices);
  } catch (error) {
    console.error("Error fetching recurring prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring prices" },
      { status: 500 }
    );
  }
}
