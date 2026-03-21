"use client";

import { useState } from "react";
import { Cloud, Server, ChevronRight } from "lucide-react";
import { TallyCloudConfigurator } from "./TallyCloudConfigurator";

interface VSAASProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  basePrice: number | string | any;
  variants: any[];
  addons: any[];
}

interface VSAASConfiguratorProps {
  cloudProduct: VSAASProduct;
  onPremiseProduct: VSAASProduct;
  initialDeploymentType?: "cloud" | "on-premise" | null;
  selectedVariantId?: string | null;
}

export function VSAASConfigurator({ cloudProduct, onPremiseProduct, initialDeploymentType = null, selectedVariantId = null }: VSAASConfiguratorProps) {
  // Determine initial deployment type based on selected variant
  const getInitialType = (): "cloud" | "on-premise" | null => {
    if (initialDeploymentType) return initialDeploymentType;
    if (selectedVariantId) {
      const allVariants = [...cloudProduct.variants, ...onPremiseProduct.variants];
      const variant = allVariants.find((v: any) => v.id === selectedVariantId);
      if (variant) {
        // Use type field first, fallback to name
        if (variant.type === 'cloud') return "cloud";
        if (variant.type === 'onprem') return "on-premise";
        // Fallback to name-based detection
        return variant.name?.toLowerCase().includes('cloud') ? "cloud" : "on-premise";
      }
    }
    return null;
  };

  const [deploymentType, setDeploymentType] = useState<"cloud" | "on-premise" | null>(getInitialType());

  // Transform addons for TallyCloudConfigurator
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
      // Transform options with recurring prices
      options: addon.options ? addon.options.map((opt: any) => ({
        label: opt.label,
        price: Number(opt.price) || 0,
        unit: opt.unit || undefined,
        recurringPricesObj: opt.recurringPricesObj ? {
          monthly: opt.recurringPricesObj.monthly,
          quarterly: opt.recurringPricesObj.quarterly,
          yearly: opt.recurringPricesObj.yearly,
          semiAnnual: opt.recurringPricesObj.semiAnnual,
          biennial: opt.recurringPricesObj.biennial,
          triennial: opt.recurringPricesObj.triennial,
        } : null,
      })) : undefined,
      // Include recurringPricesObj for addon pricing based on billing cycle
      recurringPricesObj: addon.recurringPricesObj ? {
        monthly: addon.recurringPricesObj.monthly,
        quarterly: addon.recurringPricesObj.quarterly,
        yearly: addon.recurringPricesObj.yearly,
        semiAnnual: addon.recurringPricesObj.semiAnnual,
        biennial: addon.recurringPricesObj.biennial,
        triennial: addon.recurringPricesObj.triennial,
      } : null,
    }));
  };

  // Transform variants for TallyCloudConfigurator
  const transformVariants = (variants: any[]) => {
    return variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price) || 0,
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
      isDefault: variant.isDefault || false,
      // Include the type field (cloud or onprem)
      type: variant.type || undefined,
      attributes: variant.attributes as Record<string, string> || {},
      billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
      setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
      // Include minQuantity and maxQuantity for quantity constraints
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
      // Build from the first recurring price entry if available
      recurringPricesObj: variant.recurringPrices && variant.recurringPrices.length > 0 ? {
        monthly: variant.recurringPrices[0].monthlyPrice,
        quarterly: variant.recurringPrices[0].quarterlyPrice,
        yearly: variant.recurringPrices[0].yearlyPrice,
        semiAnnual: variant.recurringPrices[0].semiAnnualPrice,
        biennial: variant.recurringPrices[0].biennialPrice,
        triennial: variant.recurringPrices[0].triennialPrice,
      } : null,
    }));
  };

  const cloudAddons = transformAddons(cloudProduct.addons);
  const cloudVariants = transformVariants(cloudProduct.variants);
  const onPremiseAddons = transformAddons(onPremiseProduct.addons);
  const onPremiseVariants = transformVariants(onPremiseProduct.variants);

  return (
    <div className="w-full">
      {/* Deployment Type Selector */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {deploymentType ? `Selected Solution: ${deploymentType === 'cloud' ? 'Cloud' : 'On-Premise'}` : 'Select Your Solution Type'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* VSAAS Cloud Card */}
          <button
            onClick={() => setDeploymentType("cloud")}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
              deploymentType === "cloud"
                ? "border-[#C62828] bg-red-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${deploymentType === "cloud" ? "bg-[#C62828] text-white" : "bg-gray-100 text-gray-600"}`}>
                <Cloud size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">VSaaS on Cloud</h3>
                <p className="text-sm text-gray-500">Cloud-based video surveillance system</p>
              </div>
            </div>
            
            {/* Selected Indicator */}
            {deploymentType === "cloud" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#C62828] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* VSAAS On-Premise Card */}
          <button
            onClick={() => setDeploymentType("on-premise")}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
              deploymentType === "on-premise"
                ? "border-[#C62828] bg-red-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${deploymentType === "on-premise" ? "bg-[#C62828] text-white" : "bg-gray-100 text-gray-600"}`}>
                <Server size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">On-Premise Solution</h3>
                <p className="text-sm text-gray-500">Self-hosted video surveillance system</p>

              </div>
            </div>

            {/* Selected Indicator */}
            {deploymentType === "on-premise" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#C62828] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="transition-all duration-500">
        {deploymentType === null && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">
              Select a deployment type to configure your VSAAS solution.
            </p>
          </div>
        )}

        {deploymentType === "cloud" && (
          <div className="animate-fadeIn">
            <TallyCloudConfigurator
              productId={cloudProduct.id}
              productSlug={cloudProduct.slug}
              productName={cloudProduct.name}
              productDescription={cloudProduct.shortDescription || cloudProduct.description || undefined}
              basePrice={Number(cloudProduct.basePrice) || 0}
              addons={cloudAddons}
              variants={cloudVariants}
            />
          </div>
        )}

        {deploymentType === "on-premise" && (
          <div className="animate-fadeIn">
            <TallyCloudConfigurator
              productId={onPremiseProduct.id}
              productSlug={onPremiseProduct.slug}
              productName={onPremiseProduct.name}
              productDescription={onPremiseProduct.shortDescription || onPremiseProduct.description || undefined}
              basePrice={Number(onPremiseProduct.basePrice) || 0}
              addons={onPremiseAddons}
              variants={onPremiseVariants}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
