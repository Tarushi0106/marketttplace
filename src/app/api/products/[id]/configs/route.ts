import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET /api/products/[id]/configs - Get resolved configurations for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Get the product with its category
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        configs: {
          where: { isActive: true },
          include: {
            options: true,
            template: {
              include: {
                options: true,
              },
            },
            categoryConfig: {
              include: {
                template: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        recurringPrices: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Resolve configurations with inheritance
    const resolvedConfigs = product.configs.map((config) => {
      // If product has custom values, use them
      if (config.name && config.pricePerUnit !== null) {
        return {
          id: config.id,
          name: config.name,
          displayName: config.displayName,
          description: config.description,
          unit: config.unit,
          unitPlural: config.unitPlural,
          icon: config.icon,
          pricingModel: config.pricingModel,
          basePrice: config.basePrice,
          pricePerUnit: config.pricePerUnit,
          currency: config.currency,
          billingCycle: config.billingCycle,
          isRecurring: config.isRecurring,
          inputType: config.inputType,
          minValue: config.minValue,
          maxValue: config.maxValue,
          stepValue: config.stepValue,
          defaultValue: config.defaultValue,
          isRequired: config.isRequired,
          allowCustom: config.allowCustom,
          inheritFrom: config.inheritFrom,
          source: "PRODUCT" as const,
          options: config.options.map((opt) => ({
            id: opt.id,
            value: opt.value,
            label: opt.label,
            description: opt.description,
            priceModifier: opt.priceModifier,
            isPercentage: opt.isPercentage,
            modifierType: opt.modifierType,
            isAvailable: opt.isAvailable,
            stockStatus: opt.stockStatus,
          })),
        };
      }

      // Try to get from category config
      if (config.categoryConfig && config.categoryConfig.isActive) {
        const catConfig = config.categoryConfig;
        return {
          id: config.id,
          name: catConfig.name || config.name,
          displayName: config.displayName,
          description: config.description,
          unit: catConfig.unit || config.unit,
          unitPlural: config.unitPlural,
          icon: config.icon,
          pricingModel: catConfig.pricingModel || config.pricingModel,
          basePrice: catConfig.basePrice,
          pricePerUnit: catConfig.pricePerUnit,
          currency: catConfig.currency || config.currency,
          billingCycle: catConfig.billingCycle || config.billingCycle,
          isRecurring: catConfig.isRecurring ?? config.isRecurring,
          inputType: catConfig.inputType || config.inputType,
          minValue: catConfig.minValue || config.minValue,
          maxValue: catConfig.maxValue || config.maxValue,
          stepValue: catConfig.stepValue || config.stepValue,
          defaultValue: catConfig.defaultValue || config.defaultValue,
          isRequired: catConfig.isRequired ?? config.isRequired,
          allowCustom: catConfig.allowCustom ?? config.allowCustom,
          inheritFrom: config.inheritFrom,
          source: "CATEGORY" as const,
          inheritedFromId: catConfig.id,
          // If category config is inherited, use template options, otherwise use product options
          options:
            catConfig.isInherited && config.template
              ? config.template.options.map((opt) => ({
                  id: opt.id,
                  value: opt.value,
                  label: opt.label,
                  description: opt.description,
                  priceModifier: opt.priceModifier,
                  isPercentage: opt.isPercentage,
                  modifierType: opt.modifierType,
                  isAvailable: opt.isAvailable,
                  stockStatus: opt.stockStatus,
                }))
              : config.options.map((opt) => ({
                  id: opt.id,
                  value: opt.value,
                  label: opt.label,
                  description: opt.description,
                  priceModifier: opt.priceModifier,
                  isPercentage: opt.isPercentage,
                  modifierType: opt.modifierType,
                  isAvailable: opt.isAvailable,
                  stockStatus: opt.stockStatus,
                })),
        };
      }

      // Fall back to template
      if (config.template) {
        return {
          id: config.id,
          name: config.name,
          displayName: config.displayName,
          description: config.description,
          unit: config.template.unit || config.unit,
          unitPlural: config.template.unitPlural || config.unitPlural,
          icon: config.template.icon || config.icon,
          pricingModel: config.template.pricingModel || config.pricingModel,
          basePrice: config.template.basePrice,
          pricePerUnit: config.template.pricePerUnit,
          currency: config.template.currency || config.currency,
          billingCycle: config.template.billingCycle || config.billingCycle,
          isRecurring: config.template.isRecurring ?? config.isRecurring,
          inputType: config.template.inputType || config.inputType,
          minValue: config.template.minValue || config.minValue,
          maxValue: config.template.maxValue || config.maxValue,
          stepValue: config.template.stepValue || config.stepValue,
          defaultValue: config.template.defaultValue || config.defaultValue,
          isRequired: config.template.isRequired ?? config.isRequired,
          allowCustom: config.template.allowCustom ?? config.allowCustom,
          inheritFrom: config.inheritFrom,
          source: "TEMPLATE" as const,
          inheritedFromId: config.template.id,
          options: config.template.options.map((opt) => ({
            id: opt.id,
            value: opt.value,
            label: opt.label,
            description: opt.description,
            priceModifier: opt.priceModifier,
            isPercentage: opt.isPercentage,
            modifierType: opt.modifierType,
            isAvailable: opt.isAvailable,
            stockStatus: opt.stockStatus,
          })),
        };
      }

      // Return as-is
      return {
        id: config.id,
        name: config.name,
        displayName: config.displayName,
        description: config.description,
        unit: config.unit,
        unitPlural: config.unitPlural,
        icon: config.icon,
        pricingModel: config.pricingModel,
        basePrice: config.basePrice,
        pricePerUnit: config.pricePerUnit,
        currency: config.currency,
        billingCycle: config.billingCycle,
        isRecurring: config.isRecurring,
        inputType: config.inputType,
        minValue: config.minValue,
        maxValue: config.maxValue,
        stepValue: config.stepValue,
        defaultValue: config.defaultValue,
        isRequired: config.isRequired,
        allowCustom: config.allowCustom,
        inheritFrom: config.inheritFrom,
        source: "PRODUCT" as const,
        options: config.options.map((opt) => ({
          id: opt.id,
          value: opt.value,
          label: opt.label,
          description: opt.description,
          priceModifier: opt.priceModifier,
          isPercentage: opt.isPercentage,
          modifierType: opt.modifierType,
          isAvailable: opt.isAvailable,
          stockStatus: opt.stockStatus,
        })),
      };
    });

    // Get inherited configs from category (not directly on product)
    let inheritedConfigs: any[] = [];
    if (product.categoryId) {
      const categoryConfigs = await prisma.categoryConfig.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          isInherited: true,
        },
        include: {
          template: {
            include: {
              options: true,
            },
          },
        },
      });

      // Get product-specific config IDs
      const productConfigIds = product.configs
        .filter((c) => c.categoryConfigId)
        .map((c) => c.categoryConfigId);

      // Filter out configs that are already applied to the product
      inheritedConfigs = categoryConfigs
        .filter((c) => !productConfigIds.includes(c.id))
        .map((catConfig) => ({
          id: catConfig.id,
          categoryConfigId: catConfig.id,
          name: catConfig.name || catConfig.template.name,
          displayName: catConfig.template.name,
          description: catConfig.description,
          unit: catConfig.unit || catConfig.template.unit,
          unitPlural: catConfig.unitPlural || catConfig.template.unitPlural,
          icon: catConfig.template.icon,
          pricingModel: catConfig.pricingModel || catConfig.template.pricingModel,
          basePrice: catConfig.basePrice,
          pricePerUnit: catConfig.pricePerUnit,
          currency: catConfig.currency || catConfig.template.currency,
          billingCycle: catConfig.billingCycle || catConfig.template.billingCycle,
          isRecurring: catConfig.isRecurring ?? catConfig.template.isRecurring,
          inputType: catConfig.inputType || catConfig.template.inputType,
          minValue: catConfig.minValue || catConfig.template.minValue,
          maxValue: catConfig.maxValue || catConfig.template.maxValue,
          stepValue: catConfig.stepValue || catConfig.template.stepValue,
          defaultValue: catConfig.defaultValue || catConfig.template.defaultValue,
          isRequired: catConfig.isRequired ?? catConfig.template.isRequired,
          allowCustom: catConfig.allowCustom ?? catConfig.template.allowCustom,
          source: "CATEGORY" as const,
          inheritedFromId: catConfig.id,
          options: catConfig.template.options.map((opt) => ({
            id: opt.id,
            value: opt.value,
            label: opt.label,
            description: opt.description,
            priceModifier: opt.priceModifier,
            isPercentage: opt.isPercentage,
            modifierType: opt.modifierType,
            isAvailable: opt.isAvailable,
            stockStatus: opt.stockStatus,
          })),
        }));
    }

    // Get recurring prices
    const recurringPrices = product.recurringPrices[0] || null;

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        productType: product.productType,
      },
      configs: resolvedConfigs,
      inheritedConfigs,
      recurringPrices,
    });
  } catch (error) {
    console.error("Error fetching product configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch product configurations" },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/configs - Add or update a product configuration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const productId = params.id;
    const body = await request.json();

    const schema = z.object({
      templateId: z.string().optional(),
      categoryConfigId: z.string().optional(),
      name: z.string().min(1),
      displayName: z.string().optional(),
      description: z.string().optional(),
      unit: z.string().optional(),
      unitPlural: z.string().optional(),
      icon: z.string().optional(),
      pricingModel: z.enum(["FIXED", "PER_UNIT", "TIERED", "HYBRID"]).optional(),
      basePrice: z.number().optional(),
      pricePerUnit: z.number().optional(),
      currency: z.string().optional(),
      billingCycle: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY", "BIENNIAL", "TRIENNIAL"]).optional(),
      isRecurring: z.boolean().optional(),
      inputType: z.enum(["SELECT", "RADIO", "CHECKBOX", "NUMBER", "SLIDER", "TEXT"]).optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      stepValue: z.number().optional(),
      defaultValue: z.string().optional(),
      isRequired: z.boolean().optional(),
      allowCustom: z.boolean().optional(),
      inheritFrom: z.enum(["CATEGORY", "TEMPLATE", "NONE"]).optional(),
      inheritConfigId: z.string().optional(),
      options: z.array(
        z.object({
          value: z.string(),
          label: z.string(),
          description: z.string().optional(),
          priceModifier: z.number().optional(),
          isPercentage: z.boolean().optional(),
          modifierType: z.enum(["ADD", "MULTIPLY", "REPLACE"]).optional(),
          sortOrder: z.number().optional(),
        })
      ).optional(),
    });

    const data = schema.parse(body);

    const config = await prisma.productConfig.create({
      data: {
        productId,
        templateId: data.templateId,
        categoryConfigId: data.categoryConfigId,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        unit: data.unit,
        unitPlural: data.unitPlural,
        icon: data.icon,
        pricingModel: data.pricingModel,
        basePrice: data.basePrice,
        pricePerUnit: data.pricePerUnit,
        currency: data.currency,
        billingCycle: data.billingCycle,
        isRecurring: data.isRecurring,
        inputType: data.inputType,
        minValue: data.minValue,
        maxValue: data.maxValue,
        stepValue: data.stepValue,
        defaultValue: data.defaultValue,
        isRequired: data.isRequired,
        allowCustom: data.allowCustom,
        inheritFrom: data.inheritFrom,
        inheritConfigId: data.inheritConfigId,
        options: data.options
          ? {
              create: data.options.map((opt) => ({
                value: opt.value,
                label: opt.label,
                description: opt.description,
                priceModifier: opt.priceModifier,
                isPercentage: opt.isPercentage || false,
                modifierType: opt.modifierType || "ADD",
                sortOrder: opt.sortOrder || 0,
              })),
            }
          : undefined,
      },
      include: {
        options: true,
        template: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Error creating product config:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product configuration" },
      { status: 500 }
    );
  }
}
