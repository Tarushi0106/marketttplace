import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Building2, Cloud, Shield, Server, Database, Lock, Globe } from "lucide-react";
import Image from "next/image";
import { ProductConfigurator } from "@/components/storefront/ProductConfigurator";

// Render icon based on icon name
function renderProductIcon(iconName?: string | null) {
  const props = { size: 32, className: "text-[#C62828]" };

  switch (iconName) {
    case "Cloud":
      return <Cloud {...props} />;
    case "Shield":
      return <Shield {...props} />;
    case "Server":
      return <Server {...props} />;
    case "Database":
      return <Database {...props} />;
    case "Lock":
      return <Lock {...props} />;
    case "Globe":
      return <Globe {...props} />;
    default:
      return <Cloud {...props} />;
  }
}

// Type for recurring prices with per-billing-frequency setup fees
interface RecurringPricesWithSetupFees {
  monthlyPrice?: number;
  monthlySetupFee?: number;
  biMonthlyPrice?: number;
  biMonthlySetupFee?: number;
  fourMonthlyPrice?: number;
  fourMonthlySetupFee?: number;
  quarterlyPrice?: number;
  quarterlySetupFee?: number;
  triMonthlyPrice?: number;
  triMonthlySetupFee?: number;
  semiAnnualPrice?: number;
  semiAnnualSetupFee?: number;
  triAnnualPrice?: number;
  triAnnualSetupFee?: number;
  yearlyPrice?: number;
  yearlySetupFee?: number;
  biennialPrice?: number;
  biennialSetupFee?: number;
  triennialPrice?: number;
  triennialSetupFee?: number;
  monthlySavings?: number;
  quarterlySavings?: number;
  yearlySavings?: number;
}

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
        include: {
          recurringPrices: true,
        },
      },
      addons: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      configs: {
        orderBy: { sortOrder: "asc" },
      },
      recurringPrices: true,
      seoMetadata: true,
    },
  });

  if (product) {
    // Store all recurring prices before filtering (for variant lookup)
    const allRecurringPrices = product.recurringPrices ? [...product.recurringPrices] : [];
    
    // Transform recurringPrices to include variant-specific pricing
    // For standalone products: recurringPrices where variantId is null
    // For variable products: recurringPrices for each variant
    if (product.recurringPrices) {
      // Filter product-level recurring prices (variantId = null)
      product.recurringPrices = product.recurringPrices.filter((rp) => !rp.variantId);
    }
    
    // Ensure variant recurringPrices are properly associated
    if (product.variants) {
      product.variants = product.variants.map((variant) => {
        // Find recurring prices specifically for this variant from the original array
        const variantSpecificPrices = allRecurringPrices.filter((rp) => rp.variantId === variant.id);
        
        if (variantSpecificPrices.length > 0) {
          // Use variant-specific recurring prices
          variant.recurringPrices = variantSpecificPrices;
        } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
          // Variant already has recurring prices (included in query)
          // Keep as is
        } else {
          // No variant-specific prices - clear to avoid stale data
          variant.recurringPrices = [];
        }
        return variant;
      });
    }
  }

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

export default async function ConfigureProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Get the selected variant from query params
  const selectedVariantId = resolvedSearchParams?.variant || null;

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
        where: {
          isActive: true,
        },
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
        basePrice: catConfig.basePrice ? Number(catConfig.basePrice) : undefined,
        pricePerUnit: catConfig.pricePerUnit ? Number(catConfig.pricePerUnit) : undefined,
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
        options: (catConfig.template.options || []).map((opt: any) => ({
          id: opt.id,
          value: opt.value,
          label: opt.label || opt.value,
          description: opt.description,
          priceModifier: typeof opt.priceModifier === 'object' && opt.priceModifier !== null ? Number(opt.priceModifier.toString()) : Number(opt.priceModifier) || 0,
          monthlyPriceModifier: opt.monthlyPriceModifier ? typeof opt.monthlyPriceModifier === 'object' ? Number(opt.monthlyPriceModifier.toString()) : Number(opt.monthlyPriceModifier) : undefined,
          yearlyPriceModifier: opt.yearlyPriceModifier ? typeof opt.yearlyPriceModifier === 'object' ? Number(opt.yearlyPriceModifier.toString()) : Number(opt.yearlyPriceModifier) : undefined,
          isPercentage: opt.isPercentage,
          modifierType: opt.modifierType,
          isAvailable: opt.isAvailable,
          stockStatus: opt.stockStatus,
        })),
      }));
  }

  // Get recurring prices - use ProductRecurringPrice table
  const recurringPrices = await prisma.productRecurringPrice.findFirst({
    where: { productId: product.id },
  }) as any;

  // Build recurring prices object from ProductRecurringPrice table
  const productRecurringPrices: RecurringPricesWithSetupFees | null = recurringPrices
    ? {
        monthlyPrice: recurringPrices.monthlyPrice ? Number(recurringPrices.monthlyPrice) : undefined,
        monthlySetupFee: recurringPrices.monthlySetupFee ? Number(recurringPrices.monthlySetupFee) : undefined,
        biMonthlyPrice: recurringPrices.biMonthlyPrice ? Number(recurringPrices.biMonthlyPrice) : undefined,
        biMonthlySetupFee: recurringPrices.biMonthlySetupFee ? Number(recurringPrices.biMonthlySetupFee) : undefined,
        fourMonthlyPrice: recurringPrices.fourMonthlyPrice ? Number(recurringPrices.fourMonthlyPrice) : undefined,
        fourMonthlySetupFee: recurringPrices.fourMonthlySetupFee ? Number(recurringPrices.fourMonthlySetupFee) : undefined,
        quarterlyPrice: recurringPrices.quarterlyPrice ? Number(recurringPrices.quarterlyPrice) : undefined,
        quarterlySetupFee: recurringPrices.quarterlySetupFee ? Number(recurringPrices.quarterlySetupFee) : undefined,
        triMonthlyPrice: recurringPrices.triMonthlyPrice ? Number(recurringPrices.triMonthlyPrice) : undefined,
        triMonthlySetupFee: recurringPrices.triMonthlySetupFee ? Number(recurringPrices.triMonthlySetupFee) : undefined,
        semiAnnualPrice: recurringPrices.semiAnnualPrice ? Number(recurringPrices.semiAnnualPrice) : undefined,
        semiAnnualSetupFee: recurringPrices.semiAnnualSetupFee ? Number(recurringPrices.semiAnnualSetupFee) : undefined,
        triAnnualPrice: recurringPrices.triAnnualPrice ? Number(recurringPrices.triAnnualPrice) : undefined,
        triAnnualSetupFee: recurringPrices.triAnnualSetupFee ? Number(recurringPrices.triAnnualSetupFee) : undefined,
        yearlyPrice: recurringPrices.yearlyPrice ? Number(recurringPrices.yearlyPrice) : undefined,
        yearlySetupFee: recurringPrices.yearlySetupFee ? Number(recurringPrices.yearlySetupFee) : undefined,
        biennialPrice: recurringPrices.biennialPrice ? Number(recurringPrices.biennialPrice) : undefined,
        biennialSetupFee: recurringPrices.biennialSetupFee ? Number(recurringPrices.biennialSetupFee) : undefined,
        triennialPrice: recurringPrices.triennialPrice ? Number(recurringPrices.triennialPrice) : undefined,
        triennialSetupFee: recurringPrices.triennialSetupFee ? Number(recurringPrices.triennialSetupFee) : undefined,
        monthlySavings: recurringPrices.monthlySavings ? Number(recurringPrices.monthlySavings) : undefined,
        quarterlySavings: recurringPrices.quarterlySavings ? Number(recurringPrices.quarterlySavings) : undefined,
        yearlySavings: recurringPrices.yearlySavings ? Number(recurringPrices.yearlySavings) : undefined,
      }
    : null;

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
            {/* Product Icon */}
            <div className="flex-shrink-0 w-16 h-16 md:w-16 md:h-16 bg-[#FDECEC] rounded-xl flex items-center justify-center">
              {renderProductIcon(product.icon)}
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
            isRecurring: product.isRecurring,
          }}
          selectedVariantId={selectedVariantId}
          variants={product.productType === "CONFIGURABLE" ? product.variants.map((variant: any) => {
            // Extract billingType from variant attributes or default to RECURRING
            const variantAttributes = variant.attributes as Record<string, any> || {};
            const variantBillingType = variantAttributes.billingType || "RECURRING";
            // Extract setupFee from variant attributes for ONE_TIME billing
            // For ONE_TIME billing, setupFee should only be used if explicitly set, otherwise 0
            const variantSetupFee = variantAttributes.setupFee ? Number(variantAttributes.setupFee) : 0;
            
            // Convert Decimal values in recurring prices to numbers
            const convertedRecurringPrices = (variant.recurringPrices || [])
              .filter((rp: any) => rp.variantId === variant.id)
              .map((rp: any) => ({
                id: rp.id,
                variantId: rp.variantId,
                monthlyPrice: rp.monthlyPrice ? Number(rp.monthlyPrice) : null,
                biMonthlyPrice: rp.biMonthlyPrice ? Number(rp.biMonthlyPrice) : null,
                quarterlyPrice: rp.quarterlyPrice ? Number(rp.quarterlyPrice) : null,
                fourMonthlyPrice: rp.fourMonthlyPrice ? Number(rp.fourMonthlyPrice) : null,
                semiAnnualPrice: rp.semiAnnualPrice ? Number(rp.semiAnnualPrice) : null,
                triAnnualPrice: rp.triAnnualPrice ? Number(rp.triAnnualPrice) : null,
                yearlyPrice: rp.yearlyPrice ? Number(rp.yearlyPrice) : null,
                biennialPrice: rp.biennialPrice ? Number(rp.biennialPrice) : null,
                triennialPrice: rp.triennialPrice ? Number(rp.triennialPrice) : null,
                monthlySetupFee: rp.monthlySetupFee ? Number(rp.monthlySetupFee) : null,
                biMonthlySetupFee: rp.biMonthlySetupFee ? Number(rp.biMonthlySetupFee) : null,
                quarterlySetupFee: rp.quarterlySetupFee ? Number(rp.quarterlySetupFee) : null,
                fourMonthlySetupFee: rp.fourMonthlySetupFee ? Number(rp.fourMonthlySetupFee) : null,
                semiAnnualSetupFee: rp.semiAnnualSetupFee ? Number(rp.semiAnnualSetupFee) : null,
                triAnnualSetupFee: rp.triAnnualSetupFee ? Number(rp.triAnnualSetupFee) : null,
                yearlySetupFee: rp.yearlySetupFee ? Number(rp.yearlySetupFee) : null,
                biennialSetupFee: rp.biennialSetupFee ? Number(rp.biennialSetupFee) : null,
                triennialSetupFee: rp.triennialSetupFee ? Number(rp.triennialSetupFee) : null,
              }));
            
            return {
              id: variant.id,
              name: variant.name,
              price: Number(variant.price),
              compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
              attributes: variant.attributes as Record<string, string> || {},
              isDefault: variant.isDefault || false,
              // Include variant-specific recurring prices with converted Decimal values
              recurringPrices: convertedRecurringPrices,
              // Include billingType from variant attributes
              billingType: variantBillingType as "ONE_TIME" | "RECURRING",
              // Include setupFee for ONE_TIME billing
              setupFee: variantSetupFee,
            };
          }) : []}
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
            basePrice: config.basePrice != null ? Number(config.basePrice) : 0,
            pricePerUnit: config.pricePerUnit != null ? Number(config.pricePerUnit) : 0,
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
            options: (config.options || []).map((opt: any) => ({
              id: opt.id,
              value: opt.value,
              label: opt.label || opt.value,
              description: opt.description,
              priceModifier: typeof opt.priceModifier === 'object' && opt.priceModifier !== null ? Number(opt.priceModifier.toString()) : Number(opt.priceModifier) || 0,
              monthlyPriceModifier: opt.monthlyPriceModifier ? typeof opt.monthlyPriceModifier === 'object' ? Number(opt.monthlyPriceModifier.toString()) : Number(opt.monthlyPriceModifier) : undefined,
              yearlyPriceModifier: opt.yearlyPriceModifier ? typeof opt.yearlyPriceModifier === 'object' ? Number(opt.yearlyPriceModifier.toString()) : Number(opt.yearlyPriceModifier) : undefined,
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
            productRecurringPrices
              ? {
                  monthlyPrice: productRecurringPrices.monthlyPrice,
                  monthlySetupFee: productRecurringPrices.monthlySetupFee,
                  biMonthlyPrice: productRecurringPrices.biMonthlyPrice,
                  biMonthlySetupFee: productRecurringPrices.biMonthlySetupFee,
                  fourMonthlyPrice: productRecurringPrices.fourMonthlyPrice,
                  fourMonthlySetupFee: productRecurringPrices.fourMonthlySetupFee,
                  quarterlyPrice: productRecurringPrices.quarterlyPrice,
                  quarterlySetupFee: productRecurringPrices.quarterlySetupFee,
                  triMonthlyPrice: productRecurringPrices.triMonthlyPrice,
                  triMonthlySetupFee: productRecurringPrices.triMonthlySetupFee,
                  semiAnnualPrice: productRecurringPrices.semiAnnualPrice,
                  semiAnnualSetupFee: productRecurringPrices.semiAnnualSetupFee,
                  triAnnualPrice: productRecurringPrices.triAnnualPrice,
                  triAnnualSetupFee: productRecurringPrices.triAnnualSetupFee,
                  yearlyPrice: productRecurringPrices.yearlyPrice,
                  yearlySetupFee: productRecurringPrices.yearlySetupFee,
                  biennialPrice: productRecurringPrices.biennialPrice,
                  biennialSetupFee: productRecurringPrices.biennialSetupFee,
                  triennialPrice: productRecurringPrices.triennialPrice,
                  triennialSetupFee: productRecurringPrices.triennialSetupFee,
                  monthlySavings: productRecurringPrices.monthlySavings,
                  quarterlySavings: productRecurringPrices.quarterlySavings,
                  yearlySavings: productRecurringPrices.yearlySavings,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
