import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper function to convert Prisma Decimal fields to plain objects
function convertDecimalToString(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj;
    const constructorName = obj.constructor?.name;
    if (constructorName === 'Decimal' || 
        (typeof obj.toNumber === 'function' && typeof obj.equals === 'function') ||
        (typeof obj.toFixed === 'function' && typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString)) {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => convertDecimalToString(item));
    }
    const converted: any = {};
    for (const key of Object.keys(obj)) {
      converted[key] = convertDecimalToString(obj[key]);
    }
    return converted;
  }
  return obj;
}

// Helper function to transform recurringPrices array
function transformRecurringPrices(recurringPrices: any[]): any {
  if (!recurringPrices || recurringPrices.length === 0) return null;
  const price = recurringPrices[0];
  return {
    monthly: price.monthlyPrice ? Number(price.monthlyPrice) : null,
    quarterly: price.quarterlyPrice ? Number(price.quarterlyPrice) : null,
    yearly: price.yearlyPrice ? Number(price.yearlyPrice) : null,
    biennial: price.biennialPrice ? Number(price.biennialPrice) : null,
    triennial: price.triennialPrice ? Number(price.triennialPrice) : null,
  };
}

// Helper to transform variant
function transformVariant(variant: any) {
  const originalRecurringPrices = variant.recurringPrices;
  const converted = convertDecimalToString(variant);
  if (originalRecurringPrices && Array.isArray(originalRecurringPrices)) {
    converted.recurringPrices = originalRecurringPrices.map((rp: any) => convertDecimalToString(rp));
  } else {
    converted.recurringPrices = [];
  }
  if (converted.recurringPrices && converted.recurringPrices.length > 0) {
    converted.recurringPricesObj = transformRecurringPrices(converted.recurringPrices);
    converted.billingType = 'recurring';
  } else {
    converted.billingType = 'one_time';
  }
  return converted;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get all products regardless of status - for admin use
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true,
          subCategory: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
              recurringPrices: true,
            },
          },
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      data: products.map((product: any) => ({
        ...convertDecimalToString(product),
        variants: product.variants.map((variant: any) => transformVariant(variant)),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: "Failed to fetch products", details: errorMessage, stack: errorStack },
      { status: 500 }
    );
  }
}
