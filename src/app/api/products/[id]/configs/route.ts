import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const configs = await prisma.productConfig.findMany({
      where: { productId },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching product configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { configurations } = body;

    console.log("Received configurations:", configurations);

    // Delete existing options first (they reference configs)
    await prisma.productConfigOption.deleteMany({
      where: {
        config: {
          productId,
        },
      },
    });
    // Delete existing configurations
    await prisma.productConfig.deleteMany({
      where: { productId },
    });

    console.log("Deleted existing configs");

    // Create new configurations with options
    if (configurations && configurations.length > 0) {
      for (const config of configurations) {
        const { options, ...configData } = config;

        const createdConfig = await prisma.productConfig.create({
          data: {
            productId,
            configType: configData.configType || null,
            name: configData.displayName || configData.name || "Config",
            displayName: configData.displayName,
            description: configData.description,
            inputType: configData.inputType || "SELECT",
            unit: configData.unit,
            unitPlural: configData.unitPlural,
            minValue: configData.minValue,
            maxValue: configData.maxValue,
            stepValue: configData.stepValue,
            defaultValue: configData.defaultValue,
            isRequired: configData.isRequired ?? true,
            allowCustom: configData.allowCustom ?? false,
            sortOrder: configData.sortOrder || 0,
            basePrice: configData.basePrice || 0,
            pricePerUnit: configData.pricePerUnit || 0,
          },
        });

        console.log("Created config:", createdConfig.id);

        // Create options one by one
        if (options && options.length > 0) {
          for (const opt of options) {
            await prisma.productConfigOption.create({
              data: {
                configId: createdConfig.id,
                value: opt.value || "",
                label: opt.label || "",
                description: opt.description || null,
                priceModifier: opt.priceModifier || 0,
                monthlyPriceModifier: opt.monthlyPriceModifier ?? opt.priceModifier ?? 0,
                yearlyPriceModifier: opt.yearlyPriceModifier ?? opt.priceModifier ?? 0,
                isPercentage: opt.isPercentage || false,
                modifierType: opt.modifierType || "ADD",
                sortOrder: opt.sortOrder || 0,
                isAvailable: opt.isAvailable ?? true,
                stockStatus: opt.stockStatus || null,
              },
            });
          }
          console.log("Created", options.length, "options for config", createdConfig.id);
        }
      }
    }

    // Fetch and return the saved configurations
    const savedConfigs = await prisma.productConfig.findMany({
      where: { productId },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    console.log("Returning saved configs:", savedConfigs.length);
    return NextResponse.json(savedConfigs);
  } catch (error) {
    console.error("Error saving product configs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save configurations" },
      { status: 500 }
    );
  }
}
