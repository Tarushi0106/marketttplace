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
  Plus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Types for configuration
interface ConfigOption {
  id: string;
  value: string;
  label: string;
  description?: string;
  priceModifier?: number;
  isPercentage?: boolean;
  modifierType?: "ADD" | "MULTIPLY" | "REPLACE";
  isAvailable?: boolean;
  stockStatus?: string;
}

interface ProductConfig {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  unit?: string;
  unitPlural?: string;
  icon?: string;
  pricingModel?: "FIXED" | "PER_UNIT" | "TIERED" | "HYBRID";
  basePrice?: number;
  pricePerUnit?: number;
  currency?: string;
  billingCycle?: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRecurring?: boolean;
  inputType?: "SELECT" | "RADIO" | "CHECKBOX" | "NUMBER" | "SLIDER" | "TEXT";
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
  defaultValue?: string;
  isRequired?: boolean;
  allowCustom?: boolean;
  source: "PRODUCT" | "CATEGORY" | "TEMPLATE";
  inheritedFromId?: string;
  options: ConfigOption[];
}

interface RecurringPrices {
  monthlyPrice?: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  biennialPrice?: number;
  triennialPrice?: number;
  monthlySavings?: number;
  yearlySavings?: number;
}

interface ProductInfo {
  id: string;
  name: string;
  basePrice: number;
  productType: string;
  images?: { url: string }[];
}

interface ProductConfiguratorProps {
  product: ProductInfo;
  configs: ProductConfig[];
  inheritedConfigs?: ProductConfig[];
  addons?: ProductAddon[];
  recurringPrices?: RecurringPrices | null;
  onAddToCart?: (config: any) => void;
}

const BILLING_CYCLE_LABELS = {
  ONE_TIME: "One-time",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
  BIENNIAL: "Biennial",
  TRIENNIAL: "Triennial",
};

const BILLING_CYCLE_MULTIPLIERS = {
  ONE_TIME: 1,
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
  BIENNIAL: 24,
  TRIENNIAL: 36,
};

export function ProductConfigurator({
  product,
  configs = [],
  inheritedConfigs = [],
  addons = [],
  recurringPrices,
  onAddToCart,
}: ProductConfiguratorProps) {
  // State for selections
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, any>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, { quantity: number; selected: boolean }>>({});
  const [billingCycle, setBillingCycle] = useState<string>("MONTHLY");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Initialize default selections
  useEffect(() => {
    // Set default values for configs
    configs.forEach((config) => {
      if (config.defaultValue && !selectedConfigs[config.id]) {
        setSelectedConfigs((prev) => ({
          ...prev,
          [config.id]: config.defaultValue,
        }));
      }
    });

    // Initialize addons with default selections
    addons.forEach((addon) => {
      setSelectedAddons((prev) => ({
        ...prev,
        [addon.id]: {
          quantity: addon.isSelectedByDefault ? 1 : 0,
          selected: addon.isSelectedByDefault || false,
        },
      }));
    });
  }, [configs, addons]);

  // Calculate total price
  const pricing = useMemo(() => {
    let subtotal = Number(product.basePrice) || 0;
    const configBreakdown: any[] = [];
    const addonBreakdown: any[] = [];

    // Calculate config prices
    configs.forEach((config) => {
      const value = selectedConfigs[config.id];
      if (value === undefined || value === null || value === "") return;

      let configPrice = 0;
      const basePrice = Number(config.basePrice) || 0;
      const pricePerUnit = Number(config.pricePerUnit) || 0;

      // Find selected option
      const selectedOption = config.options.find((opt) => opt.value === value);

      if (selectedOption) {
        if (selectedOption.modifierType === "REPLACE") {
          configPrice = Number(selectedOption.priceModifier) || 0;
        } else {
          configPrice = basePrice + (Number(selectedOption.priceModifier) || 0);
        }
      } else if (config.inputType === "NUMBER" || config.inputType === "SLIDER") {
        // Per-unit pricing
        const units = parseFloat(value) || 0;
        configPrice = basePrice + (units * pricePerUnit);
      } else {
        configPrice = basePrice;
      }

      if (configPrice > 0) {
        subtotal += configPrice;
        configBreakdown.push({
          name: config.displayName || config.name,
          value,
          price: configPrice,
        });
      }
    });

    // Calculate addon prices
    addons.forEach((addon) => {
      const addonState = selectedAddons[addon.id];
      if (!addonState?.selected || (addonState.quantity || 0) < 1) return;

      const quantity = addonState.quantity || 1;
      const addonPrice = Number(addon.price) || 0;
      const totalPrice = addonPrice * quantity;

      subtotal += totalPrice;
      addonBreakdown.push({
        name: addon.name,
        quantity,
        price: totalPrice,
      });
    });

    // Apply billing cycle multiplier
    const cycleMultiplier = BILLING_CYCLE_MULTIPLIERS[billingCycle as keyof typeof BILLING_CYCLE_MULTIPLIERS] || 1;
    const totalWithBilling = subtotal * cycleMultiplier;

    // Calculate savings
    const monthlyPrice = totalWithBilling;
    const yearlyPrice = totalWithBilling * 12;
    const savings = yearlyPrice * 0.2; // 20% yearly discount

    return {
      subtotal,
      totalWithBilling,
      monthlyPrice,
      yearlyPrice,
      savings,
      configBreakdown,
      addonBreakdown,
    };
  }, [product.basePrice, configs, selectedConfigs, addons, selectedAddons, billingCycle]);

  // Handle config selection
  const handleConfigChange = (configId: string, value: string) => {
    setSelectedConfigs((prev) => ({
      ...prev,
      [configId]: value,
    }));
  };

  // Handle addon selection
  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: {
        ...prev[addonId],
        selected: !prev[addonId]?.selected,
        quantity: prev[addonId]?.selected ? 0 : 1,
      },
    }));
  };

  // Handle addon quantity change
  const handleAddonQuantityChange = (addonId: string, quantity: number) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: {
        ...prev[addonId],
        quantity: Math.max(1, quantity),
      },
    }));
  };

  // Handle custom value change
  const handleCustomValueChange = (configId: string, value: string) => {
    setCustomValues((prev) => ({
      ...prev,
      [configId]: value,
    }));
    setSelectedConfigs((prev) => ({
      ...prev,
      [configId]: value,
    }));
  };

  // Add to cart
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Convert selectedConfigs Record to array format
    const selectedConfigsArray = Object.entries(selectedConfigs).map(([configId, value]) => {
      const config = configs.find((c) => c.id === configId);
      return {
        configId,
        configName: config?.displayName || config?.name || "",
        value,
        priceModifier: 0,
      };
    });
    
    const cartItem = {
      product,
      variant: undefined,
      quantity: 1,
      selectedConfigs: selectedConfigsArray,
      selectedAddons: Object.entries(selectedAddons)
        .filter(([_, value]) => value.selected)
        .map(([id, value]) => ({
          addon: addons.find((a) => a.id === id),
          quantity: value.quantity,
        })),
      unitPrice: pricing.totalWithBilling,
      totalPrice: pricing.totalWithBilling,
      billingCycle,
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
      unitPrice: pricing.totalWithBilling,
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
        {recurringPrices && (
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
                    {recurringPrices.monthlyPrice && (
                      <span className="block text-sm text-gray-500">
                        {formatCurrency(Number(recurringPrices.monthlyPrice))}/mo
                      </span>
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="QUARTERLY" id="quarterly" />
                  <Label htmlFor="quarterly" className="cursor-pointer">
                    Quarterly
                    {recurringPrices.quarterlyPrice && (
                      <span className="block text-sm text-gray-500">
                        {formatCurrency(Number(recurringPrices.quarterlyPrice))}/qtr
                      </span>
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YEARLY" id="yearly" />
                  <Label htmlFor="yearly" className="cursor-pointer">
                    Yearly
                    {recurringPrices.yearlySavings && (
                      <Badge variant="secondary" className="ml-2">
                        Save {recurringPrices.yearlySavings}%
                      </Badge>
                    )}
                    {recurringPrices.yearlyPrice && (
                      <span className="block text-sm text-gray-500">
                        {formatCurrency(Number(recurringPrices.yearlyPrice))}/yr
                      </span>
                    )}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Product Configurations */}
        {configs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Configure Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {configs.map((config) => (
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

                  {/* SELECT / RADIO */}
                  {(config.inputType === "SELECT" || config.inputType === "RADIO") && (
                    <RadioGroup
                      value={selectedConfigs[config.id] || ""}
                      onValueChange={(value: string) => handleConfigChange(config.id, value)}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {config.options.map((option) => (
                        <div key={option.value} className="relative">
                          <RadioGroupItem
                            value={option.value}
                            id={`${config.id}-${option.value}`}
                            className="peer sr-only"
                            disabled={option.isAvailable === false}
                          />
                          <Label
                            htmlFor={`${config.id}-${option.value}`}
                            className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedConfigs[config.id] === option.value
                                ? "border-[#8B1D1D] bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${option.isAvailable === false ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span className="font-medium">{option.label}</span>
                            {option.priceModifier !== undefined && option.priceModifier !== 0 && (
                              <span className="text-sm text-gray-500">
                                {option.priceModifier > 0 ? "+" : ""}
                                {formatCurrency(Number(option.priceModifier))}
                              </span>
                            )}
                            {option.stockStatus && (
                              <span className="text-xs text-amber-600 mt-1">
                                {option.stockStatus === "out_of_stock" ? "Out of stock" : "Limited"}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* SLIDER / NUMBER */}
                  {(config.inputType === "SLIDER" || config.inputType === "NUMBER") && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {selectedConfigs[config.id] || config.minValue || 0} {config.unit}
                        </span>
                        <span className="text-gray-500">
                          {config.pricePerUnit && `+${formatCurrency(Number(config.pricePerUnit))}/${config.unit}`}
                        </span>
                      </div>
                      <input
                        type={config.inputType === "NUMBER" ? "number" : "range"}
                        min={config.minValue || 0}
                        max={config.maxValue || 100}
                        step={config.stepValue || 1}
                        value={selectedConfigs[config.id] || config.minValue || 0}
                        onChange={(e) => handleConfigChange(config.id, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* CHECKBOX */}
                  {config.inputType === "CHECKBOX" && (
                    <div className="space-y-2">
                      {config.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${config.id}-${option.value}`}
                            checked={selectedConfigs[config.id] === option.value}
                            onCheckedChange={(checked) =>
                              handleConfigChange(config.id, checked ? option.value : "")
                            }
                          />
                          <Label htmlFor={`${config.id}-${option.value}`} className="cursor-pointer">
                            {option.label}
                            {option.priceModifier !== undefined && (
                              <span className="text-sm text-gray-500 ml-2">
                                {option.priceModifier > 0 ? "+" : ""}
                                {formatCurrency(Number(option.priceModifier))}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TEXT (Custom Input) */}
                  {config.inputType === "TEXT" && config.allowCustom && (
                    <Input
                      type="text"
                      placeholder={`Enter ${config.unit || "value"}`}
                      value={customValues[config.id] || ""}
                      onChange={(e) => handleCustomValueChange(config.id, e.target.value)}
                    />
                  )}

                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Inherited Configurations (from category) */}
        {inheritedConfigs.length > 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5" />
                Additional Options Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                These configurations are inherited from the category and can be applied to customize your plan further.
              </p>
              <div className="grid gap-3">
                {inheritedConfigs.map((config) => (
                  <Button
                    key={config.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      // Could open a modal to add this config
                    }}
                  >
                    {config.displayName || config.name}
                    {config.unit && (
                      <span className="ml-2 text-gray-500">({config.unit})</span>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add-ons */}
        {addons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Add-ons & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addons.map((addon) => {
                const addonState = selectedAddons[addon.id];
                const isSelected = addonState?.selected || false;
                
                return (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-[#8B1D1D] bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleAddonToggle(addon.id)}
                      />
                      <div>
                        <Label htmlFor={`addon-${addon.id}`} className="cursor-pointer font-medium">
                          {addon.name}
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
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              handleAddonQuantityChange(addon.id, (addonState?.quantity || 1) - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{addonState?.quantity || 1}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              handleAddonQuantityChange(addon.id, (addonState?.quantity || 1) + 1)
                            }
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

      {/* Pricing Summary Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Base Price */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{product.name}</span>
                <span className="font-medium">
                  {formatCurrency(Number(product.basePrice))}
                </span>
              </div>

              {/* Selected Configurations */}
              {pricing.configBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name}: {item.value}
                  </span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}

              {/* Selected Add-ons */}
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
                  {formatCurrency(pricing.totalWithBilling)}
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
                    {formatCurrency(pricing.monthlyPrice)}
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
    </div>
  );
}
