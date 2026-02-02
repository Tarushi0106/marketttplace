import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string);

    // Try to find by ID first, then by slug
    // Admin can access any product, public only sees ACTIVE products
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(isAdmin ? {} : { status: "ACTIVE" }),
      },
      include: {
        category: true,
        subCategory: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: isAdmin ? {} : { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        addons: {
          where: isAdmin ? {} : { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        configs: {
          orderBy: { sortOrder: "asc" },
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQty: "asc" },
        },
        seoMetadata: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment view count (only for public views)
    if (!isAdmin) {
      await prisma.product.update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Schemas for related data
const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  alt: z.string().optional(),
  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),
});

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  attributes: z.record(z.string(), z.string()).optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const addonSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  pricingType: z.enum(["ONE_TIME", "RECURRING_MONTHLY", "RECURRING_YEARLY"]).default("ONE_TIME"),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const configOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  priceModifier: z.number().default(0),
});

const configSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(["SELECT", "RADIO", "CHECKBOX", "NUMBER"]).default("SELECT"),
  options: z.array(configOptionSchema),
  isRequired: z.boolean().default(false),
  defaultValue: z.string().optional(),
  sortOrder: z.number().default(0),
});

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  basePrice: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  taxRate: z.number().min(0).optional().nullable(),
  productType: z.enum(["STANDALONE", "WITH_ADDONS", "CONFIGURABLE", "BUNDLE"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  trackInventory: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional().nullable(),
  weightUnit: z.string().optional(),
  sortOrder: z.number().int().optional(),
  // Related data
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
  addons: z.array(addonSchema).optional(),
  configs: z.array(configSchema).optional(),
  seoMetadata: seoSchema.optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        addons: true,
        configs: true,
        seoMetadata: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Extract related data
    const { images, variants, addons, configs, seoMetadata, ...productData } = data;

    // Check if slug is unique (if updating slug)
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Check if SKU is unique (if updating SKU)
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: {
          sku: productData.sku,
          NOT: { id },
        },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Update product with all related data in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: productData,
      });

      // Update images if provided
      if (images !== undefined) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Create new images
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, idx) => ({
              productId: id,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            })),
          });
        }
      }

      // Update variants if provided
      if (variants !== undefined) {
        // Get existing variant IDs
        const existingVariantIds = existingProduct.variants.map((v) => v.id);
        const newVariantIds = variants.filter((v) => v.id).map((v) => v.id);

        // Delete removed variants
        const variantsToDelete = existingVariantIds.filter(
          (id) => !newVariantIds.includes(id)
        );
        if (variantsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: variantsToDelete } },
          });
        }

        // Update or create variants
        for (const variant of variants) {
          if (variant.id && existingVariantIds.includes(variant.id)) {
            // Update existing
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                costPrice: variant.costPrice,
                stockQuantity: variant.stockQuantity,
                attributes: variant.attributes || {},
                isDefault: variant.isDefault,
                isActive: variant.isActive,
                sortOrder: variant.sortOrder,
              },
            });
          } else {
            // Create new
            await tx.productVariant.create({
              data: {
                productId: id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                costPrice: variant.costPrice,
                stockQuantity: variant.stockQuantity,
                attributes: variant.attributes || {},
                isDefault: variant.isDefault,
                isActive: variant.isActive ?? true,
                sortOrder: variant.sortOrder,
              },
            });
          }
        }
      }

      // Update addons if provided
      if (addons !== undefined) {
        // Get existing addon IDs
        const existingAddonIds = existingProduct.addons.map((a) => a.id);
        const newAddonIds = addons.filter((a) => a.id).map((a) => a.id);

        // Delete removed addons
        const addonsToDelete = existingAddonIds.filter(
          (id) => !newAddonIds.includes(id)
        );
        if (addonsToDelete.length > 0) {
          await tx.productAddon.deleteMany({
            where: { id: { in: addonsToDelete } },
          });
        }

        // Update or create addons
        for (const addon of addons) {
          if (addon.id && existingAddonIds.includes(addon.id)) {
            // Update existing
            await tx.productAddon.update({
              where: { id: addon.id },
              data: {
                name: addon.name,
                description: addon.description,
                price: addon.price,
                pricingType: addon.pricingType,
                isRequired: addon.isRequired,
                isActive: addon.isActive,
                sortOrder: addon.sortOrder,
              },
            });
          } else {
            // Create new
            await tx.productAddon.create({
              data: {
                productId: id,
                name: addon.name,
                description: addon.description,
                price: addon.price,
                pricingType: addon.pricingType,
                isRequired: addon.isRequired,
                isActive: addon.isActive ?? true,
                sortOrder: addon.sortOrder,
              },
            });
          }
        }
      }

      // Update configs if provided
      if (configs !== undefined) {
        // Get existing config IDs
        const existingConfigIds = existingProduct.configs.map((c) => c.id);
        const newConfigIds = configs.filter((c) => c.id).map((c) => c.id);

        // Delete removed configs
        const configsToDelete = existingConfigIds.filter(
          (id) => !newConfigIds.includes(id)
        );
        if (configsToDelete.length > 0) {
          await tx.productConfig.deleteMany({
            where: { id: { in: configsToDelete } },
          });
        }

        // Update or create configs
        for (const config of configs) {
          if (config.id && existingConfigIds.includes(config.id)) {
            // Update existing
            await tx.productConfig.update({
              where: { id: config.id },
              data: {
                name: config.name,
                type: config.type,
                options: config.options,
                isRequired: config.isRequired,
                defaultValue: config.defaultValue,
                sortOrder: config.sortOrder,
              },
            });
          } else {
            // Create new
            await tx.productConfig.create({
              data: {
                productId: id,
                name: config.name,
                type: config.type,
                options: config.options,
                isRequired: config.isRequired,
                defaultValue: config.defaultValue,
                sortOrder: config.sortOrder,
              },
            });
          }
        }
      }

      // Update SEO metadata if provided
      if (seoMetadata !== undefined) {
        if (existingProduct.seoMetadata) {
          // Update existing
          await tx.seoMetadata.update({
            where: { productId: id },
            data: seoMetadata,
          });
        } else if (Object.values(seoMetadata).some((v) => v)) {
          // Create new
          await tx.seoMetadata.create({
            data: {
              productId: id,
              ...seoMetadata,
            },
          });
        }
      }

      return updatedProduct;
    });

    // Fetch the complete product with all relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        subCategory: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        addons: { orderBy: { sortOrder: "asc" } },
        configs: { orderBy: { sortOrder: "asc" } },
        seoMetadata: true,
      },
    });

    return NextResponse.json({ data: completeProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete by setting status to ARCHIVED
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
