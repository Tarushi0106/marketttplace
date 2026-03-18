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
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "VSAAS - Configure Your Solution | Shaurrya Teleservices",
    description: "Configure your Video Surveillance as a Service solution. Choose between cloud or on-premise deployment.",
  };
}

export default async function VSAASConfigurePage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Fetch both VSAAS products
  const cloudProduct = await prisma.product.findFirst({
    where: {
      slug: "connect-cloud",
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

  const onPremiseProduct = await prisma.product.findFirst({
    where: {
      slug: "vsaas-on-premise",
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

  // Transform addons
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

  const cloudAddons = cloudProduct ? transformAddons(cloudProduct.addons) : [];
  const cloudVariants = cloudProduct ? transformVariants(cloudProduct.variants) : [];
  const onPremiseAddons = onPremiseProduct ? transformAddons(onPremiseProduct.addons) : [];
  const onPremiseVariants = onPremiseProduct ? transformVariants(onPremiseProduct.variants) : [];

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

      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Product Icon */}
            <div className="flex-shrink-0 w-16 h-16 md:w-16 md:h-16 bg-[#FDECEC] rounded-xl flex items-center justify-center">
              {renderProductIcon("Cloud")}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Configure Your VSAAS Solution
                </h1>
              </div>
              <p className="text-gray-600 mb-4 max-w-2xl">
                Choose your deployment type and customize your video surveillance solution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VSAAS Configurator with Deployment Type Selector */}
      {cloudProduct && onPremiseProduct ? (
        <VSAASConfigurator 
          cloudProduct={cloudProduct}
          onPremiseProduct={onPremiseProduct}
        />
      ) : (
        <div className="container mx-auto px-4 py-10 text-center">
          <p className="text-gray-500">VSAAS products not found. Please configure them in the admin panel.</p>
        </div>
      )}
    </div>
  );
}
