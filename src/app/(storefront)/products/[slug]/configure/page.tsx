import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Building2, Cloud, Shield, Server, Database, Lock, Globe } from "lucide-react";
import Image from "next/image";
import { ProductConfigurator } from "@/components/storefront/ProductConfigurator";
import { TallyCloudConfigurator } from "@/components/storefront/TallyCloudConfigurator";

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
  searchParams: Promise<{ variant?: string }>;
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
      product.recurringPrices = product.recurringPrices.map((rp) => {
        // Get the variant-specific pricing if applicable
        const variantSpecificPrices = allRecurringPrices.filter(
          (arp) => arp.variantId === rp.variantId
        );
        
        // If there are variant-specific prices, merge them
        if (variantSpecificPrices.length > 0 && rp.variantId) {
          return {
            ...rp,
            // Keep original values but allow variant override
            monthlyPrice: rp.monthlyPrice,
            quarterlyPrice: rp.quarterlyPrice,
            yearlyPrice: rp.yearlyPrice,
          };
        }
        
        return rp;
      });
    }

    // Ensure variant recurringPrices are properly associated
    if (product.variants) {
      product.variants = product.variants.map((variant) => {
        // Find recurring prices specifically for this variant from the original array
        const variantSpecificPrices = allRecurringPrices.filter((rp) => rp.variantId === variant.id);
        
        if (variantSpecificPrices.length > 0) {
          // Use variant-specific recurring prices
          variant.recurringPrices = variantSpecificPrices;
          // Add transformed object for storefront frontend
          // @ts-ignore - Adding dynamic properties
          variant.recurringPricesObj = {
            monthly: variantSpecificPrices[0]?.monthlyPrice ? Number(variantSpecificPrices[0].monthlyPrice) : null,
            quarterly: variantSpecificPrices[0]?.quarterlyPrice ? Number(variantSpecificPrices[0].quarterlyPrice) : null,
            yearly: variantSpecificPrices[0]?.yearlyPrice ? Number(variantSpecificPrices[0].yearlyPrice) : null,
            biennial: variantSpecificPrices[0]?.biennialPrice ? Number(variantSpecificPrices[0].biennialPrice) : null,
            triennial: variantSpecificPrices[0]?.triennialPrice ? Number(variantSpecificPrices[0].triennialPrice) : null,
            semiAnnual: variantSpecificPrices[0]?.semiAnnualPrice ? Number(variantSpecificPrices[0].semiAnnualPrice) : null,
          };
          // @ts-ignore - Adding dynamic properties
          variant.billingType = 'recurring';
        } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
          // Variant already has recurring prices (included in query)
          // @ts-ignore - Adding dynamic properties
          variant.recurringPricesObj = {
            monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
            quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
            yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
            biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
            triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
            semiAnnual: variant.recurringPrices[0]?.semiAnnualPrice ? Number(variant.recurringPrices[0].semiAnnualPrice) : null,
          };
          // @ts-ignore - Adding dynamic properties
          variant.billingType = 'recurring';
        } else {
          // No variant-specific prices - clear to avoid stale data
          variant.recurringPrices = [];
          // @ts-ignore - Adding dynamic properties
          variant.recurringPricesObj = null;
          // @ts-ignore - Adding dynamic properties
          variant.billingType = 'one_time';
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
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: (product.seoMetadata as any)?.title || `${product.name} | Configure`,
    description: (product.seoMetadata as any)?.description || product.shortDescription || `Configure ${product.name}`,
  };
}

export default async function ConfigureProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedVariantId = resolvedSearchParams?.variant || null;
  console.log("[ConfigurePage] Selected variant from URL:", selectedVariantId);
  
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Show modern configurator for all products with recurring pricing
  // Transform database addons to the format expected by TallyCloudConfigurator
  const transformedAddons = product.addons.map(addon => ({
    id: addon.id,
    name: addon.name,
    description: addon.description || undefined,
    price: Number(addon.price) || 0,
    unit: addon.unit || undefined,
    pricingType: addon.pricingType as "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined,
    source: 'product',
    group: addon.group || undefined,
    options: addon.options as any || undefined,
  }));

  // Transform variants for the configurator
  const transformedVariants = product.variants.map((variant: any) => ({
    id: variant.id,
    name: variant.name,
    price: Number(variant.price) || 0,
    compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
    isDefault: variant.isDefault || false,
    attributes: variant.attributes as Record<string, string> || {},
    billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
    setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
    // Include recurring prices array from database
    recurringPrices: variant.recurringPrices ? variant.recurringPrices.map((rp: any) => ({
      id: rp.id,
      variantId: rp.variantId,
      monthlyPrice: rp.monthlyPrice ? Number(rp.monthlyPrice) : null,
      quarterlyPrice: rp.quarterlyPrice ? Number(rp.quarterlyPrice) : null,
      yearlyPrice: rp.yearlyPrice ? Number(rp.yearlyPrice) : null,
      semiAnnualPrice: rp.semiAnnualPrice ? Number(rp.semiAnnualPrice) : null,
      biMonthlyPrice: rp.biMonthlyPrice ? Number(rp.biMonthlyPrice) : null,
      fourMonthlyPrice: rp.fourMonthlyPrice ? Number(rp.fourMonthlyPrice) : null,
      triAnnualPrice: rp.triAnnualPrice ? Number(rp.triAnnualPrice) : null,
      biennialPrice: rp.biennialPrice ? Number(rp.biennialPrice) : null,
      triennialPrice: rp.triennialPrice ? Number(rp.triennialPrice) : null,
    })) : [],
    // Include recurringPricesObj for easier price lookup by billing cycle
    recurringPricesObj: variant.recurringPricesObj ? {
      monthly: variant.recurringPricesObj.monthly,
      quarterly: variant.recurringPricesObj.quarterly,
      yearly: variant.recurringPricesObj.yearly,
      semiAnnual: variant.recurringPricesObj.semiAnnual,
      biennial: variant.recurringPricesObj.biennial,
      triennial: variant.recurringPricesObj.triennial,
    } : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
        <TallyCloudConfigurator 
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          productDescription={product.shortDescription || product.description || undefined}
          basePrice={Number(product.basePrice) || 0}
          addons={transformedAddons}
          variants={transformedVariants}
          selectedVariantId={selectedVariantId}
          lockedVariantId={selectedVariantId}
        />
      </div>
    </div>
  );
}
