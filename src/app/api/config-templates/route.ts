import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET /api/config-templates - List all configuration templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (scope) {
      where.scope = scope;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const templates = await prisma.productConfigTemplate.findMany({
      where,
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            categoryConfigs: true,
            productConfigs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching config templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration templates" },
      { status: 500 }
    );
  }
}

// POST /api/config-templates - Create a new configuration template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      scope: z.enum(["GLOBAL", "CATEGORY", "PRODUCT"]).optional(),
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

    const template = await prisma.productConfigTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        scope: data.scope || "PRODUCT",
        unit: data.unit,
        unitPlural: data.unitPlural,
        icon: data.icon,
        pricingModel: data.pricingModel || "PER_UNIT",
        basePrice: data.basePrice,
        pricePerUnit: data.pricePerUnit,
        currency: data.currency || "USD",
        billingCycle: data.billingCycle || "ONE_TIME",
        isRecurring: data.isRecurring || false,
        inputType: data.inputType || "SELECT",
        minValue: data.minValue,
        maxValue: data.maxValue,
        stepValue: data.stepValue,
        defaultValue: data.defaultValue,
        isRequired: data.isRequired || false,
        allowCustom: data.allowCustom || false,
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
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating config template:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create configuration template" },
      { status: 500 }
    );
  }
}
