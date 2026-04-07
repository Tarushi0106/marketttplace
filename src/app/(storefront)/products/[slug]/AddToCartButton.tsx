"use client";

import { useState, useMemo, useCallback } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import {
  useDynamicPricing,
  type BillingCycle,
  type RecurringPrice,
} from "@/hooks/useDynamicPricing";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AddToCartButtonProps {
  product: any;
}

// Helper function to extract recurring prices from product or variant data
function extractRecurringPrices(data: any): RecurringPrice | null {
  if (!data) return null;
  
  return {
    monthlyPrice: data.monthlyPrice,
    biMonthlyPrice: data.biMonthlyPrice,
    quarterlyPrice: data.quarterlyPrice,
    fourMonthlyPrice: data.fourMonthlyPrice,
    semiAnnualPrice: data.semiAnnualPrice,
    triAnnualPrice: data.triAnnualPrice,
    yearlyPrice: data.yearlyPrice,
    biennialPrice: data.biennialPrice,
    triennialPrice: data.triennialPrice,
    monthlySetupFee: data.monthlySetupFee,
    biMonthlySetupFee: data.biMonthlySetupFee,
    quarterlySetupFee: data.quarterlySetupFee,
    fourMonthlySetupFee: data.fourMonthlySetupFee,
    semiAnnualSetupFee: data.semiAnnualSetupFee,
    triAnnualSetupFee: data.triAnnualSetupFee,
    yearlySetupFee: data.yearlySetupFee,
    biennialSetupFee: data.biennialSetupFee,
    triennialSetupFee: data.triennialSetupFee,
    // One-time setup fee
    oneTimeSetupFee: data.oneTimeSetupFee,
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  // State for selections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.variants?.find((v: any) => v.isDefault)?.id || product.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.configs?.forEach((config: any) => {
      if (config.defaultValue) {
        defaults[config.id] = config.defaultValue;
      }
    });
    return defaults;
  });
  // Default billing cycle - prefer ONE_TIME if available, otherwise MONTHLY
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rp = variant?.recurringPrices?.find((r: any) => !r.variantId);
    if (rp && (rp as any).oneTimeSetupFee !== undefined) {
      return "ONE_TIME" as BillingCycle;
    }
    return "MONTHLY" as BillingCycle;
  });

  // Check if product is standalone (no variants or explicitly standalone product type)
  const isStandalone = product.productType === "STANDALONE" && (!product.variants || product.variants.length === 0);

  // Get selected variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);

  // Get billing type from selected variant (default to RECURRING if not specified)
  // Also check product-level isRecurring setting - if false, treat as ONE_TIME
  // Check both the new billingType field from API and the old attributes.billingType
  const billingType = product.isRecurring === false 
    ? "ONE_TIME" 
    : (selectedVariant?.billingType === 'one_time' ? "ONE_TIME" : 
       selectedVariant?.billingType === 'recurring' ? "RECURRING" :
       ((selectedVariant?.attributes as any)?.billingType || "RECURRING"));
  
  // Get setup fee from selected variant for ONE_TIME billing
  const oneTimeSetupFee = (selectedVariant?.attributes as any)?.setupFee 
    ? Number((selectedVariant?.attributes as any)?.setupFee) 
    : Number(selectedVariant?.price) || 0;

  // Extract recurring prices from product level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productRecurringPrices = useMemo(() => {
    // First try: Use recurringPricesObj (the transformed object format from API)
    if (product.recurringPricesObj) {
      const obj = product.recurringPricesObj;
      return {
        monthlyPrice: obj.monthly,
        biMonthlyPrice: obj.biMonthly,
        quarterlyPrice: obj.quarterly,
        fourMonthlyPrice: obj.fourMonthly,
        semiAnnualPrice: obj.semiAnnual,
        triAnnualPrice: obj.triAnnual,
        yearlyPrice: obj.yearly,
        biennialPrice: obj.biennial,
        triennialPrice: obj.triennial,
        monthlySetupFee: obj.monthlySetupFee,
        biMonthlySetupFee: obj.biMonthlySetupFee,
        quarterlySetupFee: obj.quarterlySetupFee,
        fourMonthlySetupFee: obj.fourMonthlySetupFee,
        semiAnnualSetupFee: obj.semiAnnualSetupFee,
        triAnnualSetupFee: obj.triAnnualSetupFee,
        yearlySetupFee: obj.yearlySetupFee,
        biennialSetupFee: obj.biennialSetupFee,
        triennialSetupFee: obj.triennialSetupFee,
      };
    }
    // Fallback: Use array format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rp = product.recurringPrices?.find((rp: any) => !rp.variantId);
    return extractRecurringPrices(rp);
  }, [product.recurringPrices, product.recurringPricesObj]);

  // Extract recurring prices from selected variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantRecurringPrices = useMemo(() => {
    if (!selectedVariant) return null;
    
    // First try: Use recurringPricesObj (the transformed object format from API)
    if (selectedVariant.recurringPricesObj) {
      const obj = selectedVariant.recurringPricesObj;
      return {
        monthlyPrice: obj.monthly,
        biMonthlyPrice: obj.biMonthly,
        quarterlyPrice: obj.quarterly,
        fourMonthlyPrice: obj.fourMonthly,
        semiAnnualPrice: obj.semiAnnual,
        triAnnualPrice: obj.triAnnual,
        yearlyPrice: obj.yearly,
        biennialPrice: obj.biennial,
        triennialPrice: obj.triennial,
        monthlySetupFee: obj.monthlySetupFee,
        biMonthlySetupFee: obj.biMonthlySetupFee,
        quarterlySetupFee: obj.quarterlySetupFee,
        fourMonthlySetupFee: obj.fourMonthlySetupFee,
        semiAnnualSetupFee: obj.semiAnnualSetupFee,
        triAnnualSetupFee: obj.triAnnualSetupFee,
        yearlySetupFee: obj.yearlySetupFee,
        biennialSetupFee: obj.biennialSetupFee,
        triennialSetupFee: obj.triennialSetupFee,
      };
    }
    
    // Fallback: Use array format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rp = selectedVariant.recurringPrices?.find((rp: any) => rp.variantId === selectedVariant.id);
    return extractRecurringPrices(rp);
  }, [selectedVariant]);

  // Check if product is variable type (requires variant selection)
  const isVariable = product.productType === "VARIABLE" || product.productType === "CONFIGURABLE";

  // For VARIABLE products: base price comes ONLY from selected variant
  // For STANDALONE products: base price comes from product level
  const baseVariantPrice = useMemo(() => {
    if (isVariable && selectedVariant) {
      return Number(selectedVariant.price) || 0;
    }
    // For standalone, fall back to product base price
    return Number(product.basePrice) || 0;
  }, [isVariable, selectedVariant, product.basePrice]);

  // Use the dynamic pricing hook
  const {
    recurringPrices,
    availableBillingCycles,
    isPricingAvailable,
    getPriceForCycle,
    getSetupFeeForCycle,
  } = useDynamicPricing({
    productType: product.productType as "STANDALONE" | "WITH_ADDONS" | "CONFIGURABLE" | "BUNDLE",
    productRecurringPrices,
    variantRecurringPrices,
    selectedVariantId,
    variants: product.variants,
  });

  // Get recurring price for selected billing cycle (future charge only)
  const recurringPrice = useMemo((): number => {
    if (!isPricingAvailable) return 0;
    return getPriceForCycle(billingCycle) || 0;
  }, [isPricingAvailable, getPriceForCycle, billingCycle]);

  // Get setup fee (one-time charge)
  const setupFee = useMemo((): number => {
    return getSetupFeeForCycle(billingCycle);
  }, [getSetupFeeForCycle, billingCycle]);

  // Calculate one-time total (due today)
  // Formula: variant.basePrice + configurationTotal + setupFee (NO recurring price)
  // For ONE_TIME billing type: total = setupFee + configs + addons (no recurring)
  const oneTimeTotal = useMemo(() => {
    let total = 0;

    // For ONE_TIME billing, use the setupFee as the base price
    // For RECURRING billing, use the variant base price
    if (billingType === "ONE_TIME") {
      total = oneTimeSetupFee; // Start with the one-time setup fee
    } else {
      total = baseVariantPrice; // Start with the variant base price
    }

    // Add addon prices (one-time)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.addons?.forEach((addon: any) => {
      if (selectedAddons[addon.id]) {
        total += Number(addon.price) || 0;
      }
    });

    // Add config price modifiers (one-time)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.configs?.forEach((config: any) => {
      const selectedValue = selectedConfigs[config.id];
      if (selectedValue && Array.isArray(config.options)) {
        const options = config.options as Array<{ value: string; label: string; priceModifier?: number }>;
        const option = options.find((o) => o.value === selectedValue);
        if (option?.priceModifier) {
          total += option.priceModifier;
        }
      }
    });

    // For RECURRING billing type, add setup fee
    if (billingType === "RECURRING") {
      total += Number(setupFee);
    }

    return total * quantity;
  }, [baseVariantPrice, setupFee, selectedAddons, selectedConfigs, quantity, product, billingType, oneTimeSetupFee]);

  // recurringTotal is the future recurring charge (separate from one-time)
  const recurringTotal = recurringPrice * quantity;

  const handleAddToCart = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addons = product.addons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter((addon: any) => selectedAddons[addon.id])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((addon: any) => ({ addon, quantity: 1 }))
      .filter((item: { addon: any; quantity: number }) => item.addon !== undefined) || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configs = product.configs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter((config: any) => selectedConfigs[config.id])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((config: any) => {
        const options = (Array.isArray(config.options) ? config.options : []) as Array<{ value: string; label: string; priceModifier?: number; monthlyPriceModifier?: number }>;
        const option = options.find((o) => o.value === selectedConfigs[config.id]);
        // For NUMBER/SLIDER inputs, use monthlyPriceModifier; for others use priceModifier
        const priceModifier = Number(option?.monthlyPriceModifier || option?.priceModifier) || 0;
        // Use displayName or first option's label for NUMBER/SLIDER, otherwise use config name
        const configName = config.displayName || config.name;
        return {
          configId: config.id,
          configName: configName,
          value: option?.label || selectedConfigs[config.id],
          price: priceModifier, // Store price for display
          priceModifier: priceModifier,
        };
      }) || [];

    addItem({
      product: product as unknown as import("@/types").Product,
      variant: selectedVariant as unknown as import("@/types").ProductVariant | undefined,
      quantity,
      selectedAddons: addons as unknown as Array<{ addon: import("@/types").ProductAddon; quantity: number }>,
      selectedConfigs: configs as { configId: string; configName: string; value: string; priceModifier: number }[],
      unitPrice: billingType === "ONE_TIME" ? oneTimeTotal : recurringPrice, // For ONE_TIME, use oneTimeTotal; for RECURRING, use recurring price
      productPrice: oneTimeTotal, // One-time total (due today)
      billingCycle: billingType === "ONE_TIME" ? "ONE_TIME" : billingCycle as import("@/types").BillingCycle,
      isRecurring: billingType === "RECURRING" && isPricingAvailable && billingCycle !== "ONE_TIME",
      recurringData: billingType === "RECURRING" && isPricingAvailable ? {
        enabled: billingCycle !== "ONE_TIME",
        billingCycle: billingCycle as "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL",
        setupFee: Number(setupFee),
        pricePerCycle: Number(recurringPrice),
        baseProductPrice: Number(baseVariantPrice), // One-time product price from variant
        totalForPeriod: Number(oneTimeTotal),
        savingsPercentage: 0,
        monthlyEquivalent: Number(recurringPrice),
      } : undefined,
    });
  };

  // Check if there are multiple billing cycles available
  const hasMultipleBillingCycles = useMemo(() => {
    return availableBillingCycles.length > 1;
  }, [availableBillingCycles]);

  // Helper to get price for display
  const getDisplayPrice = (price: number | undefined): string => {
    if (price === undefined || price === null) return "Unavailable";
    return formatPrice(price);
  };

  return (
    <div className="space-y-6">
      {/* Billing Cycle Selection (for recurring products only) - Vertical Style */}
      {hasMultipleBillingCycles && billingType === "RECURRING" && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Billing Cycle</Label>
          <div className="space-y-2">
            {availableBillingCycles.slice(0, 8).map((cycle) => (
              <div
                key={cycle.cycle}
                onClick={() => setBillingCycle(cycle.cycle)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gray-400",
                  billingCycle === cycle.cycle
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    billingCycle === cycle.cycle
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  )}>
                    {billingCycle === cycle.cycle && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-base">{cycle.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">
                    {getDisplayPrice(cycle.price)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {cycle.cycle === 'MONTHLY' ? '/mo' : 
                     cycle.cycle === 'QUARTERLY' ? '/quarter' : 
                     cycle.cycle === 'YEARLY' ? '/year' : 
                     cycle.cycle === 'BIENNIAL' ? '/2 years' : 
                     cycle.cycle === 'TRIENNIAL' ? '/3 years' : '/cycle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONE_TIME billing info */}
      {billingType === "ONE_TIME" && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700">
            <span className="font-medium">One-time payment</span> - No recurring charges. You pay only once for this product.
          </p>
        </div>
      )}

      {/* Variants Selection */}
      {product.variants && product.variants.length > 0 && isVariable && (
        <div>
          <Label className="text-sm font-medium">Select Plan</Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {product.variants.map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedVariantId(variant.id);
                  // Reset billing cycle when variant changes
                  setBillingCycle("MONTHLY");
                }}
                className={cn(
                  "relative rounded-lg border-2 p-4 text-left transition-all",
                  selectedVariantId === variant.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                {selectedVariantId === variant.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="font-medium">{variant.name}</div>
                {variant.attributes && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {Object.entries(variant.attributes)
                      .filter(([key]) => key !== "tier")
                      .map(([key, value]) => `${value}`)
                      .join(" / ")}
                  </div>
                )}
                <div className="mt-2 font-semibold">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {getDisplayPrice(getPriceForCycle(billingCycle) || variant.price)}
                  {isPricingAvailable && (billingCycle === 'MONTHLY' ? '/mo' : 
                    billingCycle === 'QUARTERLY' ? '/quarter' : 
                    billingCycle === 'YEARLY' ? '/year' : 
                    billingCycle === 'BIENNIAL' ? '/2 years' : 
                    billingCycle === 'TRIENNIAL' ? '/3 years' : '/cycle')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Options */}
      {product.configs && product.configs.length > 0 && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {product.configs.map((config: any) => (
            <div key={config.id}>
              <Label className="text-sm font-medium">
                {config.name}
                {config.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Select
                value={selectedConfigs[config.id]}
                onValueChange={(value) =>
                  setSelectedConfigs((prev) => ({ ...prev, [config.id]: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={`Select ${config.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(config.options) ? config.options as Array<{ value: string; label: string; priceModifier?: number }> : []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {option.priceModifier && option.priceModifier > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            +{formatPrice(option.priceModifier)}/mo
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Add-ons */}
      {product.addons && product.addons.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Add-ons (Optional)</Label>
          <div className="mt-2 space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {product.addons.map((addon: any) => (
              <label
                key={addon.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all",
                  selectedAddons[addon.id]
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Checkbox
                  checked={selectedAddons[addon.id] || false}
                  onCheckedChange={(checked) =>
                    setSelectedAddons((prev) => ({ ...prev, [addon.id]: !!checked }))
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium">{addon.name}</div>
                  {addon.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {addon.description}
                    </p>
                  )}
                </div>
                <div className="text-sm font-medium">
                  +{formatPrice(Number(addon.price))}
                  {addon.pricingType === "RECURRING_MONTHLY" && "/mo"}
                  {addon.pricingType === "RECURRING_YEARLY" && "/yr"}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <Label className="text-sm font-medium">Quantity</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total and Add to Cart */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <div className="text-sm text-muted-foreground">
            {billingType === "ONE_TIME" ? "Total" : "Due Today"}
          </div>
          <div className="text-2xl font-bold">
            {baseVariantPrice > 0 ? formatPrice(oneTimeTotal) : "Contact for Pricing"}
          </div>
          {billingType === "RECURRING" && recurringTotal > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              + {formatPrice(recurringTotal)}{
                billingCycle === 'MONTHLY' ? '/mo' : 
                billingCycle === 'QUARTERLY' ? '/quarter' : 
                billingCycle === 'YEARLY' ? '/year' : 
                billingCycle === 'BIENNIAL' ? '/2 years' : 
                billingCycle === 'TRIENNIAL' ? '/3 years' : '/cycle'
              } recurring
            </div>
          )}
        </div>
        <Button 
          size="lg" 
          onClick={handleAddToCart}
          disabled={!isVariable && baseVariantPrice <= 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {baseVariantPrice > 0 ? "Add to Cart" : "Contact for Pricing"}
        </Button>
      </div>
    </div>
  );
}
