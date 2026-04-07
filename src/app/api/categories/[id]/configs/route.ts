import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET /api/categories/[id]/configs - Get configurations for a category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;

    const configs = await prisma.categoryConfig.findMany({
      where: { categoryId },
      include: {
        template: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching category configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch category configurations" },
      { status: 500 }
    );
  }
}

// POST /api/categories/[id]/configs - Apply a configuration template to a category
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

    const categoryId = params.id;
    const body = await request.json();

    const schema = z.object({
      templateId: z.string(),
      // Optional overrides
      name: z.string().optional(),
      unit: z.string().optional(),
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
      isInherited: z.boolean().optional(),
    });

    const data = schema.parse(body);

    // Check if template exists
    const template = await prisma.productConfigTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if config already exists for this category and template
    const existingConfig = await prisma.categoryConfig.findUnique({
      where: {
        categoryId_templateId: {
          categoryId,
          templateId: data.templateId,
        },
      },
    });

    if (existingConfig) {
      // Update existing config
      const updatedConfig = await prisma.categoryConfig.update({
        where: { id: existingConfig.id },
        data: {
          name: data.name,
          unit: data.unit,
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
          isInherited: data.isInherited,
        },
        include: {
          template: {
            include: {
              options: true,
            },
          },
        },
      });

      return NextResponse.json(updatedConfig);
    }

    // Create new config
    const config = await prisma.categoryConfig.create({
      data: {
        categoryId,
        templateId: data.templateId,
        name: data.name,
        unit: data.unit,
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
        isInherited: data.isInherited ?? true,
      },
      include: {
        template: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Error creating category config:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category configuration" },
      { status: 500 }
    );
  }
}
