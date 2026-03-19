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
  const vsaasProduct = await prisma.product.findUnique({
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
    return variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price) || 0,
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
      isDefault: variant.isDefault || false,
      attributes: variant.attributes as Record<string, string> || {},
      billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
      setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
    }));
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
            addons: cloudAddons
          }}
          onPremiseProduct={{
            ...vsaasProduct,
            variants: onPremiseVariants,
            addons: onPremiseAddons
          }}
          selectedVariantId={resolvedSearchParams.variant}
        />
      ) : (
        <div className="container mx-auto px-4 py-10 text-center">
          <p className="text-gray-500">VSAAS products not found. Please configure them in the admin panel.</p>
        </div>
      )}
    </div>
  );
}
