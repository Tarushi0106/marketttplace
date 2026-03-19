import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const settings = await prisma.setting.findUnique({
      where: { key: "hero-products" },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Hero product not found" },
        { status: 404 }
      );
    }

    const value = settings.value as any;
    const products = value?.products || [];
    const product = products.find((p: any) => p.slug === slug);

    if (!product) {
      return NextResponse.json(
        { error: "Hero product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching hero product:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero product" },
      { status: 500 }
    );
  }
}
