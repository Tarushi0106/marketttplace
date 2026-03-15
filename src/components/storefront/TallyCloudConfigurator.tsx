"use client";

import { useState, useMemo } from "react";
import { Check, ShoppingCart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import * as Select from "@radix-ui/react-select";

interface AddonOption {
  label: string;
  price: number;
  unit?: string;
}

interface Addon {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit?: string | null;
  quantity?: number;
  group?: string; // For grouping addons in dropdown
  options?: AddonOption[]; // For dropdown options (e.g., Cloud Storage - 4 Days, 27 Days, etc.)
}

interface BillingPlan {
  id: string;
  label: string;
  period: string;
  price: number;
  savings?: number;
}

interface TallyCloudConfiguratorProps {
  productId?: string;
  productSlug?: string;
  productName?: string;
  productDescription?: string;
  basePrice: number;
  addons: Addon[];
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    isDefault?: boolean;
    attributes?: Record<string, string>;
    billingType?: string;
    setupFee?: number;
  }>;
  selectedVariantId?: string | null;
  billingPlans?: BillingPlan[];
}

export function TallyCloudConfigurator({
  productId,
  productSlug,
  productName = "Tally Cloud Server",
  productDescription = "Enterprise-grade cloud hosting for Tally Prime",
  basePrice = 4500,
  addons = [],
  variants = [],
  selectedVariantId = null,
  billingPlans = [
    { id: "monthly", label: "Monthly", period: "/month", price: 4500 },
    { id: "quarterly", label: "Quarterly", period: "/quarter", price: 12900, savings: 6 },
    { id: "semi-annual", label: "Semi Annual", period: "/6 months", price: 24300, savings: 10 },
    { id: "yearly", label: "Yearly", period: "/year", price: 43200, savings: 20 },
  ],
}: TallyCloudConfiguratorProps) {
  const router = useRouter();
  const { addItem: addToCart } = useCartStore();
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>(billingPlans[0]);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  
  // Initialize selected variant - use first variant as default or use selectedVariantId prop
  const defaultVariantId = variants && variants.length > 0 
    ? (selectedVariantId && variants.some(v => v.id === selectedVariantId) 
        ? selectedVariantId 
        : variants.find(v => v.isDefault)?.id || variants[0]?.id)
    : null;
  const [selectedVariant, setSelectedVariant] = useState<string | null>(defaultVariantId);

  // Group addons by base name (use group field if available, otherwise parse from name)
  const groupedAddons = useMemo(() => {
    const groups: Record<string, Addon[]> = {};
    addons.forEach(addon => {
      // Use explicit group field if available, otherwise parse from name
      // Match patterns like "Cloud Storage - 4 Days", "Cloud Storage - 27 Days" -> "Cloud Storage"
      const groupName = addon.group || addon.name.replace(/\s*-\s+.+$/, '').trim();
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(addon);
    });
    // Only return groups with multiple options as dropdowns
    return Object.entries(groups).filter(([_, items]) => items.length > 1);
  }, [addons]);

  // Get standalone addons (not part of a group with multiple options)
  const standaloneAddons = useMemo(() => {
    const groupNames = new Set(groupedAddons.map(([name]) => name));
    return addons.filter(addon => {
      const groupName = (addon as any).group || addon.name.replace(/\s*-\s*\d+.*$/, '').trim();
      return !groupNames.has(groupName);
    });
  }, [addons, groupedAddons]);

  // Track selected dropdown values
  const [selectedDropdownAddon, setSelectedDropdownAddon] = useState<Record<string, string>>({});
  
  // Track selected option index for addons with options
  const [selectedAddonOption, setSelectedAddonOption] = useState<Record<string, number>>({});

  // Initialize dropdown selections with first option
  useMemo(() => {
    groupedAddons.forEach(([baseName, items]) => {
      if (!selectedDropdownAddon[baseName] && items.length > 0) {
        setSelectedDropdownAddon(prev => ({ ...prev, [baseName]: items[0].id }));
      }
    });
  }, [groupedAddons]);

  const toggleAddon = (addonId: string) => {
    setAddonQuantities((prev) => {
      const newQuantities = { ...prev };
      if (newQuantities[addonId] > 0) {
        newQuantities[addonId] = 0;
      } else {
        newQuantities[addonId] = 1;
      }
      return newQuantities;
    });
  };

  const updateQuantity = (addonId: string, delta: number) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0;
      const newQty = Math.max(0, Math.min(4, currentQty + delta));
      return { ...prev, [addonId]: newQty };
    });
  };

  const selectedAddonObjects = useMemo(() => {
    return addons
      .filter((addon) => (addonQuantities[addon.id] || 0) > 0)
      .map((addon) => {
        // Get the actual price (option price if available)
        let actualPrice = addon.price;
        let selectedOptionLabel: string | undefined;
        
        if (addon.options && addon.options.length > 0) {
          const selectedOptionIndex = selectedAddonOption[addon.id] ?? 0;
          const option = addon.options[selectedOptionIndex];
          if (option) {
            actualPrice = option.price;
            selectedOptionLabel = option.label;
          }
        }
        
        return {
          ...addon,
          price: actualPrice,
          quantity: addonQuantities[addon.id] || 0,
          selectedOption: selectedOptionLabel,
        };
      });
  }, [addons, addonQuantities, selectedAddonOption]);

  const addonsTotal = useMemo(() => {
    return addons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0;
      if (qty === 0) return sum;
      
      // Use option price if addon has options
      if (addon.options && addon.options.length > 0) {
        const selectedOptionIndex = selectedAddonOption[addon.id] ?? 0;
        const option = addon.options[selectedOptionIndex];
        return sum + (option ? option.price * qty : addon.price * qty);
      }
      
      return sum + (addon.price * qty);
    }, 0);
  }, [addons, addonQuantities, selectedAddonOption]);

  // Get the base price - use variant price if selected, otherwise use selectedPlan price
  const variantPrice = selectedVariant && variants.length > 0 
    ? variants.find(v => v.id === selectedVariant)?.price || 0 
    : 0;
  const calculatedBasePrice = variants.length > 0 ? variantPrice : selectedPlan.price;
  const totalPrice = calculatedBasePrice + addonsTotal;

  const handleAddToCart = () => {
    const cartItem = {
      id: `${productId || productSlug || 'product'}-${selectedPlan.id}-${Date.now()}`,
      product: {
        id: productId || '',
        slug: productSlug || '',
        name: productName,
      } as any,
      quantity: 1,
      selectedAddons: selectedAddonObjects.map((addon) => ({
        addon: {
          id: addon.id,
          name: addon.name,
          price: addon.price,
        },
        quantity: addonQuantities[addon.id] || 1,
      })),
      billingCycle: selectedPlan.id.toUpperCase() as any,
      isRecurring: true,
      unitPrice: totalPrice,
      totalPrice: totalPrice,
      recurringAmount: calculatedBasePrice,
      variantId: selectedVariant || undefined,
    };
    
    addToCart(cartItem as any);
    router.push("/cart");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Clean Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900">{productName}</h2>
        <p className="text-gray-500 mt-1">{productDescription}</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column: Add-ons (3 columns) */}
        <div className="lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Available Add-ons</h3>
          
          {addons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No add-ons available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Grouped Addons as Dropdowns */}
              {groupedAddons.map(([baseName, items]) => {
                const selectedId = selectedDropdownAddon[baseName] || items[0]?.id;
                const selectedAddon = items.find(i => i.id === selectedId);
                const qty = addonQuantities[selectedId] || 0;
                
                return (
                  <div
                    key={baseName}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      qty > 0 
                        ? "border-[#C62828] bg-red-50/40 shadow-sm" 
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => {
                      if (selectedId) {
                        if (qty > 0) {
                          setAddonQuantities(prev => ({ ...prev, [selectedId]: 0 }));
                        } else {
                          setAddonQuantities(prev => ({ ...prev, [selectedId]: 1 }));
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          qty > 0 ? "bg-[#C62828] border-[#C62828]" : "border-gray-300 bg-white"
                        }`}
                      >
                        {qty > 0 && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{baseName}</div>
                        <Select.Root
                          value={selectedId}
                          onValueChange={(value) => {
                            setSelectedDropdownAddon(prev => ({ ...prev, [baseName]: value }));
                            // Reset quantity for new selection
                            const currentQty = addonQuantities[selectedId] || 0;
                            setAddonQuantities(prev => ({ ...prev, [value]: currentQty, [selectedId]: 0 }));
                          }}
                        >
                          <Select.Trigger className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#C62828]/20 w-fit">
                            <Select.Value placeholder="Select option" />
                            <Select.Icon>
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                              <Select.Viewport className="p-1">
                                {items.map((item) => (
                                  <Select.Item
                                    key={item.id}
                                    value={item.id}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 outline-none text-sm text-gray-700 data-[highlighted]:bg-gray-100"
                                  >
                                    <div className="flex flex-col">
                                      <Select.ItemText>{item.name}</Select.ItemText>
                                      {item.description && (
                                        <span className="text-xs text-gray-400">{item.description}</span>
                                      )}
                                    </div>
                                    <span className="ml-4 font-medium text-gray-900">{formatPrice(item.price)}</span>
                                  </Select.Item>
                                ))}
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div 
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => {
                              const currentQty = addonQuantities[selectedId] || 0;
                              if (currentQty > 0) {
                                setAddonQuantities(prev => ({ ...prev, [selectedId]: currentQty - 1 }));
                              }
                            }}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900 text-sm">{qty}</span>
                          <button
                            onClick={() => {
                              const currentQty = addonQuantities[selectedId] || 0;
                              if (currentQty < 4) {
                                setAddonQuantities(prev => ({ ...prev, [selectedId]: currentQty + 1 }));
                              }
                            }}
                            disabled={qty >= 4}
                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="font-semibold text-gray-900">
                          {qty > 0 && selectedAddon ? formatPrice(selectedAddon.price * qty) : `+${formatPrice(selectedAddon?.price || 0)}`}
                        </div>
                        {selectedAddon?.unit && qty === 0 && (
                          <div className="text-xs text-gray-400">{selectedAddon.unit}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Standalone Addons (regular rows) */}
              {standaloneAddons.map((addon) => {
                // Check if addon has options for dropdown
                const hasOptions = addon.options && addon.options.length > 0;
                const selectedOptionIndex = selectedAddonOption[addon.id] ?? 0;
                const selectedOption = hasOptions ? addon.options![selectedOptionIndex] : null;
                
                // Use option price if available, otherwise use base price
                const displayPrice = selectedOption ? selectedOption.price : addon.price;
                const displayUnit = selectedOption?.unit || addon.unit;
                
                const qty = addonQuantities[addon.id] || 0;
                
                return (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${
                      hasOptions ? "cursor-default" : "cursor-pointer"
                    } ${
                      qty > 0 
                        ? "border-[#C62828] bg-red-50/40 shadow-sm" 
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => !hasOptions && toggleAddon(addon.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {!hasOptions && (
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            qty > 0 ? "bg-[#C62828] border-[#C62828]" : "border-gray-300 bg-white"
                          }`}
                        >
                          {qty > 0 && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{addon.name}</div>
                        {hasOptions ? (
                          <Select.Root
                            value={String(selectedOptionIndex)}
                            onValueChange={(value) => {
                              setSelectedAddonOption(prev => ({ ...prev, [addon.id]: parseInt(value) }));
                            }}
                          >
                            <Select.Trigger className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#C62828]/20 w-fit">
                              <Select.Value placeholder="Select option" />
                              <Select.Icon>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                <Select.Viewport className="p-1">
                                  {addon.options!.map((option, idx) => (
                                    <Select.Item
                                      key={idx}
                                      value={String(idx)}
                                      className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 outline-none text-sm text-gray-700 data-[highlighted]:bg-gray-100 min-w-[200px]"
                                    >
                                      <Select.ItemText>{option.label}</Select.ItemText>
                                      <span className="ml-4 font-medium text-gray-900">{formatPrice(option.price)}</span>
                                    </Select.Item>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        ) : addon.description ? (
                          <div className="text-sm text-gray-500 mt-0.5">{addon.description}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div 
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => updateQuantity(addon.id, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900 text-sm">{qty}</span>
                          <button
                            onClick={() => updateQuantity(addon.id, 1)}
                            disabled={qty >= 4}
                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="font-semibold text-gray-900">
                          {qty > 0 ? formatPrice(displayPrice * qty) : `+${formatPrice(displayPrice)}`}
                        </div>
                        {displayUnit && qty === 0 && (
                          <div className="text-xs text-gray-400">{displayUnit}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Billing Plans + Order Summary (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Plans - Hidden for all products - using variants instead */}
          {false && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Billing Plan</h3>
            <div className="space-y-3">
              {billingPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                    selectedPlan.id === plan.id
                      ? "border-[#C62828] bg-red-50/40 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan.id === plan.id 
                          ? "bg-[#C62828] border-[#C62828]" 
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPlan.id === plan.id && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{plan.label}</div>
                      <div className="text-sm text-gray-500">{plan.period}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {plan.savings && (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        Save {plan.savings}%
                      </span>
                    )}
                    <span className="font-semibold text-gray-900">{formatPrice(plan.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Variants - Show if variants are provided */}
          {variants && variants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Select Plan</h3>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                      selectedVariant === variant.id
                        ? "border-[#C62828] bg-red-50/40 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedVariant === variant.id 
                            ? "bg-[#C62828] border-[#C62828]" 
                            : "border-gray-300"
                        }`}
                      >
                        {selectedVariant === variant.id && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{variant.name}</div>
                        {variant.isDefault && (
                          <div className="text-xs text-[#C62828] font-medium">Recommended</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{formatPrice(variant.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <Card className="border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 text-lg">Order Summary</h3>
              
              <div className="space-y-3">
                {/* Show variant name if variants are being used, otherwise show billing plan */}
                {variants && variants.length > 0 && selectedVariant ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{variants.find(v => v.id === selectedVariant)?.name || 'Selected Plan'}</span>
                    <span className="font-medium text-gray-900">{formatPrice(variantPrice)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{selectedPlan.label}</span>
                    <span className="font-medium text-gray-900">{formatPrice(selectedPlan.price)}</span>
                  </div>
                )}

                {selectedAddonObjects.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    {selectedAddonObjects.map((addon) => {
                      const qty = addonQuantities[addon.id] || 0;
                      return (
                        <div key={addon.id} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            {addon.name}
                            {qty > 1 && <span className="text-gray-400 ml-1">(x{qty})</span>}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">{formatPrice(addon.price * qty)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#C62828]">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#C62828] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#8B1D1D] shadow-lg shadow-red-100 hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
