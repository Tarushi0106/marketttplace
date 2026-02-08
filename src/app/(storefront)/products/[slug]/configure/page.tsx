import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Building2 } from "lucide-react";
import Image from "next/image";
import { ProductConfigurator } from "@/components/storefront/ProductConfigurator";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: "ACTIVE",
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      addons: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      seoMetadata: true,
    },
  });

  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `Configure ${product.name} | Shaurrya Teleservices`,
    description: `Configure and customize your ${product.name} plan with our flexible options.`,
  };
}

export default async function ConfigureProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Redirect to product detail page if no configurations or variants
  if (
    product.productType === "STANDALONE" &&
    product.variants.length === 0 &&
    product.addons.length === 0
  ) {
    redirect(`/products/${product.slug}`);
  }

  // Get configurations for the product
  const configs = await prisma.productConfig.findMany({
    where: {
      productId: product.id,
      isActive: true,
    },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const allConfigs = configs;

  // Get inherited configs from category
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

    // Filter out configs that are already applied to the product
    const productConfigTemplateIds = configs
      .filter((c: any) => c.categoryConfigId)
      .map((c: any) => c.categoryConfigId);

    inheritedConfigs = categoryConfigs
      .filter((c) => !productConfigTemplateIds?.includes(c.id))
      .map((catConfig) => ({
        id: catConfig.id,
        categoryConfigId: catConfig.id,
        name: catConfig.name || catConfig.template.name,
        displayName: catConfig.template.name,
        description: catConfig.template.description || "",
        unit: catConfig.unit || catConfig.template.unit || "",
        unitPlural: catConfig.template.unitPlural || catConfig.unit || "",
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
        source: "CATEGORY",
        inheritedFromId: catConfig.id,
        options: catConfig.template.options.map((opt: any) => ({
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
  const recurringPrices = await prisma.productRecurringPrice.findFirst({
    where: { productId: product.id },
  });

  // Category addons - placeholder for future implementation
  const categoryAddons: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#8B1D1D] transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-[#8B1D1D] transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-[#8B1D1D] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-[#8B1D1D] transition-colors"
            >
              {product.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Configure</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Product Logo/Image */}
            <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden">
              {product.brandLogo ? (
                <Image
                  src={product.brandLogo}
                  alt={`${product.name} logo`}
                  width={120}
                  height={120}
                  className="w-full h-full object-contain p-3"
                />
              ) : product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  width={120}
                  height={120}
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {product.productType.replace("_", " ")}
                </span>
              </div>
              {product.shortDescription && (
                <p className="text-gray-600 mb-4 max-w-2xl">
                  {product.shortDescription}
                </p>
              )}
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center gap-2 text-[#8B1D1D] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                View full product details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
        <ProductConfigurator
          product={{
            id: product.id,
            name: product.name,
            basePrice: Number(product.basePrice),
            productType: product.productType,
            images: product.images,
          }}
          configs={allConfigs.map((config: any) => ({
            id: config.id,
            configType: config.configType || "STANDARD",
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
            source: config.inheritFrom === "CATEGORY" ? "CATEGORY" : "PRODUCT",
            inheritedFromId: config.categoryConfigId || config.templateId,
            options: config.options.map((opt: any) => ({
              id: opt.id,
              value: opt.value,
              label: opt.label,
              description: opt.description,
              priceModifier: opt.priceModifier,
              monthlyPriceModifier: opt.monthlyPriceModifier,
              yearlyPriceModifier: opt.yearlyPriceModifier,
              isPercentage: opt.isPercentage,
              modifierType: opt.modifierType,
              isAvailable: opt.isAvailable,
              stockStatus: opt.stockStatus,
            })),
          }))}
          inheritedConfigs={inheritedConfigs}
          productAddons={product.addons.map((addon: any) => ({
            id: addon.id,
            name: addon.name,
            description: addon.description,
            price: Number(addon.price),
            pricePerUnit: addon.pricePerUnit,
            unit: addon.unit,
            pricingType: addon.pricingType,
            isRequired: addon.isRequired,
            isSelectedByDefault: false,
            maxQuantity: null,
            addonGroup: null,
            source: 'product',
            uniqueId: `product-${addon.id}`,
          }))}
          categoryAddons={categoryAddons.map((addon: any) => ({
            id: addon.id,
            name: addon.name,
            description: addon.description,
            price: Number(addon.price),
            pricePerUnit: addon.pricePerUnit,
            unit: addon.unit,
            pricingType: addon.pricingType,
            isRequired: addon.isRequired,
            isSelectedByDefault: false,
            maxQuantity: null,
            addonGroup: null,
            source: 'category',
            uniqueId: `category-${addon.id}`,
          }))}
          recurringPrices={
            recurringPrices
              ? {
                  monthlyPrice: Number(recurringPrices.monthlyPrice),
                  yearlyPrice: Number(recurringPrices.yearlyPrice),
                  monthlySavings: recurringPrices.monthlySavings
                    ? Number(recurringPrices.monthlySavings)
                    : undefined,
                  yearlySavings: recurringPrices.yearlySavings
                    ? Number(recurringPrices.yearlySavings)
                    : undefined,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
