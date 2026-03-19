import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: "hero-products" },
    });

    if (!settings) {
      return NextResponse.json([]);
    }

    const value = settings.value as any;
    const products = value?.products || [];
    
    // Return only active hero products
    const activeProducts = products.filter((p: any) => p.isActive);
    
    return NextResponse.json(activeProducts);
  } catch (error) {
    console.error("Error fetching hero products:", error);
    // Return empty array instead of 500 for graceful degradation
    return NextResponse.json([]);
  }
}
