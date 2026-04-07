import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// This endpoint seeds the database with sample products
// Only accessible by admin users
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    for (const product of products) {
      try {
        const productData = {
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          basePrice: parseFloat(product.basePrice) || 0,
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
          costPrice: product.costPrice ? parseFloat(product.costPrice) : null,
          taxRate: product.taxRate ? parseFloat(product.taxRate) : null,
          monthlyPrice: product.monthlyPrice ? parseFloat(product.monthlyPrice) : null,
          yearlyPrice: product.yearlyPrice ? parseFloat(product.yearlyPrice) : null,
          productType: product.productType || "STANDALONE",
          status: product.status || "ACTIVE",
          isFeatured: product.isFeatured || false,
          isRecurring: product.isRecurring || false,
          categoryId: product.categoryId,
        };

        const existing = await prisma.product.findUnique({
          where: { id: product.id }
        });

        if (existing) {
          await prisma.product.update({
            where: { id: product.id },
            data: productData
          });
          results.updated++;
        } else {
          await prisma.product.create({
            data: {
              id: product.id,
              ...productData,
              sku: product.sku || `${product.slug.toUpperCase()}-${Date.now()}`
            }
          });
          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`Failed to import ${product.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.created} products, updated ${results.updated} products`,
      results
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ 
      error: "Seed failed", 
      message: error.message 
    }, { status: 500 });
  }
}
