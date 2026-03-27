import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Building2, Cloud, Shield, Server, Database, Lock, Globe } from "lucide-react";
import Image from "next/image";
import { VSAASConfigurator } from "@/components/storefront/VSAASConfigurator";

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

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Configure Your Solution | Shaurrya Teleservices",
    description: "Configure your video surveillance solution. Choose between cloud or on-premise deployment.",
  };
}

export default async function VSAASConfigurePage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Fetch main VSAAS product with variants
  const vsaasProductRaw = await prisma.product.findUnique({
    where: {
      slug: "vsaas",
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
      recurringPrices: true,
    },
  });

  // Transform product to add recurringPricesObj for each variant
  let vsaasProduct = vsaasProductRaw;
  if (vsaasProductRaw) {
    const allRecurringPrices = vsaasProductRaw.recurringPrices ? [...vsaasProductRaw.recurringPrices] : [];
    
    if (vsaasProductRaw.variants) {
      vsaasProduct = {
        ...vsaasProductRaw,
        variants: vsaasProductRaw.variants.map((variant) => {
          const variantSpecificPrices = allRecurringPrices.filter((rp) => rp.variantId === variant.id);
          
          if (variantSpecificPrices.length > 0) {
            return {
              ...variant,
              recurringPrices: variantSpecificPrices,
              recurringPricesObj: {
                monthly: variantSpecificPrices[0]?.monthlyPrice ? Number(variantSpecificPrices[0].monthlyPrice) : null,
                quarterly: variantSpecificPrices[0]?.quarterlyPrice ? Number(variantSpecificPrices[0].quarterlyPrice) : null,
                yearly: variantSpecificPrices[0]?.yearlyPrice ? Number(variantSpecificPrices[0].yearlyPrice) : null,
                biennial: variantSpecificPrices[0]?.biennialPrice ? Number(variantSpecificPrices[0].biennialPrice) : null,
                triennial: variantSpecificPrices[0]?.triennialPrice ? Number(variantSpecificPrices[0].triennialPrice) : null,
                semiAnnual: variantSpecificPrices[0]?.semiAnnualPrice ? Number(variantSpecificPrices[0].semiAnnualPrice) : null,
              },
            };
          } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
            return {
              ...variant,
              recurringPricesObj: {
                monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
                quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
                yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
                biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
                triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
                semiAnnual: variant.recurringPrices[0]?.semiAnnualPrice ? Number(variant.recurringPrices[0].semiAnnualPrice) : null,
              },
            };
          }
          return {
            ...variant,
            recurringPrices: [],
            recurringPricesObj: null,
          };
        }),
      };
    }
  }

  // Transform for configurator
  const transformAddons = (addons: any[]) => {
    return addons.map(addon => ({
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
  };

  // Transform variants
  const transformVariants = (variants: any[]) => {
    return variants.map(variant => {
      // Build recurringPricesObj from the first recurring price entry if available
      const recurringPricesObj = variant.recurringPrices && variant.recurringPrices.length > 0 ? {
        monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
        quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
        yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
        semiAnnual: variant.recurringPrices[0]?.semiAnnualPrice ? Number(variant.recurringPrices[0].semiAnnualPrice) : null,
        biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
        triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
      } : null;
      
      return {
        id: variant.id,
        name: variant.name,
        price: Number(variant.price) || 0,
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        isDefault: variant.isDefault || false,
        type: variant.type || undefined,
        attributes: variant.attributes as Record<string, string> || {},
        billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
        setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
        minQuantity: variant.minQuantity || 1,
        maxQuantity: variant.maxQuantity || null,
        // Include recurring prices if available
        recurringPrices: variant.recurringPrices ? variant.recurringPrices.map((rp: any) => ({
          id: rp.id,
          variantId: rp.variantId,
          monthlyPrice: rp.monthlyPrice ? Number(rp.monthlyPrice) : null,
          quarterlyPrice: rp.quarterlyPrice ? Number(rp.quarterlyPrice) : null,
          yearlyPrice: rp.yearlyPrice ? Number(rp.yearlyPrice) : null,
          biMonthlyPrice: rp.biMonthlyPrice ? Number(rp.biMonthlyPrice) : null,
          fourMonthlyPrice: rp.fourMonthlyPrice ? Number(rp.fourMonthlyPrice) : null,
          semiAnnualPrice: rp.semiAnnualPrice ? Number(rp.semiAnnualPrice) : null,
          triAnnualPrice: rp.triAnnualPrice ? Number(rp.triAnnualPrice) : null,
          biennialPrice: rp.biennialPrice ? Number(rp.biennialPrice) : null,
          triennialPrice: rp.triennialPrice ? Number(rp.triennialPrice) : null,
        })) : [],
        // Include recurringPricesObj for easier price lookup by billing cycle
        recurringPricesObj,
      };
    });
  };

  // Filter variants by type field (with fallback to name for backwards compatibility)
  const cloudVariants = vsaasProduct ? transformVariants(
    vsaasProduct.variants.filter((v: any) => 
      v.type === 'cloud' || 
      v.attributes?.type === 'cloud' || 
      v.name.toLowerCase().includes('cloud') || 
      v.sku?.toLowerCase().includes('cloud') ||
      v.name.startsWith('☁️')
    )
  ) : [];
  const onPremiseVariants = vsaasProduct ? transformVariants(
    vsaasProduct.variants.filter((v: any) => 
      v.type === 'onprem' || 
      v.attributes?.type === 'onprem' || 
      v.name.toLowerCase().includes('on premise') || 
      v.name.toLowerCase().includes('on-prem') ||
      v.name.toLowerCase().includes('stream os') ||
      v.sku?.toLowerCase().includes('onprem') ||
      v.sku?.toLowerCase().includes('on-premise') ||
      v.name.startsWith('🖥️')
    )
  ) : [];

  // Filter for AI variants
  const aiVariants = vsaasProduct ? transformVariants(
    vsaasProduct.variants.filter((v: any) => 
      v.type === 'ai' || 
      v.attributes?.type === 'ai' || 
      v.name.toLowerCase().includes('ai') ||
      v.sku?.toLowerCase().includes('ai') ||
      v.name.startsWith('🤖')
    )
  ) : [];

  // Filter addons by group prefix (Cloud vs On-Premise)
  const cloudAddons = vsaasProduct ? transformAddons(
    vsaasProduct.addons.filter((a: any) => 
      a.group?.toLowerCase().includes('cloud') || 
      a.group?.startsWith('☁️') ||
      (!a.group && (a.name.toLowerCase().includes('cloud') || a.name.startsWith('Cloud - ')))
    )
  ) : [];
  const onPremiseAddons = vsaasProduct ? transformAddons(
    vsaasProduct.addons.filter((a: any) => 
      a.group?.toLowerCase().includes('on-premise') || 
      a.group?.toLowerCase().includes('on premise') || 
      a.group?.toLowerCase().includes('onprem') ||
      a.group?.startsWith('🖥️') ||
      (!a.group && (a.name.toLowerCase().includes('on premise') || a.name.startsWith('On-Premise - ')))
    )
  ) : [];

  // Filter for AI products
  const aiAddons = vsaasProduct ? transformAddons(
    vsaasProduct.addons.filter((a: any) => 
      a.group?.toLowerCase().includes('ai') || 
      a.group?.startsWith('🤖') ||
      (!a.group && a.name.toLowerCase().includes('ai'))
    )
  ) : [];

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
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">VSAAS</span>
          </nav>
        </div>
      </div>

      {/* VSAAS Configurator with Deployment Type Selector */}
      {vsaasProduct && cloudVariants.length > 0 && onPremiseVariants.length > 0 ? (
        <VSAASConfigurator 
          cloudProduct={{
            ...vsaasProduct,
            variants: cloudVariants,
            addons: cloudAddons,
            images: vsaasProduct.images || [],
          } as any}
          onPremiseProduct={{
            ...vsaasProduct,
            variants: onPremiseVariants,
            addons: onPremiseAddons,
            images: vsaasProduct.images || [],
          } as any}
          aiProduct={{
            ...vsaasProduct,
            variants: aiVariants,
            addons: aiAddons,
            images: vsaasProduct.images || [],
          } as any}
          selectedVariantId={resolvedSearchParams.variant || undefined}
        />
      ) : (
        <div className="container mx-auto px-4 py-10 text-center">
          <p className="text-gray-500">VSAAS products not found. Please configure them in the admin panel.</p>
        </div>
      )}
    </div>
  );
}
