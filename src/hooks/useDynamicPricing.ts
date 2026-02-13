/**
 * Dynamic Recurring Pricing Hook
 * 
 * Fetches recurring prices dynamically based on product type:
 * - STANDALONE: Gets pricing from Product Pricing Tab recurring billing section
 * - VARIABLE/CONFIGURABLE: Gets pricing from selected Variant recurring pricing
 * 
 * Rules:
 * - Always derive billing cycles from stored recurring pricing data
 * - UI auto-updates when product type or variant changes
 * - Shows "Unavailable" when recurring pricing is missing
 */

import { useMemo, useEffect, useState, useCallback } from "react";

// Billing cycle type
export type BillingCycle = 
  | "MONTHLY" 
  | "BIMONTHLY" 
  | "QUARTERLY" 
  | "FOUR_MONTHLY" 
  | "SEMI_ANNUAL" 
  | "TRI_ANNUAL" 
  | "YEARLY" 
  | "BIENNIAL" 
  | "TRIENNIAL";

// Product type
export type ProductType = "STANDALONE" | "WITH_ADDONS" | "CONFIGURABLE" | "BUNDLE";

// Recurring price interface
export interface RecurringPrice {
  monthlyPrice?: number;
  biMonthlyPrice?: number;
  quarterlyPrice?: number;
  fourMonthlyPrice?: number;
  semiAnnualPrice?: number;
  triAnnualPrice?: number;
  yearlyPrice?: number;
  biennialPrice?: number;
  triennialPrice?: number;
  monthlySetupFee?: number;
  biMonthlySetupFee?: number;
  quarterlySetupFee?: number;
  fourMonthlySetupFee?: number;
  semiAnnualSetupFee?: number;
  triAnnualSetupFee?: number;
  yearlySetupFee?: number;
  biennialSetupFee?: number;
  triennialSetupFee?: number;
  monthlySavings?: number;
  quarterlySavings?: number;
  yearlySavings?: number;
}

// Available billing cycles derived from stored data
export interface AvailableBillingCycle {
  cycle: BillingCycle;
  label: string;
  periodLabel: string;
  price?: number;
  setupFee?: number;
  savingsPercentage?: number;
}

// Get billing cycle label
export const getBillingCycleLabel = (cycle: BillingCycle): string => {
  const labels: Record<BillingCycle, string> = {
    MONTHLY: "Monthly",
    BIMONTHLY: "Bi-Monthly",
    QUARTERLY: "Quarterly",
    FOUR_MONTHLY: "Four-Monthly",
    SEMI_ANNUAL: "Semi-Annual",
    TRI_ANNUAL: "Tri-Annual",
    YEARLY: "Yearly",
    BIENNIAL: "Biennial",
    TRIENNIAL: "Triennial",
  };
  return labels[cycle] || cycle;
};

// Get billing cycle period label
export const getBillingCyclePeriodLabel = (cycle: BillingCycle): string => {
  const periods: Record<BillingCycle, string> = {
    MONTHLY: "/month",
    BIMONTHLY: "/2 months",
    QUARTERLY: "/quarter",
    FOUR_MONTHLY: "/4 months",
    SEMI_ANNUAL: "/6 months",
    TRI_ANNUAL: "/3 months",
    YEARLY: "/year",
    BIENNIAL: "/2 years",
    TRIENNIAL: "/3 years",
  };
  return periods[cycle] || "";
};

// Get all available billing cycles from recurring price data
export const getAvailableBillingCycles = (recurringPrices: RecurringPrice | null): AvailableBillingCycle[] => {
  if (!recurringPrices) return [];
  
  const cycles: BillingCycle[] = [
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "FOUR_MONTHLY",
    "SEMI_ANNUAL",
    "TRI_ANNUAL",
    "YEARLY",
    "BIENNIAL",
    "TRIENNIAL",
  ];
  
  return cycles
    .filter((cycle) => {
      // Check if this billing cycle has a price configured
      const priceKey = `${cycle.charAt(0).toLowerCase() + cycle.slice(1).replace("_", "")}Price` as keyof RecurringPrice;
      return recurringPrices[priceKey] !== undefined && recurringPrices[priceKey] !== null;
    })
    .map((cycle) => ({
      cycle,
      label: getBillingCycleLabel(cycle),
      periodLabel: getBillingCyclePeriodLabel(cycle),
      price: recurringPrices[`${cycle.charAt(0).toLowerCase() + cycle.slice(1).replace("_", "")}Price` as keyof RecurringPrice] as number | undefined,
      setupFee: recurringPrices[`${cycle.charAt(0).toLowerCase() + cycle.slice(1).replace("_", "")}SetupFee` as keyof RecurringPrice] as number | undefined,
    }));
};

// Check if recurring prices are available
export const hasRecurringPrices = (recurringPrices: RecurringPrice | null): boolean => {
  if (!recurringPrices) return false;
  
  const priceKeys: (keyof RecurringPrice)[] = [
    "monthlyPrice",
    "biMonthlyPrice",
    "quarterlyPrice",
    "fourMonthlyPrice",
    "semiAnnualPrice",
    "triAnnualPrice",
    "yearlyPrice",
    "biennialPrice",
    "triennialPrice",
  ];
  
  return priceKeys.some((key) => recurringPrices[key] !== undefined && recurringPrices[key] !== null);
};

// Interface for hook parameters
interface UseDynamicPricingParams {
  productType: ProductType;
  productRecurringPrices?: RecurringPrice | null;
  variantRecurringPrices?: RecurringPrice | null;
  selectedVariantId?: string | null;
  variants?: Array<{
    id: string;
    recurringPrices?: Array<{
      variantId: string;
    } & RecurringPrice>;
  }>;
}

// Interface for hook return value
interface UseDynamicPricingReturn {
  // Current recurring prices (based on product type)
  recurringPrices: RecurringPrice | null;
  // Available billing cycles derived from stored data
  availableBillingCycles: AvailableBillingCycle[];
  // Whether pricing is available
  isPricingAvailable: boolean;
  // Get price for a specific billing cycle
  getPriceForCycle: (cycle: BillingCycle) => number | undefined;
  // Get setup fee for a specific billing cycle
  getSetupFeeForCycle: (cycle: BillingCycle) => number;
  // Check if variant has its own recurring prices
  variantHasOwnPricing: boolean;
}

// Hook for dynamic recurring pricing
export function useDynamicPricing({
  productType,
  productRecurringPrices,
  variantRecurringPrices,
  selectedVariantId,
  variants,
}: UseDynamicPricingParams): UseDynamicPricingReturn {
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(selectedVariantId || null);

  // Update current variant when prop changes
  useEffect(() => {
    if (selectedVariantId) {
      setCurrentVariantId(selectedVariantId);
    }
  }, [selectedVariantId]);

  // Determine which recurring prices to use based on product type
  const recurringPrices = useMemo((): RecurringPrice | null => {
    // For standalone products, use product-level recurring prices
    if (productType === "STANDALONE") {
      return productRecurringPrices || null;
    }
    
    // For variable/configurable products, prefer variant-specific pricing
    if (productType === "CONFIGURABLE" && variantRecurringPrices) {
      return variantRecurringPrices;
    }
    
    // Fall back to product-level pricing if variant doesn't have its own
    return variantRecurringPrices || productRecurringPrices || null;
  }, [productType, productRecurringPrices, variantRecurringPrices]);

  // Check if variant has its own recurring pricing
  const variantHasOwnPricing = useMemo((): boolean => {
    if (productType === "STANDALONE") return false;
    if (!selectedVariantId) return false;
    
    // Check if the selected variant has recurring prices configured
    const variant = variants?.find((v) => v.id === selectedVariantId);
    return !!(variant?.recurringPrices && variant.recurringPrices.length > 0);
  }, [productType, selectedVariantId, variants]);

  // Get available billing cycles from stored recurring pricing data
  const availableBillingCycles = useMemo((): AvailableBillingCycle[] => {
    return getAvailableBillingCycles(recurringPrices);
  }, [recurringPrices]);

  // Check if pricing is available
  const isPricingAvailable = useMemo((): boolean => {
    return hasRecurringPrices(recurringPrices);
  }, [recurringPrices]);

  // Get price for a specific billing cycle
  const getPriceForCycle = useCallback((cycle: BillingCycle): number | undefined => {
    if (!recurringPrices) return undefined;
    
    const key = `${cycle.charAt(0).toLowerCase() + cycle.slice(1).replace("_", "")}Price` as keyof RecurringPrice;
    const price = recurringPrices[key];
    return typeof price === "number" ? price : undefined;
  }, [recurringPrices]);

  // Get setup fee for a specific billing cycle
  const getSetupFeeForCycle = useCallback((cycle: BillingCycle): number => {
    if (!recurringPrices) return 0;
    
    const key = `${cycle.charAt(0).toLowerCase() + cycle.slice(1).replace("_", "")}SetupFee` as keyof RecurringPrice;
    const fee = recurringPrices[key];
    return typeof fee === "number" ? fee : 0;
  }, [recurringPrices]);

  return {
    recurringPrices,
    availableBillingCycles,
    isPricingAvailable,
    getPriceForCycle,
    getSetupFeeForCycle,
    variantHasOwnPricing,
  };
}

// Helper function to fetch recurring prices for a product
export async function fetchProductRecurringPrices(
  productId: string,
  variantId?: string
): Promise<RecurringPrice | null> {
  try {
    const params = new URLSearchParams({ productId });
    if (variantId) {
      params.append("variantId", variantId);
    }
    
    const response = await fetch(`/api/recurring-prices?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch recurring prices");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recurring prices:", error);
    return null;
  }
}

// Billing cycle display configuration
export const BILLING_CYCLE_CONFIG: Record<BillingCycle, { label: string; period: string; months: number }> = {
  MONTHLY: { label: "Monthly", period: "/month", months: 1 },
  BIMONTHLY: { label: "Bi-Monthly", period: "/2 months", months: 2 },
  QUARTERLY: { label: "Quarterly", period: "/quarter", months: 3 },
  FOUR_MONTHLY: { label: "Four-Monthly", period: "/4 months", months: 4 },
  SEMI_ANNUAL: { label: "Semi-Annual", period: "/6 months", months: 6 },
  TRI_ANNUAL: { label: "Tri-Annual", period: "/3 months", months: 3 },
  YEARLY: { label: "Yearly", period: "/year", months: 12 },
  BIENNIAL: { label: "Biennial", period: "/2 years", months: 24 },
  TRIENNIAL: { label: "Triennial", period: "/3 years", months: 36 },
};
