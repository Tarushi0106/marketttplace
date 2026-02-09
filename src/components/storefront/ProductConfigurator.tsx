"use client";

import { useState, useEffect, useMemo } from "react";
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
  Settings
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

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
  monthlyPrice?: number;
  yearlyPrice?: number;
  monthlySavings?: number;
  yearlySavings?: number;
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
  };
  variants?: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    attributes?: Record<string, string>;
    isDefault?: boolean;
  }[];
  configs?: ProductConfig[];
  inheritedConfigs?: ProductConfig[];
  productAddons?: AddonWithSource[];
  categoryAddons?: AddonWithSource[];
  recurringPrices?: RecurringPrices | null;
  onAddToCart?: (config: any) => void;
}

const BILLING_CYCLE_LABELS = {
  ONE_TIME: "One-time",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  BIENNIAL: "Biennial",
  TRIENNIAL: "Triennial",
};

const BILLING_CYCLE_MULTIPLIERS = {
  ONE_TIME: 1,
  MONTHLY: 1,
  YEARLY: 12,
  BIENNIAL: 24,
  TRIENNIAL: 36,
};

export function ProductConfigurator({
  product,
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

  // State for selections
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, any>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, { quantity: number; selected: boolean; source: string }>>({});
  const [billingCycle, setBillingCycle] = useState<string>("MONTHLY");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Variant selection state - use default variant or first variant
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variants.find(v => v.isDefault)?.id || variants[0]?.id || null
  );

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

    setSelectedConfigs(initialConfigs);
    setSelectedAddons(initialAddons);
  }, []); // Empty deps array - run only once on mount

  // Get all configs (product + inherited)
  // All configs grouped together under "Configurations" section
  const allConfigs = configs;
  
  // Get selected variant
  const currentVariant = variants.find(v => v.id === selectedVariant);
  
  // Calculate total price
  const pricing = useMemo(() => {
    // Use variant price if available, otherwise use product basePrice
    let subtotal = currentVariant ? Number(currentVariant.price) : Number(product.basePrice) || 0;
    const configBreakdown: any[] = [];
    const addonBreakdown: any[] = [];

    configs.forEach((config) => {
      const value = selectedConfigs[config.id];
      if (!value) return;

      let configPrice = 0;
      const basePrice = Number(config.basePrice) || 0;
      const pricePerUnit = Number(config.pricePerUnit) || 0;

      // Handle slider/number inputs with per-unit pricing
      if (config.inputType === "SLIDER" || config.inputType === "NUMBER") {
        const quantity = Number(value) || 0;
        const min = config.minValue || 0;
        const usedQuantity = Math.max(quantity, min);
        configPrice = basePrice + (pricePerUnit * usedQuantity);
      } else {
        // Handle select/radio/checkbox with price modifiers
        const option = config.options?.find((opt) => opt.value === value);
        if (option) {
          // Use monthly/yearly modifier based on billing cycle
          const modifier = billingCycle === "YEARLY"
            ? Number(option.yearlyPriceModifier || option.priceModifier || 0)
            : Number(option.monthlyPriceModifier || option.priceModifier || 0);
          configPrice = basePrice + modifier;
        } else {
          configPrice = basePrice;
        }
      }

      subtotal += configPrice;

      // Find option label for breakdown
      const optionLabel = config.options?.find((opt) => opt.value === value)?.label || value;
      configBreakdown.push({
        name: config.displayName || config.name,
        value: optionLabel,
        price: configPrice,
      });
    });

    allAddons.forEach((addon) => {
      const state = selectedAddons[addon.uniqueId];
      if (!state?.selected || state.quantity < 1) return;

      const total = Number(addon.price) * state.quantity;
      subtotal += total;

      addonBreakdown.push({
        name: addon.name,
        quantity: state.quantity,
        price: total,
        source: addon.source,
      });
    });

    // Apply billing cycle multiplier
    const multiplier = BILLING_CYCLE_MULTIPLIERS[billingCycle as keyof typeof BILLING_CYCLE_MULTIPLIERS] || 1;
    const totalWithBilling = subtotal * multiplier;

    // Calculate monthly equivalent for display
    const monthlyPrice = totalWithBilling / multiplier;

    // Calculate savings
    let savings = 0;
    if (billingCycle === "YEARLY" && recurringPrices?.yearlySavings) {
      savings = recurringPrices.yearlySavings;
    }

    return {
      subtotal,
      totalWithBilling,
      monthlyPrice,
      savings,
      configBreakdown,
      addonBreakdown,
    };
  }, [product.basePrice, configs, allAddons, selectedConfigs, selectedAddons, billingCycle, recurringPrices]);

  // Handle configuration changes
  const handleConfigChange = (configId: string, value: string) => {
    setSelectedConfigs((prev) => ({
      ...prev,
      [configId]: value,
    }));
  };

  // Handle custom value changes
  const handleCustomValueChange = (configId: string, value: string) => {
    setCustomValues((prev) => ({
      ...prev,
      [configId]: value,
    }));

    // Also update selectedConfigs if needed
    if (value) {
      setSelectedConfigs((prev) => ({
        ...prev,
        [configId]: value,
      }));
    }
  };

  // Handle addon selection
  const handleAddonToggle = (uniqueId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [uniqueId]: {
        ...prev[uniqueId],
        selected: !prev[uniqueId]?.selected,
        quantity: prev[uniqueId]?.selected ? 0 : 1,
      },
    }));
  };

  // Handle addon quantity change
  const handleAddonQuantityChange = (uniqueId: string, quantity: number) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [uniqueId]: {
        ...prev[uniqueId],
        quantity: Math.max(1, quantity),
        selected: quantity > 0,
      },
    }));
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    // Prepare selected configs as array
    const selectedConfigsArray = Object.entries(selectedConfigs).map(([configId, value]) => {
      const config = configs.find((c) => c.id === configId);
      const option = config?.options?.find((opt) => opt.value === value);
      return {
        configId,
        configName: config?.displayName || config?.name,
        value,
        optionLabel: option?.label || value,
        price: Number(option?.priceModifier) || 0,
        monthlyPriceModifier: Number(option?.monthlyPriceModifier) || 0,
        yearlyPriceModifier: Number(option?.yearlyPriceModifier) || 0,
      };
    });

    const cartItem = {
      product,
      variant: currentVariant || undefined,
      quantity: 1,
      selectedConfigs: selectedConfigsArray,
      selectedAddons: Object.entries(selectedAddons)
        .filter(([_, value]) => value.selected)
        .map(([uniqueId, value]) => ({
          addon: allAddons.find((a) => a.uniqueId === uniqueId),
          quantity: value.quantity,
        }))
        .filter((item): item is { addon: NonNullable<typeof item.addon>; quantity: number } => item.addon !== undefined),
      unitPrice: pricing.subtotal ?? 0,
      billingCycle: billingCycle as "ONE_TIME" | "MONTHLY" | "YEARLY" | "BIENNIAL" | "TRIENNIAL" | undefined,
    };

    const cartStore = useCartStore.getState();
    cartStore.addItem(cartItem);

    setIsAddingToCart(false);

    if (onAddToCart) {
      onAddToCart(cartItem);
    }
  };

  // Add to wishlist
  const handleAddToWishlist = () => {
    const wishlistItem = {
      product,
      variant: undefined,
      selectedConfigs,
      selectedAddons: Object.entries(selectedAddons)
        .filter(([_, value]) => value.selected)
        .reduce((acc, [id, value]) => {
          acc[id] = value;
          return acc;
        }, {} as Record<string, { quantity: number; selected: boolean }>),
      unitPrice: pricing.totalWithBilling ?? 0,
      billingCycle,
    };

    const wishlistStore = useWishlistStore.getState();
    wishlistStore.addItem(wishlistItem);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Billing Cycle Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Billing Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={billingCycle}
              onValueChange={setBillingCycle}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MONTHLY" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer">
                  Monthly
                  {recurringPrices?.monthlyPrice && (
                    <span className="block text-sm text-gray-500">
                      {formatCurrency(Number(recurringPrices.monthlyPrice))}/mo
                    </span>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YEARLY" id="yearly" />
                <Label htmlFor="yearly" className="cursor-pointer">
                  Yearly
                  {recurringPrices?.yearlySavings ? (
                    <Badge variant="secondary" className="ml-2">
                      Save {recurringPrices.yearlySavings}%
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">
                      Save 10%
                    </Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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
                const selectedValue = selectedConfigs[config.id];
                
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

                    {/* SELECT / DROPDOWN */}
                    {config.inputType === "SELECT" && (
                      <Select
                        value={selectedValue || ""}
                        onValueChange={(value) => handleConfigChange(config.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map((option) => {
                            const displayPrice = billingCycle === "YEARLY" 
                              ? Number(option.yearlyPriceModifier || 0)
                              : Number(option.monthlyPriceModifier || option.priceModifier || 0);
                            
                            return (
                              <SelectItem key={option.id} value={option.value}>
                                {option.label}
                                {displayPrice !== 0 && (
                                  <span className="ml-2 text-gray-500">
                                    {displayPrice > 0 ? "+" : "-"}{formatCurrency(Math.abs(displayPrice))}
                                    {billingCycle === "YEARLY" ? "/yr" : "/mo"}
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}

                    {/* RADIO BUTTONS */}
                    {config.inputType === "RADIO" && (
                      <div className="grid grid-cols-2 gap-3">
                        {config.options?.map((option) => {
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
                                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                            ${isSelected ? "border-[#8B1D1D]" : "border-gray-300"}
                                                          `}>
                                                            {isSelected && (
                                                              <div className="w-2 h-2 rounded-full bg-[#8B1D1D]" />
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
                                                          <span className={isSelected ? "text-[#8B1D1D] font-medium" : "text-gray-500"}>
                                                            {displayPrice > 0 ? "+" : "-"}{formatCurrency(Math.abs(displayPrice))}
                                                            {billingCycle === "YEARLY" ? "/yr" : "/mo"}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}

                                            {/* CHECKBOX - For multi-select if needed */}
                                            {config.inputType === "CHECKBOX" && (
                                              <div className="space-y-2">
                                                {config.options?.map((option) => {
                                                  const isSelected = selectedConfigs[config.id]?.includes(option.value);
                                                  return (
                                                    <div
                                                      key={option.id}
                                                      onClick={() => {
                                                        const current = selectedConfigs[config.id] || [];
                                                        const newValue = isSelected
                                                          ? current.filter((v: string) => v !== option.value)
                                                          : [...current, option.value];
                                                        handleConfigChange(config.id, newValue);
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
                                                        <Checkbox checked={isSelected} />
                                                        <div>
                                                          <span className="font-medium">{option.label}</span>
                                                          {option.description && (
                                                            <p className="text-sm text-gray-500">{option.description}</p>
                                                          )}
                                                        </div>
                                                      </div>
                                                      {Number(option.priceModifier) !== 0 && (
                                                        <span className="text-sm">
                                                          {Number(option.priceModifier) > 0 ? "+" : ""}{formatCurrency(Number(option.priceModifier))}
                                                        </span>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}

                                            {/* SLIDER */}
                                            {config.inputType === "SLIDER" && (
                                              <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm font-medium">
                                                    {selectedValue || config.minValue || 0} {config.unit}
                                                  </span>
                                                  <span className="text-sm text-gray-500">
                                                    Total: {formatCurrency(
                                                      (Number(config.basePrice) || 0) + 
                                                      ((Number(selectedValue) || Number(config.minValue) || 0) * (Number(config.pricePerUnit) || 0))
                                                    )}/mo
                                                  </span>
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
                                                  <Label>{config.displayName || config.name}</Label>
                                                  <span className="text-sm text-gray-500">
                                                    {formatCurrency(
                                                      (Number(config.basePrice) || 0) + 
                                                      ((Number(selectedValue) || 0) * (Number(config.pricePerUnit) || 0))
                                                    )}/mo
                                                  </span>
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
                                                  />
                                                  {config.unit && (
                                                    <span className="text-sm text-gray-500">{config.unit}</span>
                                                  )}
                                                </div>
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
                                                  +{formatCurrency(Number(addon.price))}
                                                </span>
                                              )}
                                              {isSelected && addon.maxQuantity && addon.maxQuantity > 1 && (
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
                                                    disabled={addon.maxQuantity && (addonState?.quantity || 1) >= addon.maxQuantity}
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
                                    {/* Base Price */}
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Base Price</span>
                                      <span>{formatCurrency(Number(product.basePrice))}</span>
                                    </div>

                                    {/* Config Breakdown */}
                                    {pricing.configBreakdown.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.name}</span>
                                        <span>{formatCurrency(item.price)}</span>
                                      </div>
                                    ))}

                                    {/* Addon Breakdown */}
                                    {pricing.addonBreakdown.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          {item.name} x{item.quantity}
                                        </span>
                                        <span>{formatCurrency(item.price)}</span>
                                      </div>
                                    ))}

                                    <Separator />

                                    {/* Subtotal */}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span className="font-medium">{formatCurrency(pricing.subtotal)}</span>
                                    </div>

                                    {/* Billing Cycle */}
                                    {BILLING_CYCLE_LABELS[billingCycle as keyof typeof BILLING_CYCLE_LABELS] !== "Monthly" && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          {BILLING_CYCLE_LABELS[billingCycle as keyof typeof BILLING_CYCLE_LABELS]} billing
                                        </span>
                                        <span>
                                          ×{BILLING_CYCLE_MULTIPLIERS[billingCycle as keyof typeof BILLING_CYCLE_MULTIPLIERS]}
                                        </span>
                                      </div>
                                    )}

                                    <Separator />

                                    {/* Total */}
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-semibold">Total</span>
                                      <span className="text-2xl font-bold text-[#8B1D1D]">
                                        {formatCurrency(pricing.totalWithBilling ?? 0)}
                                        <span className="text-sm font-normal text-gray-500">
                                          /{BILLING_CYCLE_LABELS[billingCycle as keyof typeof BILLING_CYCLE_LABELS].toLowerCase()}
                                        </span>
                                      </span>
                                    </div>

                                    {/* Monthly Equivalent */}
                                    {billingCycle !== "MONTHLY" && (
                                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-sm text-gray-500">Monthly equivalent</p>
                                        <p className="text-xl font-bold text-green-600">
                                          {formatCurrency(pricing.monthlyPrice ?? 0)}
                                        </p>
                                      </div>
                                    )}

                                    {/* Savings */}
                                    {pricing.savings > 0 && (
                                      <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <p className="text-sm text-green-600">You save {formatCurrency(pricing.savings)}/year</p>
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
                                      <div className="flex items-center gap-1">
                                        <Check className="h-4 w-4 text-green-500" />
                                        30-Day Refund
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          );
                        }
