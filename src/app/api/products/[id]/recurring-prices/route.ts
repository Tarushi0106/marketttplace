import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to convert Decimal to string
function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj;
    if (obj.constructor?.name === 'Decimal') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => serialize(item));
    }
    const converted: any = {};
    for (const key of Object.keys(obj)) {
      converted[key] = serialize(obj[key]);
    }
    return converted;
  }
  return obj;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    
    const {
      // Recurring Prices
      monthlyPrice,
      biMonthlyPrice,
      quarterlyPrice,
      fourMonthlyPrice,
      semiAnnualPrice,
      triAnnualPrice,
      yearlyPrice,
      biennialPrice,
      triennialPrice,
      // Savings
      monthlySavings,
      quarterlySavings,
      yearlySavings,
      // Setup Fees
      monthlySetupFee,
      biMonthlySetupFee,
      quarterlySetupFee,
      fourMonthlySetupFee,
      semiAnnualSetupFee,
      triAnnualSetupFee,
      yearlySetupFee,
      biennialSetupFee,
      triennialSetupFee,
    } = body;

    console.log("Saving recurring prices:", { 
      productId, 
      monthlyPrice, 
      yearlyPrice, 
      monthlySavings,
      monthlySetupFee 
    });

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
          // Recurring Prices
          monthlyPrice: monthlyPrice ?? null,
          biMonthlyPrice: biMonthlyPrice ?? null,
          quarterlyPrice: quarterlyPrice ?? null,
          fourMonthlyPrice: fourMonthlyPrice ?? null,
          semiAnnualPrice: semiAnnualPrice ?? null,
          triAnnualPrice: triAnnualPrice ?? null,
          yearlyPrice: yearlyPrice ?? null,
          biennialPrice: biennialPrice ?? null,
          triennialPrice: triennialPrice ?? null,
          // Savings
          monthlySavings: monthlySavings ?? null,
          quarterlySavings: quarterlySavings ?? null,
          yearlySavings: yearlySavings ?? null,
          // Setup Fees
          monthlySetupFee: monthlySetupFee ?? null,
          biMonthlySetupFee: biMonthlySetupFee ?? null,
          quarterlySetupFee: quarterlySetupFee ?? null,
          fourMonthlySetupFee: fourMonthlySetupFee ?? null,
          semiAnnualSetupFee: semiAnnualSetupFee ?? null,
          triAnnualSetupFee: triAnnualSetupFee ?? null,
          yearlySetupFee: yearlySetupFee ?? null,
          biennialSetupFee: biennialSetupFee ?? null,
          triennialSetupFee: triennialSetupFee ?? null,
        },
      });
    } else {
      // Create new
      recurringPrices = await prisma.productRecurringPrice.create({
        data: {
          productId,
          // Recurring Prices
          monthlyPrice: monthlyPrice ?? null,
          biMonthlyPrice: biMonthlyPrice ?? null,
          quarterlyPrice: quarterlyPrice ?? null,
          fourMonthlyPrice: fourMonthlyPrice ?? null,
          semiAnnualPrice: semiAnnualPrice ?? null,
          triAnnualPrice: triAnnualPrice ?? null,
          yearlyPrice: yearlyPrice ?? null,
          biennialPrice: biennialPrice ?? null,
          triennialPrice: triennialPrice ?? null,
          // Savings
          monthlySavings: monthlySavings ?? null,
          quarterlySavings: quarterlySavings ?? null,
          yearlySavings: yearlySavings ?? null,
          // Setup Fees
          monthlySetupFee: monthlySetupFee ?? null,
          biMonthlySetupFee: biMonthlySetupFee ?? null,
          quarterlySetupFee: quarterlySetupFee ?? null,
          fourMonthlySetupFee: fourMonthlySetupFee ?? null,
          semiAnnualSetupFee: semiAnnualSetupFee ?? null,
          triAnnualSetupFee: triAnnualSetupFee ?? null,
          yearlySetupFee: yearlySetupFee ?? null,
          biennialSetupFee: biennialSetupFee ?? null,
          triennialSetupFee: triennialSetupFee ?? null,
          currency: "USD",
          isActive: true,
        },
      });
    }

    console.log("Saved recurring prices:", recurringPrices);
    return NextResponse.json(serialize(recurringPrices));
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

    return NextResponse.json(serialize(recurringPrices));
  } catch (error) {
    console.error("Error fetching recurring prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring prices" },
      { status: 500 }
    );
  }
}
