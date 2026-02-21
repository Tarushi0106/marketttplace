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
    // Handle Prisma Decimal - check multiple ways
    const constructorName = obj.constructor?.name;
    if (constructorName === 'Decimal' || 
        (typeof obj.toNumber === 'function' && typeof obj.equals === 'function') ||
        (typeof obj.toFixed === 'function' && typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString)) {
      return obj.toString();
    }
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => convertDecimalToString(item));
    }
    // Handle regular objects
    const converted: any = {};
    for (const key of Object.keys(obj)) {
      converted[key] = convertDecimalToString(obj[key]);
    }
    return converted;
  }
  return obj;
}

// Helper function to serialize a complete product for API response
function serializeProduct(product: any) {
  const converted = convertDecimalToString(product);
  return converted;
}

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
          include: {
            recurringPrices: true,
          },
        },
        addons: {
          where: isAdmin ? {} : { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        configs: {
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQty: "asc" },
        },
        recurringPrices: true,
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

    return NextResponse.json({ data: serializeProduct(product) });
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
  sortOrder: z.coerce.number().default(0),
  isPrimary: z.boolean().default(false),
});

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  attributes: z.record(z.string(), z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

const addonSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  unit: z.string().optional(),
  pricingType: z.enum(["ONE_TIME", "RECURRING_MONTHLY", "RECURRING_YEARLY"]).default("ONE_TIME"),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

const configOptionSchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  label: z.string().optional(),
  description: z.string().optional().nullable(),
  priceModifier: z.union([z.coerce.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === "") return 0;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }),
  monthlyPriceModifier: z.union([z.coerce.number(), z.string()]).optional().nullable().transform((val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  }),
  yearlyPriceModifier: z.union([z.coerce.number(), z.string()]).optional().nullable().transform((val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  }),
  isPercentage: z.boolean().default(false),
  modifierType: z.enum(["ADD", "MULTIPLY", "REPLACE"]).default("ADD"),
  sortOrder: z.coerce.number().default(0),
  isAvailable: z.boolean().default(true),
  stockStatus: z.string().optional().nullable(),
});

const configSchema = z.object({
  id: z.string().optional(),
  configType: z.string().optional(),
  name: z.string().min(1),
  displayName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  unitPlural: z.string().optional().nullable(),
  inputType: z.enum(["SELECT", "RADIO", "CHECKBOX", "SLIDER", "NUMBER"]).default("SELECT"),
  minValue: z.coerce.number().optional().nullable(),
  maxValue: z.coerce.number().optional().nullable(),
  stepValue: z.coerce.number().optional().nullable(),
  defaultValue: z.string().optional().nullable(),
  isRequired: z.boolean().default(false),
  allowCustom: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  basePrice: z.union([z.coerce.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  }),
  pricePerUnit: z.union([z.coerce.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  }),
  options: z.array(configOptionSchema),
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
  basePrice: z.coerce.number().min(0).optional(),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  taxRate: z.coerce.number().min(0).optional().nullable(),
  
  // Product Type - One-time or Recurring
  isRecurring: z.boolean().optional(),
  setupFee: z.coerce.number().min(0).optional().nullable(),
  
  // Note: Recurring prices are stored in product_recurring_prices table
  // and should be updated via the /api/products/[id]/recurring-prices endpoint
  
  productType: z.enum(["STANDALONE", "CONFIGURABLE", "BUNDLE"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  trackInventory: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  weight: z.coerce.number().min(0).optional().nullable(),
  weightUnit: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
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
        configs: {
          include: {
            options: true,
          },
        },
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

    // Validate categoryId if provided
    if (productData.categoryId && productData.categoryId.trim() !== "") {
      const categoryExists = await prisma.category.findUnique({
        where: { id: productData.categoryId },
      });
      if (!categoryExists) {
        // Set to null if category doesn't exist
        productData.categoryId = null;
      }
    } else {
      // Set to null if empty string or falsy
      productData.categoryId = null;
    }

    // Validate subCategoryId if provided
    if (productData.subCategoryId && productData.subCategoryId.trim() !== "") {
      const subCategoryExists = await prisma.subCategory.findUnique({
        where: { id: productData.subCategoryId },
      });
      if (!subCategoryExists) {
        // Set to null if subCategory doesn't exist
        productData.subCategoryId = null;
      }
    } else {
      // Set to null if empty string or falsy
      productData.subCategoryId = null;
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
          // Reserved keys that should NOT be in specifications
          const reservedKeys = [
            'billingType', 'setupFee',
            'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
            'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
            'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
            'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
          ];
          
          // Filter out reserved keys from specifications
          const filteredSpecs: Record<string, string> = {};
          for (const [key, value] of Object.entries(variant.specifications || {})) {
            if (!reservedKeys.includes(key)) {
              filteredSpecs[key] = value;
            }
          }
          
          // Merge specifications into attributes, but preserve billingType and setupFee
          const mergedAttributes = {
            ...filteredSpecs,
            // Ensure billingType and setupFee are preserved
            billingType: (variant.attributes as any)?.billingType || "RECURRING",
            ...((variant.attributes as any)?.billingType === "ONE_TIME" && (variant.attributes as any)?.setupFee 
              ? { setupFee: (variant.attributes as any).setupFee } 
              : {}),
          };
          
          if (variant.id && existingVariantIds.includes(variant.id)) {
            // Update existing - check if SKU is being changed to one that already exists
            const existingVariant = existingProduct.variants.find(v => v.id === variant.id);
            if (existingVariant && existingVariant.sku !== variant.sku) {
              // SKU is being changed, check if new SKU already exists
              const skuExists = await tx.productVariant.findFirst({
                where: { sku: variant.sku, NOT: { id: variant.id } },
              });
              if (skuExists) {
                // Generate a unique SKU by appending a timestamp
                const uniqueSku = `${variant.sku}-${Date.now()}`;
                await tx.productVariant.update({
                  where: { id: variant.id },
                  data: {
                    name: variant.name,
                    sku: uniqueSku,
                    price: variant.price,
                    compareAtPrice: variant.compareAtPrice,
                    costPrice: variant.costPrice,
                    stockQuantity: variant.stockQuantity,
                    attributes: mergedAttributes,
                    isDefault: variant.isDefault,
                    isActive: variant.isActive,
                    sortOrder: variant.sortOrder,
                  },
                });
              } else {
                await tx.productVariant.update({
                  where: { id: variant.id },
                  data: {
                    name: variant.name,
                    sku: variant.sku,
                    price: variant.price,
                    compareAtPrice: variant.compareAtPrice,
                    costPrice: variant.costPrice,
                    stockQuantity: variant.stockQuantity,
                    attributes: mergedAttributes,
                    isDefault: variant.isDefault,
                    isActive: variant.isActive,
                    sortOrder: variant.sortOrder,
                  },
                });
              }
            } else {
              // SKU not changed, just update
              await tx.productVariant.update({
                where: { id: variant.id },
                data: {
                  name: variant.name,
                  sku: variant.sku,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  costPrice: variant.costPrice,
                  stockQuantity: variant.stockQuantity,
                  attributes: mergedAttributes,
                  isDefault: variant.isDefault,
                  isActive: variant.isActive,
                  sortOrder: variant.sortOrder,
                },
              });
            }
          } else {
            // Create new - check if SKU already exists
            const skuExists = await tx.productVariant.findFirst({
              where: { sku: variant.sku },
            });
            if (skuExists) {
              // Generate a unique SKU by appending a timestamp
              const uniqueSku = `${variant.sku}-${Date.now()}`;
              await tx.productVariant.create({
                data: {
                  productId: id,
                  name: variant.name,
                  sku: uniqueSku,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  costPrice: variant.costPrice,
                  stockQuantity: variant.stockQuantity,
                  attributes: mergedAttributes,
                  isDefault: variant.isDefault,
                  isActive: variant.isActive ?? true,
                  sortOrder: variant.sortOrder,
                },
              });
            } else {
              await tx.productVariant.create({
                data: {
                  productId: id,
                  name: variant.name,
                  sku: variant.sku,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  costPrice: variant.costPrice,
                  stockQuantity: variant.stockQuantity,
                  attributes: mergedAttributes,
                  isDefault: variant.isDefault,
                  isActive: variant.isActive ?? true,
                  sortOrder: variant.sortOrder,
                },
              });
            }
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
                unit: addon.unit,
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
                unit: addon.unit,
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
        // Get existing config IDs (handle case where configs might be null/undefined)
        const existingConfigs = existingProduct.configs || [];
        const existingConfigIds = existingConfigs.map((c) => c.id);
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

        // Update or create configs (basic fields only - use Configurations API for full options management)
        for (const config of configs) {
          if (config.id && existingConfigIds.includes(config.id)) {
            // Update existing config basic fields only, skip options
            await tx.productConfig.update({
              where: { id: config.id },
              data: {
                configType: config.configType || "STANDARD",
                name: config.name,
                displayName: config.displayName || null,
                description: config.description || null,
                unit: config.unit || null,
                unitPlural: config.unitPlural || null,
                inputType: config.inputType || "SELECT",
                minValue: config.minValue ?? null,
                maxValue: config.maxValue ?? null,
                stepValue: config.stepValue ?? 1,
                defaultValue: config.defaultValue || null,
                isRequired: config.isRequired ?? false,
                allowCustom: config.allowCustom ?? false,
                sortOrder: config.sortOrder ?? 0,
                basePrice: config.basePrice ? parseFloat(config.basePrice.toString()) : null,
                pricePerUnit: config.pricePerUnit ? parseFloat(config.pricePerUnit.toString()) : null,
              },
            });
            // Also update options
            const existingConfig = existingConfigs.find(c => c.id === config.id);
            const existingOptionIds = (existingConfig?.options || []).map((o: any) => o.id);
            const newOptionIds = (config.options || []).filter((o: any) => o.id).map((o: any) => o.id);
            const optionsToDelete = existingOptionIds.filter((id: string) => !newOptionIds.includes(id));
            if (optionsToDelete.length > 0) {
              await tx.productConfigOption.deleteMany({
                where: { id: { in: optionsToDelete } },
              });
            }
            for (const option of (config.options || [])) {
              if (option.id && existingOptionIds.includes(option.id)) {
                await tx.productConfigOption.update({
                  where: { id: option.id },
                  data: {
                    value: option.value,
                    label: option.label || option.value,
                    description: option.description || null,
                    priceModifier: option.priceModifier ? parseFloat(option.priceModifier.toString()) : 0,
                    monthlyPriceModifier: option.monthlyPriceModifier ? parseFloat(option.monthlyPriceModifier.toString()) : null,
                    yearlyPriceModifier: option.yearlyPriceModifier ? parseFloat(option.yearlyPriceModifier.toString()) : null,
                    isPercentage: option.isPercentage ?? false,
                    modifierType: option.modifierType || "ADD",
                    sortOrder: option.sortOrder ?? 0,
                    isAvailable: option.isAvailable ?? true,
                    isActive: true, // Always ensure isActive is true when updating
                    stockStatus: option.stockStatus || null,
                  },
                });
              } else {
                await tx.productConfigOption.create({
                  data: {
                    configId: config.id,
                    value: option.value,
                    label: option.label || option.value,
                    description: option.description || null,
                    priceModifier: option.priceModifier ? parseFloat(option.priceModifier.toString()) : 0,
                    monthlyPriceModifier: option.monthlyPriceModifier ? parseFloat(option.monthlyPriceModifier.toString()) : null,
                    yearlyPriceModifier: option.yearlyPriceModifier ? parseFloat(option.yearlyPriceModifier.toString()) : null,
                    isPercentage: option.isPercentage ?? false,
                    modifierType: option.modifierType || "ADD",
                    sortOrder: option.sortOrder ?? 0,
                    isAvailable: option.isAvailable ?? true,
                    isActive: true, // Always ensure isActive is true when creating
                    stockStatus: option.stockStatus || null,
                  },
                });
              }
            }
          } else {
            // Create new
            await tx.productConfig.create({
              data: {
                productId: id,
                configType: config.configType || "STANDARD",
                name: config.name,
                displayName: config.displayName || null,
                description: config.description || null,
                unit: config.unit || null,
                unitPlural: config.unitPlural || null,
                inputType: config.inputType || "SELECT",
                minValue: config.minValue ?? null,
                maxValue: config.maxValue ?? null,
                stepValue: config.stepValue ?? 1,
                defaultValue: config.defaultValue || null,
                isRequired: config.isRequired ?? false,
                allowCustom: config.allowCustom ?? false,
                sortOrder: config.sortOrder ?? 0,
                basePrice: config.basePrice ? parseFloat(config.basePrice.toString()) : null,
                pricePerUnit: config.pricePerUnit ? parseFloat(config.pricePerUnit.toString()) : null,
                options: config.options && config.options.length > 0 ? {
                  create: config.options.map((opt: any) => ({
                    value: opt.value,
                    label: opt.label || opt.value,
                    description: opt.description || null,
                    priceModifier: opt.priceModifier ? parseFloat(opt.priceModifier.toString()) : 0,
                    monthlyPriceModifier: opt.monthlyPriceModifier ? parseFloat(opt.monthlyPriceModifier.toString()) : null,
                    yearlyPriceModifier: opt.yearlyPriceModifier ? parseFloat(opt.yearlyPriceModifier.toString()) : null,
                    isPercentage: opt.isPercentage ?? false,
                    modifierType: opt.modifierType || "ADD",
                    isAvailable: opt.isAvailable ?? true,
                    isActive: true, // Always ensure isActive is true when creating
                    sortOrder: opt.sortOrder ?? 0,
                    stockStatus: opt.stockStatus || null,
                  })),
                } : undefined,
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
        configs: {
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        seoMetadata: true,
      },
    });

    return NextResponse.json({ data: serializeProduct(completeProduct) });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    // Log more details about Prisma errors
    if (typeof error === 'object' && error !== null) {
      console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    return NextResponse.json(
      { error: "Failed to update product", message: error instanceof Error ? error.message : "Unknown error" },
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

    // Hard delete - remove product and all related records
    // Due to cascade delete in schema, this will also delete:
    // - variants, addons, configs, images, recurringPrices, pricingTiers, etc.
    await prisma.product.delete({
      where: { id },
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
