"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product, ProductAddon as ProductAddonType } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  CreditCard, 
  Info, 
  Check, 
  AlertCircle,
  Calculator,
  RefreshCw,
  Heart,
  Plus,
  Server,
  Globe,
  Cpu,
  HardDrive,
  Users,
  Zap,
  Settings,
  Trash2,
  Copy
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { RecurringBillingSection, type RecurringData, type BillingCycleType, BILLING_CYCLE_LABELS } from "./RecurringBillingSection";
import {
  useDynamicPricing,
  type BillingCycle,
  type RecurringPrice,
} from "@/hooks/useDynamicPricing";

// Billing cycle periods (copied from RecurringBillingSection)
const BILLING_CYCLE_PERIODS: Record<string, string> = {
  MONTHLY: "/month",
  BIMONTHLY: "/2 months",
  QUARTERLY: "/quarter",
  FOUR_MONTHLY: "/4 months",
  SEMI_ANNUAL: "/6 months",
  TRI_ANNUAL: "/4 months",
  YEARLY: "/year",
  BIENNIAL: "/2 years",
  TRIENNIAL: "/3 years",
};

// Types for configuration
interface ConfigOption {
  id: string;
  value: string;
  label: string;
  description?: string;
  priceModifier?: number;
  monthlyPriceModifier?: number;
  yearlyPriceModifier?: number;
  isPercentage?: boolean;
  modifierType?: "ADD" | "MULTIPLY" | "REPLACE";
  isAvailable?: boolean;
  stockStatus?: string | null;
}

interface ProductConfig {
  id: string;
  configType?: string;
  name: string;
  displayName?: string;
  description?: string;
  unit?: string;
  unitPlural?: string;
  icon?: string;
  pricingModel?: "FIXED" | "PER_UNIT" | "TIERED" | "VOLUME";
  basePrice?: number;
  pricePerUnit?: number;
  currency?: string;
  billingCycle?: "ONE_TIME" | "MONTHLY" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRecurring?: boolean;
  inputType?: "SELECT" | "RADIO" | "CHECKBOX" | "SLIDER" | "NUMBER";
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
  defaultValue?: string;
  isRequired?: boolean;
  allowCustom?: boolean;
  source?: "PRODUCT" | "TEMPLATE" | "CATEGORY";
  inheritedFromId?: string | null;
  options?: ConfigOption[];
}

interface RecurringPrices {
  // Per-billing-frequency setup fees
  monthlySetupFee?: number;
  biMonthlySetupFee?: number;
  triMonthlySetupFee?: number;
  fourMonthlySetupFee?: number;
  quarterlySetupFee?: number;
  semiAnnualSetupFee?: number;
  triAnnualSetupFee?: number;
  yearlySetupFee?: number;
  biennialSetupFee?: number;
  triennialSetupFee?: number;
  // Per-billing-frequency prices
  monthlyPrice?: number;
  biMonthlyPrice?: number;
  triMonthlyPrice?: number;
  fourMonthlyPrice?: number;
  quarterlyPrice?: number;
  semiAnnualPrice?: number;
  triAnnualPrice?: number;
  yearlyPrice?: number;
  biennialPrice?: number;
  triennialPrice?: number;
  monthlySavings?: number;
  quarterlySavings?: number;
  yearlySavings?: number;
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
  };
}

interface AddonWithSource {
  id: string;
  name: string;
  description?: string;
  price?: number;
  pricePerUnit?: number;
  unit?: string;
  pricingType?: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRequired?: boolean;
  isSelectedByDefault?: boolean;
  maxQuantity?: number | null;
  addonGroup?: string | null;
  source: 'product' | 'category';
  uniqueId: string;
}

interface ProductConfiguratorProps {
  product: {
    id: string;
    name: string;
    basePrice: number;
    productType: string;
    images: any[];
    isRecurring?: boolean;
  };
  selectedVariantId?: string | null;
  variants?: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    attributes?: Record<string, string>;
    isDefault?: boolean;
    recurringPrices?: any[];
    billingType?: "ONE_TIME" | "RECURRING";
    setupFee?: number;
  }[];
  configs?: ProductConfig[];
  inheritedConfigs?: ProductConfig[];
  productAddons?: AddonWithSource[];
  categoryAddons?: AddonWithSource[];
  recurringPrices?: RecurringPrices | null;
  onAddToCart?: (config: any) => void;
}

// Interface for a single configuration instance
interface ConfigInstance {
  id: string;
  instanceNumber: number;
  configs: Record<string, any>;
  quantity: number;
}

// Interface for a single configuration instance with addons
interface ConfigInstanceWithAddons {
  id: string;
  instanceNumber: number;
  name: string;
  configs: Record<string, any>;
  quantity: number;
  addons: Record<string, { quantity: number; selected: boolean; source: string }>;
}

const BILLING_CYCLE_MULTIPLIERS = {
  ONE_TIME: 1,
  MONTHLY: 1,
  YEARLY: 12,
  BIENNIAL: 24,
  TRIENNIAL: 36,
};

export function ProductConfigurator({
  product,
  selectedVariantId = null,
  variants = [],
  configs = [],
  inheritedConfigs = [],
  productAddons = [],
  categoryAddons = [],
  recurringPrices = null,
  onAddToCart,
}: ProductConfiguratorProps) {
  // Combine both addon types for display with unique IDs
  const allAddons = [
    ...productAddons.map(a => ({ ...a, source: 'product' as const, uniqueId: `product-${a.id}` })),
    ...categoryAddons.map(a => ({ ...a, source: 'category' as const, uniqueId: `category-${a.id}` }))
  ];

  // State for multiple configuration instances
  const [configInstances, setConfigInstances] = useState<ConfigInstanceWithAddons[]>([
    {
      id: `instance-1`,
      instanceNumber: 1,
      name: "Configuration 1",
      configs: {},
      quantity: 1,
      addons: {},
    }
  ]);
  
  const [billingCycle, setBillingCycle] = useState<string>("MONTHLY");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Variant selection state - use selectedVariantId prop, default variant, or first variant
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    selectedVariantId || variants.find(v => v.isDefault)?.id || variants[0]?.id || null
  );

  // Sync selectedVariant state with selectedVariantId prop when it changes
  useEffect(() => {
    if (selectedVariantId) {
      setSelectedVariant(selectedVariantId);
    }
  }, [selectedVariantId]);

  // Handle variant selection - update URL
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
    // Update URL with new variant
    const params = new URLSearchParams(searchParams.toString());
    params.set('variant', variantId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Recurring billing state
  const [recurringData, setRecurringData] = useState<RecurringData | null>(null);

  // Sync billingCycle from recurringData when it changes
  useEffect(() => {
    if (!recurringData?.billingCycle) return;
    setBillingCycle(recurringData.billingCycle);
  }, [recurringData, billingCycle]);

  // Callback for receiving recurring data from child
  const handleRecurringChange = useCallback((data: RecurringData) => {
    console.log(`[ProductConfigurator] Received recurring data:`, data);
    setRecurringData(data);
  }, []);

  // Extract recurring prices from product level
  const productRecurringPrices = useMemo(() => {
    return extractRecurringPrices(recurringPrices);
  }, [recurringPrices]);

  // Get selected variant
  const currentVariant = variants.find(v => v.id === selectedVariant);

  // Get billing type from selected variant (check both direct property and attributes)
  // Priority: variant billingType > product isRecurring > default RECURRING
  // If variant has a billingType set, use that
  // Otherwise, check product-level isRecurring setting
  // Default to RECURRING if not specified
  console.log("[ProductConfigurator] Billing type calculation:", {
    productIsRecurring: product.isRecurring,
    productIsRecurringType: typeof product.isRecurring,
    variantBillingType: currentVariant?.billingType,
    attributesBillingType: (currentVariant?.attributes as any)?.billingType,
  });
  
  // First check if variant has billingType set (from attributes or direct property)
  const variantBillingType = currentVariant?.billingType || 
    (currentVariant?.attributes as any)?.billingType;
  
  // If variant has billingType, use it; otherwise fall back to product-level setting
  const billingType = variantBillingType 
    ? variantBillingType 
    : (product.isRecurring === false ? "ONE_TIME" : "RECURRING");
    
  console.log("[ProductConfigurator] Final billingType:", billingType);

  // Extract recurring prices from selected variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantRecurringPrices = useMemo(() => {
    console.log("[ProductConfigurator] Current variant:", currentVariant);
    console.log("[ProductConfigurator] Variant recurringPricesObj:", currentVariant?.recurringPricesObj);
    console.log("[ProductConfigurator] Variant recurringPrices (array):", currentVariant?.recurringPrices);
    if (!currentVariant) return null;
    
    // First try: Use recurringPricesObj (the transformed object format from API)
    if (currentVariant.recurringPricesObj) {
      const obj = currentVariant.recurringPricesObj;
      const extracted = {
        monthlyPrice: obj.monthly,
        biMonthlyPrice: obj.biMonthly || obj.biMonthlyPrice,
        quarterlyPrice: obj.quarterly,
        fourMonthlyPrice: obj.fourMonthly || obj.fourMonthlyPrice,
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
      console.log("[ProductConfigurator] Extracted from recurringPricesObj:", extracted);
      return extracted;
    }
    
    // Fallback: Use the array format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rp = currentVariant.recurringPrices?.find((rp: any) => rp.variantId === currentVariant.id);
    console.log("[ProductConfigurator] Found recurring price (array):", rp);
    const extracted = extractRecurringPrices(rp);
    console.log("[ProductConfigurator] Extracted recurring prices (array):", extracted);
    return extracted;
  }, [currentVariant]);

  // Use the dynamic pricing hook
  const {
    recurringPrices: dynamicRecurringPrices,
    availableBillingCycles,
    isPricingAvailable,
    getPriceForCycle,
    getSetupFeeForCycle,
  } = useDynamicPricing({
    productType: product.productType as "STANDALONE" | "WITH_ADDONS" | "CONFIGURABLE" | "BUNDLE",
    productRecurringPrices,
    variantRecurringPrices,
    selectedVariantId: selectedVariant,
    variants: variants,
  });

  // Initialize selections from config defaults (only once on mount)
  useEffect(() => {
    const initialConfigs: Record<string, any> = {};
    const initialAddons: Record<string, { quantity: number; selected: boolean; source: string }> = {};

    configs.forEach((config) => {
      if (config.defaultValue) {
        initialConfigs[config.id] = config.defaultValue;
      }
    });

    allAddons.forEach((addon) => {
      initialAddons[addon.uniqueId] = {
        quantity: addon.isSelectedByDefault ? 1 : 0,
        selected: addon.isSelectedByDefault || false,
        source: addon.source,
      };
    });

    // Update the first instance with initial values
    setConfigInstances(prev => prev.map((instance, index) => 
      index === 0 
        ? { ...instance, configs: initialConfigs, addons: initialAddons }
        : instance
    ));
  }, []); // Empty deps array - run only once on mount

  // Get all configs (product + inherited)
  // All configs grouped together under "Configurations" section
  const allConfigs = configs;

  // Debug log configs
  useEffect(() => {
    console.log("[Config Debug] All configs:", allConfigs.map(c => ({
      id: c.id,
      name: c.name,
      inputType: c.inputType,
      optionsCount: c.options?.length || 0,
      options: c.options?.map(o => ({ 
        id: o.id,
        value: o.value, 
        label: o.label,
        hasValue: !!o.value,
        valueTrimmed: o.value?.trim(),
        valueLength: o.value?.length
      }))
    })));
  }, [configs]);
  
  // Get selected configs from the first instance
  const selectedConfigs = configInstances[0]?.configs || {};
  
  // Helper to get selected value from config storage
  const getSelectedValue = (configId: string) => {
    const config = selectedConfigs[configId];
    if (typeof config === 'object' && config !== null) {
      return (config as { value?: string }).value || "";
    }
    return config as string || "";
  };
  
  // Helper to get quantity from config storage
  const getConfigQuantity = (configId: string) => {
    const config = selectedConfigs[configId];
    if (typeof config === 'object' && config !== null) {
      return (config as { quantity?: number }).quantity || 1;
    }
    return 1;
  };
  
  // Get selected addons from the first instance
  const selectedAddons = configInstances[0]?.addons || {};
  
  // Get selected variant (use existing variable from above)
  const selectedVariantData = currentVariant;
  
  // Get variant recurring prices - use dynamic recurring prices if available
  const effectiveRecurringPrices = dynamicRecurringPrices || recurringPrices || null;
  
  // Check if pricing is unavailable
  const isPricingUnavailable = !isPricingAvailable && !selectedVariantData?.price;
  
  // Calculate total price for all instances
  const pricing = useMemo(() => {
    // Base price from variant or product (use selectedVariantData from outer scope)
    const basePrice = selectedVariantData ? Number(selectedVariantData.price) : Number(product.basePrice) || 0;

    // Calculate addons total
    let addonsTotal = 0;
    const addonBreakdown: any[] = [];

    allAddons.forEach((addon) => {
      const state = selectedAddons[addon.uniqueId];
      if (state?.selected && state.quantity >= 1) {
        const total = (Number(addon.price) || 0) * state.quantity;
        addonsTotal += total;
        addonBreakdown.push({
          name: addon.name,
          quantity: state.quantity,
          price: total,
          source: addon.source,
        });
      }
    });

    // Calculate config options total
    let configsTotal = 0;
    const configBreakdown: any[] = [];

    configs.forEach((config) => {
      const configData = selectedConfigs[config.id];
      
      // Handle NUMBER and SLIDER input types - they use pricePerUnit, not options
      if (config.inputType === 'NUMBER' || config.inputType === 'SLIDER') {
        const numericValue = Number(getSelectedValue(config.id)) || 0;
        
        // For NUMBER/SLIDER, check if there's an option with price (use as pricePerUnit)
        // The option's label becomes the displayName, and price becomes pricePerUnit
        const firstOption = config.options?.[0];
        // Priority: first option's monthlyPriceModifier > pricePerUnit > first option's priceModifier
        const effectivePricePerUnit = Number(firstOption?.monthlyPriceModifier) || 
          Number(config.pricePerUnit) || 
          Number(firstOption?.priceModifier) || 0;
        // Use label from first option as displayName (admin sets this in variable tab)
        const effectiveDisplayName = firstOption?.label || config.displayName || config.name;
        const basePrice = Number(config.basePrice) || 0;
        
        // Calculate price: basePrice + (quantity * pricePerUnit)
        const configPrice = basePrice + (numericValue * effectivePricePerUnit);
        
        if (configPrice > 0 || numericValue > 0) {
          configsTotal += configPrice;
          configBreakdown.push({
            name: effectiveDisplayName,
            value: `${numericValue} ${config.unit || ''}`.trim(),
            price: configPrice,
            quantity: numericValue,
            unit: config.unit,
            pricePerUnit: effectivePricePerUnit,
          });
        }
        return;
      }
      
      // Support both array (multi-select checkboxes) and single value
      let values: string[] = [];
      if (Array.isArray(configData)) {
        values = configData;
      } else if (typeof configData === 'string' && configData) {
        values = [configData];
      } else if (typeof configData === 'object' && configData !== null) {
        // Handle object format { value: string }
        const value = (configData as { value?: string }).value;
        if (value) values = [value];
      }
      
      // For checkbox type, each selected option has its own price
      if (config.inputType === 'CHECKBOX') {
        values.forEach((value) => {
          const option = config.options?.find((opt) => opt.value === value);
          if (option) {
            // Use the appropriate price modifier based on billing cycle
            const priceModifier = billingCycle === 'YEARLY'
              ? Number(option.yearlyPriceModifier || 0)
              : Number(option.monthlyPriceModifier || option.priceModifier || 0);
            configsTotal += priceModifier;
            configBreakdown.push({
              name: config.displayName || config.name,
              value: option.label || value,
              price: priceModifier,
              quantity: 1,
            });
          }
        });
      } else {
        // For single-select types (RADIO, SELECT, etc.)
        const value = values[0] || '';
        if (!value) return;

        const option = config.options?.find((opt) => opt.value === value);
        const configQuantity = typeof configData === 'object' && configData !== null
          ? (configData as { quantity?: number }).quantity || 1
          : 1;

        if (option) {
          // Use the appropriate price modifier based on billing cycle
          const priceModifier = billingCycle === 'YEARLY'
            ? Number(option.yearlyPriceModifier || 0)
            : Number(option.monthlyPriceModifier || option.priceModifier || 0);
          const configPrice = priceModifier * configQuantity;
          configsTotal += configPrice;
          configBreakdown.push({
            name: config.displayName || config.name,
            value: option.label || value,
            price: configPrice,
            quantity: configQuantity,
          });
        }
      }
    });

    // Subtotal is base + addons + configs
    const subtotal = basePrice + addonsTotal + configsTotal;

    // Use recurringData as single source of truth for billing prices
    // If recurringData is available, use its values
    // Otherwise, calculate from basePrice (for products without recurring prices configured)
    let pricePerCycle: number;
    let setupFee: number;
    let savingsPercentage: number;
    let monthlyEquivalent: number;
    let totalForPeriod: number;

    // For ONE_TIME billing type, there's no recurring price - just one-time setup fee
    if (billingType === "ONE_TIME") {
      // For ONE_TIME products: total = productPrice + setupFee + configs + addons
      // The productPrice is the variant price, setupFee is a separate one-time fee
      const variantAttributes = currentVariant?.attributes as any;
      const productPrice = Number(currentVariant?.price) || Number(basePrice);
      const oneTimeSetupFee = Number(variantAttributes?.setupFee) || Number(currentVariant?.setupFee) || 0;
      
      pricePerCycle = 0; // No recurring price
      setupFee = oneTimeSetupFee;
      savingsPercentage = 0;
      monthlyEquivalent = 0;
      // Total = product price + setup fee + configs + addons
      totalForPeriod = productPrice + oneTimeSetupFee + Number(configsTotal) + Number(addonsTotal);
    } else if (recurringData) {
      pricePerCycle = Number(recurringData.pricePerCycle);
      setupFee = Number(recurringData.setupFee);
      savingsPercentage = Number(recurringData.savingsPercentage);
      monthlyEquivalent = Number(recurringData.monthlyEquivalent);
      // Total due today = setup fee + first recurring payment + addons
      totalForPeriod = Number(recurringData.setupFee) + Number(recurringData.pricePerCycle) + Number(configsTotal) + Number(addonsTotal);
    } else {
      // Fallback for products without recurring prices configured
      // Calculate billing prices based on billingCycle
      const baseSubtotal = basePrice + addonsTotal + configsTotal;

      // Calculate based on billing cycle (hardcoded discounts for fallback)
      const cycleMonths: Record<string, number> = {
        MONTHLY: 1,
        BIMONTHLY: 2,
        QUARTERLY: 3,
        FOUR_MONTHLY: 4,
        SEMI_ANNUAL: 6,
        TRI_ANNUAL: 4,
        YEARLY: 12,
        BIENNIAL: 24,
        TRIENNIAL: 36,
      };

      const months = cycleMonths[billingCycle] || 1;
      pricePerCycle = baseSubtotal;
      setupFee = 0;
      savingsPercentage = 0;
      monthlyEquivalent = baseSubtotal / months;
      totalForPeriod = baseSubtotal;
    }

    return {
      subtotal,
      basePrice,
      baseProductPrice: basePrice + configsTotal,
      addonsTotal,
      configsTotal,
      pricePerCycle,
      setupFee,
      totalForPeriod,
      savingsPercentage,
      monthlyEquivalent,
      billingCycle: billingType === "ONE_TIME" ? "ONE_TIME" : billingCycle,
      configBreakdown,
      addonBreakdown,
    };
  }, [product.basePrice, configs, allAddons, configInstances, recurringData, selectedVariantData, selectedConfigs, selectedAddons, isPricingAvailable, billingType, currentVariant]);

  // Watch for billingCycle changes and update cart immediately
  useEffect(() => {
    if (!product?.id || !recurringData?.enabled) return;

    const cartStore = useCartStore.getState();
    const items = cartStore.items;

    // Find existing cart item for this product (same ID calculation)
    const productId = product.id;
    const variantId = currentVariant || null;
    const existingItem = items.find((item: any) => {
      const itemProductId = item.product?.id;
      const itemVariantId = item.variant?.id || null;
      return itemProductId === productId && itemVariantId === variantId;
    });

    if (existingItem) {
      // Calculate correct unitPrice (only pricePerCycle for recurring)
      const newUnitPrice = pricing.pricePerCycle;
      
      // Update existing cart item with new billing cycle and pricing
      cartStore.updateItem(existingItem.id, {
        billingCycle: pricing.billingCycle as any,
        recurringData: {
          ...recurringData,
          baseProductPrice: pricing.baseProductPrice,
          setupFee: pricing.setupFee,
          pricePerCycle: newUnitPrice,
        },
        unitPrice: newUnitPrice,
        totalPrice: newUnitPrice * (existingItem.quantity || 1),
      });
      console.log(`[ProductConfigurator] Updated cart item billing cycle to: ${pricing.billingCycle}, unitPrice: ${newUnitPrice}`);
    }
  }, [pricing.billingCycle, pricing.pricePerCycle, pricing.setupFee, recurringData, product?.id, currentVariant]);

  // Handle configuration changes for a specific config
  // Supports both single value (string) and multi-select (array of strings)
  const handleConfigChange = (configId: string, value: string | string[], quantity: number = 1) => {
    // Convert array to comma-separated string for storage
    const storedValue = Array.isArray(value) ? value.join(',') : value;
    
    setConfigInstances(prev => prev.map(instance => 
      instance.id === configInstances[0]?.id
        ? { ...instance, configs: { ...instance.configs, [configId]: { value: storedValue, quantity } } }
        : instance
    ));
  };
  
  // Handle config quantity change
  const handleConfigQuantityChange = (configId: string, delta: number) => {
    const currentConfig = selectedConfigs[configId];
    let currentQuantity = 1;
    if (typeof currentConfig === 'object' && currentConfig !== null) {
      currentQuantity = (currentConfig as { quantity?: number }).quantity || 1;
    }
    const newQuantity = Math.max(1, currentQuantity + delta);
    
    // Get current value if exists
    let currentValue = "";
    if (typeof currentConfig === 'object' && currentConfig !== null) {
      currentValue = (currentConfig as { value?: string }).value || "";
    } else {
      currentValue = currentConfig as string || "";
    }
    
    setConfigInstances(prev => prev.map(instance => 
      instance.id === configInstances[0]?.id
        ? { ...instance, configs: { ...instance.configs, [configId]: { value: currentValue, quantity: newQuantity } } }
        : instance
    ));
  };

  // Handle custom value changes for a specific instance
  const handleCustomValueChange = (instanceId: string, configId: string, value: string) => {
    setCustomValues((prev) => ({
      ...prev,
      [configId]: value,
    }));

    // Also update the instance configs
    if (value) {
      setConfigInstances(prev => prev.map(instance => 
        instance.id === instanceId
          ? { ...instance, configs: { ...instance.configs, [configId]: value } }
          : instance
      ));
    }
  };

  // Handle addon selection for the first instance
  const handleAddonToggle = (uniqueId: string) => {
    setConfigInstances(prev => prev.map(instance => {
      if (instance.id !== configInstances[0]?.id) return instance;
      
      const currentAddon = instance.addons[uniqueId] || { quantity: 0, selected: false, source: '' };
      const newAddon = {
        ...currentAddon,
        selected: !currentAddon.selected,
        quantity: !currentAddon.selected ? 1 : 0,
      };
      
      return {
        ...instance,
        addons: { ...instance.addons, [uniqueId]: newAddon },
      };
    }));
  };

  // Handle addon quantity change for the first instance
  const handleAddonQuantityChange = (uniqueId: string, quantity: number) => {
    setConfigInstances(prev => prev.map(instance => {
      if (instance.id !== configInstances[0]?.id) return instance;
      
      const currentAddon = instance.addons[uniqueId] || { quantity: 0, selected: false, source: '' };
      return {
        ...instance,
        addons: {
          ...instance.addons,
          [uniqueId]: {
            ...currentAddon,
            quantity: Math.max(1, quantity),
            selected: quantity > 0,
          },
        },
      };
    }));
  };

  // Handle instance quantity change
  const handleInstanceQuantityChange = (instanceId: string, quantity: number) => {
    setConfigInstances(prev => prev.map(instance =>
      instance.id === instanceId
        ? { ...instance, quantity: Math.max(1, quantity) }
        : instance
    ));
  };

  // Add a new configuration instance
  const addConfigInstance = () => {
    const newInstanceNumber = configInstances.length + 1;
    const newInstance: ConfigInstanceWithAddons = {
      id: `instance-${newInstanceNumber}-${Date.now()}`,
      instanceNumber: newInstanceNumber,
      name: `Configuration ${newInstanceNumber}`,
      configs: {},
      quantity: 1,
      addons: {},
    };
    setConfigInstances(prev => [...prev, newInstance]);
  };

  // Remove a configuration instance
  const removeConfigInstance = (instanceId: string) => {
    if (configInstances.length <= 1) return; // Keep at least one instance
    setConfigInstances(prev => {
      const filtered = prev.filter(instance => instance.id !== instanceId);
      // Renumber remaining instances
      return filtered.map((instance, index) => ({
        ...instance,
        instanceNumber: index + 1,
        name: `Configuration ${index + 1}`,
      }));
    });
  };

  // Duplicate a configuration instance
  const duplicateConfigInstance = (instanceId: string) => {
    const sourceInstance = configInstances.find(i => i.id === instanceId);
    if (!sourceInstance) return;
    
    const newInstanceNumber = configInstances.length + 1;
    const newInstance: ConfigInstanceWithAddons = {
      ...sourceInstance,
      id: `instance-${newInstanceNumber}-${Date.now()}`,
      instanceNumber: newInstanceNumber,
      name: `Configuration ${newInstanceNumber}`,
    };
    setConfigInstances(prev => [...prev, newInstance]);
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    // Prepare all instances for cart
    const instances = configInstances.map((instance) => {
      // Prepare selected configs as array
      const selectedConfigsArray = Object.entries(instance.configs).map(([configId, configData]) => {
        // Handle new object format { value, quantity }
        const configValue = typeof configData === 'object' && configData !== null 
          ? (configData as { value?: string }).value 
          : configData as string;
        const configQuantity = typeof configData === 'object' && configData !== null 
          ? (configData as { quantity?: number }).quantity || 1 
          : 1;
        
        const config = configs.find((c) => c.id === configId);
        
        // Handle comma-separated values for multi-select checkboxes
        const configValueStr = configValue || '';
        const values = configValueStr.split(',').map(v => v.trim()).filter(v => v);
        
        // For each value, find the option and create a config entry
        const configEntries = values.map(value => {
          const option = config?.options?.find((opt) => opt.value === value);
          // Use the same price calculation logic as the main pricing
          // Handle both string and number values (API returns strings for Decimal fields)
          const monthlyPrice = Number(option?.monthlyPriceModifier ?? option?.priceModifier ?? 0);
          const yearlyPrice = Number(option?.yearlyPriceModifier ?? 0);
          const priceModifier = billingCycle === 'YEARLY'
            ? yearlyPrice
            : monthlyPrice;
          
          // For NUMBER/SLIDER inputs, use the first option's label as displayName
          const effectiveConfigName = config?.options?.[0]?.label || config?.displayName || config?.name;
          
          console.log("[AddToCart] Config price:", {
            configName: effectiveConfigName,
            value,
            option: option,
            priceModifier,
            billingCycle,
            monthlyPriceModifier: option?.monthlyPriceModifier,
            priceModifierField: option?.priceModifier
          });
          
          return {
            configId,
            configName: effectiveConfigName,
            value: value,
            quantity: configQuantity,
            optionLabel: option?.label || value,
            price: priceModifier,
            monthlyPriceModifier: monthlyPrice,
            yearlyPriceModifier: yearlyPrice,
          };
        });
        
        return configEntries;
      }).flat();

      return {
        instanceId: instance.id,
        instanceNumber: instance.instanceNumber,
        instanceName: instance.name,
        quantity: instance.quantity || 1,
        selectedConfigs: selectedConfigsArray,
        selectedAddons: Object.entries(instance.addons)
          .filter(([_, value]) => value.selected)
          .map(([uniqueId, value]) => ({
            addon: allAddons.find((a) => a.uniqueId === uniqueId),
            quantity: value.quantity,
          }))
          .filter((item): item is { addon: NonNullable<typeof item.addon>; quantity: number } => item.addon !== undefined),
      };
    });

    // Calculate the total unit price using all components
    // For recurring products: use recurringData.pricePerCycle if available, otherwise fall back to pricing
    // This ensures we use the configured recurring price (e.g., ₹200) instead of variant basePrice (e.g., ₹2,299)
    const currentRecurringData = recurringData;
    const baseRecurringPrice = currentRecurringData?.pricePerCycle ?? pricing.pricePerCycle;
    const setupFee = currentRecurringData?.setupFee ?? pricing.setupFee;
    
    // Calculate total quantity from all instances
    const totalQuantity = configInstances.reduce((sum, instance) => sum + (instance.quantity || 1), 0);
    
    // For recurring products: the recurring amount should include base price + configs (both are recurring)
    // Configs with monthlyPriceModifier are recurring charges
    // Note: pricing.configsTotal already includes quantity multiplication, so we need to divide by totalQuantity to get per-unit price
    const perUnitConfigsTotal = totalQuantity > 0 ? pricing.configsTotal / totalQuantity : pricing.configsTotal;
    const totalRecurringAmount = baseRecurringPrice + perUnitConfigsTotal;
    
    // For recurring products: productPrice should include setup fee + first recurring payment + addons
    // For one-time products: productPrice includes base + configs + addons
    const isRecurringProduct = currentRecurringData?.enabled ?? false;
    const productPriceDueToday = isRecurringProduct 
      ? setupFee + baseRecurringPrice + pricing.configsTotal + pricing.addonsTotal  // Setup fee + first recurring + addons
      : pricing.basePrice + pricing.configsTotal + pricing.addonsTotal;  // Full price for one-time

    const cartItem = {
      product,
      variant: currentVariant || undefined,
      quantity: totalQuantity,
      instances,
      unitPrice: totalRecurringAmount,
      // Store the base product price separately for display purposes
      baseProductPrice: pricing.basePrice, 
      // Store the full product price (addons for recurring, base + configs + addons for one-time)
      productPrice: productPriceDueToday,
      // Use billing cycle from recurringData if available
      billingCycle: (currentRecurringData?.billingCycle ?? pricing.billingCycle) as "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL" | undefined,
      // Recurring billing data
      isRecurring: isRecurringProduct,
      recurringAmount: totalRecurringAmount, // The recurring amount per cycle (base + configs)
      recurringData: currentRecurringData ? {
        ...currentRecurringData,
        setupFee,
        pricePerCycle: baseRecurringPrice,
        // Store one-time charges in recurringData
        baseProductPrice: productPriceDueToday,
        // Store configs total for display
        configsTotal: pricing.configsTotal,
      } : undefined,
    };

    const cartStore = useCartStore.getState();
    cartStore.addItem(cartItem as any);

    setIsAddingToCart(false);

    if (onAddToCart) {
      onAddToCart(cartItem);
    }
  };

  // Add to wishlist
  const handleAddToWishlist = () => {
    const instances = configInstances.map((instance) => ({
      instanceId: instance.id,
      instanceNumber: instance.instanceNumber,
      instanceName: instance.name,
      quantity: instance.quantity || 1,
      selectedConfigs: instance.configs,
      selectedAddons: Object.entries(instance.addons)
        .filter(([_, value]) => value.selected)
        .reduce((acc, [id, value]) => {
          acc[id] = value;
          return acc;
        }, {} as Record<string, { quantity: number; selected: boolean }>),
    }));

    const wishlistItem = {
      product,
      variant: undefined,
      instances,
      unitPrice: pricing.basePrice + pricing.pricePerCycle + pricing.setupFee,
      billingCycle: pricing.billingCycle,
    };

    const wishlistStore = useWishlistStore.getState();
    wishlistStore.addItem(wishlistItem);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Recurring Billing Section - Hidden for VSaaS products */}
        {product.slug !== 'connect-cloud' && product.slug !== 'vsaas-on-premise' && (
        <RecurringBillingSection
          productId={product.id}
          variantId={selectedVariant || undefined}
          basePrice={pricing.subtotal}
          billingType={billingType}
          monthlySetupFee={effectiveRecurringPrices?.monthlySetupFee}
          biMonthlySetupFee={effectiveRecurringPrices?.biMonthlySetupFee}
          quarterlySetupFee={effectiveRecurringPrices?.quarterlySetupFee}
          fourMonthlySetupFee={effectiveRecurringPrices?.fourMonthlySetupFee}
          semiAnnualSetupFee={effectiveRecurringPrices?.semiAnnualSetupFee}
          triAnnualSetupFee={effectiveRecurringPrices?.triAnnualSetupFee}
          yearlySetupFee={effectiveRecurringPrices?.yearlySetupFee}
          biennialSetupFee={effectiveRecurringPrices?.biennialSetupFee}
          triennialSetupFee={effectiveRecurringPrices?.triennialSetupFee}
          monthlyPrice={effectiveRecurringPrices?.monthlyPrice}
          biMonthlyPrice={effectiveRecurringPrices?.biMonthlyPrice}
          quarterlyPrice={effectiveRecurringPrices?.quarterlyPrice}
          fourMonthlyPrice={effectiveRecurringPrices?.fourMonthlyPrice}
          semiAnnualPrice={effectiveRecurringPrices?.semiAnnualPrice}
          triAnnualPrice={effectiveRecurringPrices?.triAnnualPrice}
          yearlyPrice={effectiveRecurringPrices?.yearlyPrice}
          biennialPrice={effectiveRecurringPrices?.biennialPrice}
          triennialPrice={effectiveRecurringPrices?.triennialPrice}
          monthlySavings={effectiveRecurringPrices?.monthlySavings}
          quarterlySavings={effectiveRecurringPrices?.quarterlySavings}
          yearlySavings={recurringPrices?.yearlySavings}
          onRecurringChange={handleRecurringChange}
        />
        )}

        {/* Configurations Section - All configs grouped together */}
        {allConfigs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {allConfigs.map((config) => {
                // Use getSelectedValue helper to properly extract value from object format
                const selectedValue = getSelectedValue(config.id);
                
                return (
                  <div key={config.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        {config.displayName || config.name}
                        {config.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {config.unit && (
                        <Badge variant="outline">{config.unit}</Badge>
                      )}
                    </div>

                    {config.description && (
                      <p className="text-sm text-gray-500">{config.description}</p>
                    )}

                    {/* SELECT / DROPDOWN - Also the default when inputType is null */}
                    {(!config.inputType || config.inputType === "SELECT") && (
                      <div className="space-y-2">
                        <Select
                          value={getSelectedValue(config.id)}
                          onValueChange={(value) => handleConfigChange(config.id, value, 1)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {config.options?.filter(opt => opt.value && opt.value.trim() !== "").map((option) => {
                              const displayPrice = billingCycle === "YEARLY" 
                                ? Number(option.yearlyPriceModifier || 0)
                                : Number(option.monthlyPriceModifier || option.priceModifier || 0);
                              
                              return (
                                <SelectItem key={option.id} value={option.value}>
                                  <span className="text-gray-700">{option.label}</span>
                                  {displayPrice !== 0 && (
                                    <span className="ml-2">
                                      <span className="text-gray-500">{displayPrice > 0 ? "+" : "-"}{formatPrice(Math.abs(displayPrice))}</span>
                                      <span className="text-green-600">{billingCycle === "YEARLY" ? "/yr" : "/mo"}</span>
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {/* Quantity Controls */}
                        {getSelectedValue(config.id) && (
                          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 w-fit">
                            <button
                              type="button"
                              className="h-8 w-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleConfigQuantityChange(config.id, -1)}
                              disabled={getConfigQuantity(config.id) <= 1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{getConfigQuantity(config.id)}</span>
                            <button
                              type="button"
                              className="h-8 w-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                              onClick={() => handleConfigQuantityChange(config.id, 1)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RADIO BUTTONS */}
                    {config.inputType === "RADIO" && (
                      <div className="space-y-3">
                        {(config.options?.filter(opt => opt.value && opt.value.trim() !== "") || []).length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {config.options?.filter(opt => opt.value && opt.value.trim() !== "").map((option) => {
                              const displayPrice = billingCycle === "YEARLY"
                                ? Number(option.yearlyPriceModifier || 0)
                                : Number(option.monthlyPriceModifier || option.priceModifier || 0);
                              const isSelected = selectedValue === option.value;
                              
                              return (
                                <div
                                  key={option.id}
                                  onClick={() => handleConfigChange(config.id, option.value)}
                                  className={`
                                    cursor-pointer p-4 rounded-xl border-2 transition-all
                                    ${isSelected 
                                      ? "border-[#8B1D1D] bg-red-50" 
                                      : "border-gray-200 hover:border-gray-300"
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                        ${isSelected ? "border-[#8B1D1D] bg-[#8B1D1D]" : "border-gray-300 bg-white"}
                                      `}>
                                        {isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-medium">{option.label}</span>
                                        {option.description && (
                                          <p className="text-sm text-gray-500">{option.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    {displayPrice !== 0 && (
                                      <span className="">
                                        <span className={isSelected ? "text-[#8B1D1D]" : "text-gray-500"}>{displayPrice > 0 ? "+" : "-"}{formatPrice(Math.abs(displayPrice))}</span>
                                        <span className="text-green-600">{billingCycle === "YEARLY" ? "/yr" : "/mo"}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No options available</p>
                        )}
                      </div>
                    )}

                    {/* CHECKBOX - Single selection only (like radio but with checkbox UI) */}
                    {config.inputType === "CHECKBOX" && (
                      <div className="space-y-3">
                        {(config.options?.filter(opt => opt.value && opt.value.trim() !== "") || []).length > 0 ? (
                          <div className="space-y-2">
                            {config.options?.filter(opt => opt.value && opt.value.trim() !== "").map((option) => {
                              // Use getSelectedValue for consistent value retrieval (single selection)
                              const currentValue = getSelectedValue(config.id);
                              const isSelected = currentValue === option.value;
                              const displayPrice = billingCycle === "YEARLY"
                                ? Number(option.yearlyPriceModifier || option.priceModifier || 0)
                                : Number(option.monthlyPriceModifier || option.priceModifier || 0);
                              
                              return (
                                <div
                                  key={option.id}
                                  onClick={() => {
                                    // Single selection: select only this option (or deselect if already selected)
                                    handleConfigChange(config.id, isSelected ? "" : option.value);
                                  }}
                                  className={`
                                    cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between
                                    ${isSelected 
                                      ? "border-[#8B1D1D] bg-red-50" 
                                      : "border-gray-200 hover:border-gray-300"
                                    }
                                  `}
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox 
                                      checked={isSelected} 
                                      onCheckedChange={(checked) => {
                                        // Single selection: select only this option
                                        handleConfigChange(config.id, checked === true ? option.value : "");
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div>
                                      <span className="font-medium">{option.label}</span>
                                      {option.description && (
                                        <p className="text-sm text-gray-500">{option.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  {displayPrice !== 0 && (
                                    <span className="text-sm">
                                      <span className={isSelected ? "text-[#8B1D1D] font-medium" : "text-gray-500"}>
                                        {displayPrice > 0 ? "+" : "-"}{formatPrice(Math.abs(displayPrice))}
                                      </span>
                                      <span className="text-green-600">{billingCycle === "YEARLY" ? "/yr" : "/mo"}</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No options available</p>
                        )}
                      </div>
                    )}

                    {/* SLIDER */}
                                            {config.inputType === "SLIDER" && (
                                              <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm font-medium text-gray-700">
                                                    {/* Use label from first option as displayName for SLIDER inputs */}
                                                    {config.options?.[0]?.label || config.displayName || config.name}
                                                  </span>
                                                  {(() => {
                                                    // For SLIDER inputs, price comes from first option's monthlyPriceModifier
                                                    const effectivePricePerUnit = Number(config.options?.[0]?.monthlyPriceModifier || config.pricePerUnit || config.options?.[0]?.priceModifier) || 0;
                                                    return effectivePricePerUnit > 0 && (
                                                      <span className="text-sm">
                                                        <span className="text-green-600 font-medium">₹{effectivePricePerUnit.toFixed(2)}</span>
                                                        <span className="text-gray-500">/{config.unit || 'unit'}</span>
                                                      </span>
                                                    );
                                                  })()}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm text-gray-600">
                                                    Selected: {selectedValue || config.minValue || 0} {config.unit}
                                                  </span>
                                                  {Number(selectedValue) > 0 && (
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {formatPrice(
                                                        (Number(config.basePrice) || 0) + 
                                                        ((Number(selectedValue) || Number(config.minValue) || 0) * (Number(config.options?.[0]?.monthlyPriceModifier || config.pricePerUnit || config.options?.[0]?.priceModifier) || 0))
                                                      )}/mo
                                                    </span>
                                                  )}
                                                </div>
                                                <Slider
                                                  value={[Number(selectedValue) || Number(config.minValue) || 0]}
                                                  onValueChange={([value]) => handleConfigChange(config.id, String(value))}
                                                  min={config.minValue || 0}
                                                  max={config.maxValue || 100}
                                                  step={config.stepValue || 1}
                                                />
                                                <div className="flex justify-between text-xs text-gray-500">
                                                  <span>{config.minValue || 0} {config.unitPlural || config.unit}</span>
                                                  <span>{config.maxValue || 100} {config.unitPlural || config.unit}</span>
                                                </div>
                                              </div>
                                            )}

                                            {/* NUMBER INPUT */}
                                            {config.inputType === "NUMBER" && (
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm font-medium text-gray-700">
                                                    {/* Use label from first option as displayName for NUMBER inputs */}
                                                    {config.options?.[0]?.label || config.displayName || config.name}
                                                  </span>
                                                  {(() => {
                                                    // For NUMBER inputs, price comes from first option's monthlyPriceModifier
                                                    const effectivePricePerUnit = Number(config.options?.[0]?.monthlyPriceModifier || config.pricePerUnit || config.options?.[0]?.priceModifier) || 0;
                                                    return effectivePricePerUnit > 0 && (
                                                      <span className="text-sm">
                                                        <span className="text-green-600 font-medium">₹{effectivePricePerUnit.toFixed(2)}</span>
                                                        <span className="text-gray-500">/{config.unit || 'unit'}</span>
                                                      </span>
                                                    );
                                                  })()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Input
                                                    type="number"
                                                    value={selectedValue || ""}
                                                    onChange={(e) => handleConfigChange(config.id, e.target.value)}
                                                    min={config.minValue}
                                                    max={config.maxValue}
                                                    step={config.stepValue}
                                                    placeholder={`Enter ${config.unit || "value"}`}
                                                    className="flex-1"
                                                  />
                                                  {config.unit && (
                                                    <span className="text-sm text-gray-500 min-w-fit">{config.unit}</span>
                                                  )}
                                                </div>
                                                {Number(selectedValue) > 0 && (
                                                  <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                                                    <span className="text-gray-600">
                                                      {Number(selectedValue)} {config.unit || 'units'}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                      {formatPrice(
                                                        (Number(config.basePrice) || 0) + 
                                                        ((Number(selectedValue) || 0) * (Number(config.options?.[0]?.monthlyPriceModifier || config.pricePerUnit || config.options?.[0]?.priceModifier) || 0))
                                                      )}/mo
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Add-ons */}
                                {allAddons.length > 0 && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <Check className="h-5 w-5" />
                                        Add-ons & Services
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      {allAddons.map((addon) => {
                                        const addonState = selectedAddons[addon.uniqueId];
                                        const isSelected = addonState?.selected || false;
                                        
                                        return (
                                          <div
                                            key={addon.uniqueId}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                              isSelected
                                                ? "border-[#8B1D1D] bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                          >
                                            <div className="flex items-start gap-3">
                                              <Checkbox
                                                id={`addon-${addon.uniqueId}`}
                                                checked={isSelected}
                                                onCheckedChange={() => handleAddonToggle(addon.uniqueId)}
                                              />
                                              <div>
                                                <Label htmlFor={`addon-${addon.uniqueId}`} className="cursor-pointer font-medium">
                                                  {addon.name}
                                                  {addon.source === 'category' && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                      Category
                                                    </Badge>
                                                  )}
                                                </Label>
                                                {addon.description && (
                                                  <p className="text-sm text-gray-500">{addon.description}</p>
                                                )}
                                                {addon.pricingType && addon.pricingType !== "ONE_TIME" && (
                                                  <Badge variant="secondary" className="mt-1">
                                                    {BILLING_CYCLE_LABELS[addon.pricingType as keyof typeof BILLING_CYCLE_LABELS]}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              {addon.price !== undefined && (
                                                <span className="font-medium">
                                                  +{formatPrice(Number(addon.price))}
                                                </span>
                                              )}
                                                                                             {isSelected && (
                                                <div className="flex items-center gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                      handleAddonQuantityChange(addon.uniqueId, (addonState?.quantity || 1) - 1)
                                                    }
                                                  >
                                                    -
                                                  </Button>
                                                  <span className="w-8 text-center">{addonState?.quantity || 1}</span>
                                                  <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                      handleAddonQuantityChange(addon.uniqueId, (addonState?.quantity || 1) + 1)
                                                    }
                                                    disabled={!!addon.maxQuantity && (addonState?.quantity || 1) >= addon.maxQuantity}
                                                  >
                                                    +
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </CardContent>
                                  </Card>
                                )}
                              </div>

                              {/* Order Summary Panel */}
                              <div className="lg:col-span-1">
                                <Card className="sticky top-4">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <Calculator className="h-5 w-5" />
                                      Order Summary
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {/* Product/Variant Price - Show recurring price for RECURRING type */}
                                    {billingType === "ONE_TIME" ? (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{currentVariant?.name || product.name}</span>
                                        <span>{formatPrice(pricing.basePrice)}</span>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{currentVariant?.name || product.name}</span>
                                        <span>{formatPrice(pricing.pricePerCycle)}</span>
                                      </div>
                                    )}

                                    {/* Setup Fee */}
                                    {pricing.setupFee > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Setup Fee</span>
                                        <span>{formatPrice(pricing.setupFee)}</span>
                                      </div>
                                    )}

                                    {/* Config Breakdown */}
                                    {pricing.configBreakdown.length > 0 && pricing.configBreakdown.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          {item.name}
                                          {item.value && item.quantity > 0 && ` - ${item.value}`}
                                        </span>
                                        <span>
                                          {item.pricePerUnit && item.quantity > 0 ? (
                                            <span>
                                              {formatPrice(item.price)}
                                              <span className="text-xs text-gray-400 ml-1">
                                                ({item.quantity} × {formatPrice(item.pricePerUnit)}/{item.unit || 'unit'})
                                              </span>
                                            </span>
                                          ) : (
                                            formatPrice(item.price)
                                          )}
                                        </span>
                                      </div>
                                    ))}

                                    {/* Addon Breakdown */}
                                    {pricing.addonBreakdown.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          {item.name} x{item.quantity}
                                        </span>
                                        <span>{formatPrice(item.price)}</span>
                                      </div>
                                    ))}

                                    <Separator />

                                    {/* Dynamic Recurring Info - Only show for RECURRING billing type */}
                                    {pricing.billingCycle !== "ONE_TIME" && billingType !== "ONE_TIME" && (
                                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                                        <p className="text-sm text-gray-600">
                                          You will be charged <span className="font-medium">{formatPrice(pricing.pricePerCycle + pricing.configsTotal)}</span> every {
                                            pricing.billingCycle === "MONTHLY" ? "1 month" :
                                            pricing.billingCycle === "BIMONTHLY" ? "2 months" :
                                            pricing.billingCycle === "QUARTERLY" ? "3 months" :
                                            pricing.billingCycle === "YEARLY" ? "1 year" :
                                            pricing.billingCycle.toLowerCase()
                                          } after purchase.
                                        </p>
                                      </div>
                                    )}

                                    {/* ONE_TIME billing info */}
                                    {billingType === "ONE_TIME" && (
                                      <div className="bg-green-50 rounded-lg p-3 mt-2">
                                        <p className="text-sm text-green-600">
                                          <span className="font-medium">One-time payment</span> - No recurring charges
                                        </p>
                                      </div>
                                    )}

                                    <Separator />

                                    {/* Total Due Today */}
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-semibold">Total Due Today</span>
                                      <span className="text-2xl font-bold text-[#8B1D1D]">
                                        {billingType === "ONE_TIME" 
                                          ? formatPrice(pricing.basePrice + pricing.setupFee + pricing.configsTotal + pricing.addonsTotal)
                                          : formatPrice(pricing.setupFee + pricing.pricePerCycle + pricing.configsTotal + pricing.addonsTotal)
                                        }
                                      </span>
                                    </div>

                                    {/* Savings */}
                                    {pricing.savingsPercentage > 0 && (
                                      <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <p className="text-sm text-green-600">You save {pricing.savingsPercentage}% on total</p>
                                      </div>
                                    )}

                                    {/* Add to Cart & Wishlist Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-red-200 hover:bg-red-50"
                                        onClick={handleAddToWishlist}
                                      >
                                        <Heart className="h-5 w-5 mr-2" />
                                        Wishlist
                                      </Button>
                                      <Button
                                        size="lg"
                                        className="bg-[#8B1D1D] hover:bg-[#7A1919]"
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                      >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                                      </Button>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-4 border-t">
                                      <div className="flex items-center gap-1">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Instant Setup
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          );
                        }


