import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  productType: z.enum(["STANDALONE", "WITH_ADDONS", "CONFIGURABLE", "BUNDLE"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(["price", "name", "createdAt", "rating", "popularity"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const session = await auth();
    const isAdmin = session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string);

    const filters = productFilterSchema.parse(params);

    const where: any = {};

    // Admin can see all statuses, public only sees ACTIVE
    if (filters.status) {
      where.status = filters.status;
    } else if (!isAdmin) {
      where.status = "ACTIVE";
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { shortDescription: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.subCategoryId) {
      where.subCategoryId = filters.subCategoryId;
    }

    if (filters.productType) {
      where.productType = filters.productType;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.basePrice = {};
      if (filters.minPrice !== undefined) {
        where.basePrice.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.basePrice.lte = filters.maxPrice;
      }
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price":
          orderBy.basePrice = filters.sortOrder || "asc";
          break;
        case "name":
          orderBy.name = filters.sortOrder || "asc";
          break;
        case "rating":
          orderBy.averageRating = filters.sortOrder || "desc";
          break;
        case "popularity":
          orderBy.salesCount = filters.sortOrder || "desc";
          break;
        default:
          orderBy.createdAt = filters.sortOrder || "desc";
      }
    } else {
      orderBy.createdAt = "desc";
    }

    const skip = (filters.page - 1) * filters.limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
        include: {
          category: true,
          subCategory: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch products" },
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

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  basePrice: z.number().min(0),
  compareAtPrice: z.number().min(0).optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  taxRate: z.number().min(0).optional().nullable(),
  productType: z.enum(["STANDALONE", "WITH_ADDONS", "CONFIGURABLE", "BUNDLE"]).default("STANDALONE"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  requiresShipping: z.boolean().default(true),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  weight: z.number().min(0).optional().nullable(),
  weightUnit: z.string().default("kg"),
  // Related data
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
  addons: z.array(addonSchema).optional(),
  configs: z.array(configSchema).optional(),
  seoMetadata: seoSchema.optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createProductSchema.parse(body);

    // Extract related data
    const { images, variants, addons, configs, seoMetadata, ...productData } = data;

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // Check if SKU is unique (if provided)
    if (productData.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: productData.sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Create product with all related data in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          features: productData.features || [],
          specifications: productData.specifications || {},
          categoryId: productData.categoryId || null,
          subCategoryId: productData.subCategoryId || null,
        },
      });

      // Create images if provided
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            productId: newProduct.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder ?? idx,
            isPrimary: img.isPrimary ?? idx === 0,
          })),
        });
      }

      // Create variants if provided
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, idx) => ({
            productId: newProduct.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            stockQuantity: v.stockQuantity,
            attributes: v.attributes || {},
            isDefault: v.isDefault ?? idx === 0,
            isActive: v.isActive ?? true,
            sortOrder: v.sortOrder ?? idx,
          })),
        });
      }

      // Create addons if provided
      if (addons && addons.length > 0) {
        await tx.productAddon.createMany({
          data: addons.map((a, idx) => ({
            productId: newProduct.id,
            name: a.name,
            description: a.description,
            price: a.price,
            pricingType: a.pricingType,
            isRequired: a.isRequired,
            isActive: a.isActive ?? true,
            sortOrder: a.sortOrder ?? idx,
          })),
        });
      }

      // Create configs if provided
      if (configs && configs.length > 0) {
        await tx.productConfig.createMany({
          data: configs.map((c, idx) => ({
            productId: newProduct.id,
            name: c.name,
            type: c.type,
            options: c.options,
            isRequired: c.isRequired,
            defaultValue: c.defaultValue,
            sortOrder: c.sortOrder ?? idx,
          })),
        });
      }

      // Create SEO metadata if provided
      if (seoMetadata && Object.values(seoMetadata).some((v) => v)) {
        await tx.seoMetadata.create({
          data: {
            productId: newProduct.id,
            ...seoMetadata,
          },
        });
      }

      return newProduct;
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

    return NextResponse.json({ data: completeProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
