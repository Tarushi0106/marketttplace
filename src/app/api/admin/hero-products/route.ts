import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(value?.products || []);
  } catch (error) {
    console.error("Error fetching hero products:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      slug,
      shortDescription,
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroCtaLink,
      heroImage,
      isActive,
    } = body;

    // Get existing hero products
    const existingSettings = await prisma.setting.findUnique({
      where: { key: "hero-products" },
    });

    let heroProducts: any[] = [];
    if (existingSettings) {
      heroProducts = (existingSettings.value as any)?.products || [];
    }

    // Check if updating existing or adding new
    if (id && !id.startsWith("new-")) {
      // Update existing
      heroProducts = heroProducts.map((p: any) =>
        p.slug === slug
          ? {
              name,
              slug,
              shortDescription,
              heroTitle,
              heroSubtitle,
              heroCtaText,
              heroCtaLink,
              heroImage,
              isActive,
            }
          : p
      );
    } else {
      // Add new
      heroProducts.push({
        name,
        slug,
        shortDescription,
        heroTitle,
        heroSubtitle,
        heroCtaText,
        heroCtaLink,
        heroImage,
        isActive,
      });
    }

    // Save to settings
    const saved = await prisma.setting.upsert({
      where: { key: "hero-products" },
      update: { value: { products: heroProducts } },
      create: { key: "hero-products", value: { products: heroProducts } },
    });

    return NextResponse.json({ id: slug, ...body });
  } catch (error) {
    console.error("Error saving hero product:", error);
    return NextResponse.json(
      { error: "Failed to save hero product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    // Get existing hero products
    const existingSettings = await prisma.setting.findUnique({
      where: { key: "hero-products" },
    });

    if (existingSettings) {
      let heroProducts: any[] = (existingSettings.value as any)?.products || [];
      heroProducts = heroProducts.filter((p: any) => p.slug !== slug);

      await prisma.setting.update({
        where: { key: "hero-products" },
        data: { value: { products: heroProducts } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero product:", error);
    return NextResponse.json(
      { error: "Failed to delete hero product" },
      { status: 500 }
    );
  }
}
