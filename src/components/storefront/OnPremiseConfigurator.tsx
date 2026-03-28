"use client";

import { useState, useMemo } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";

interface Addon {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit?: string | null;
  recurringPricesObj?: {
    monthly?: number | null;
    quarterly?: number | null;
    yearly?: number | null;
    biennial?: number | null;
    triennial?: number | null;
    semiAnnual?: number | null;
  } | null;
}

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

interface OnPremiseConfiguratorProps {
  onPremiseProduct: VSAASProduct;
}

// Transform addons helper
const transformAddons = (addons: any[]): Addon[] => {
  return addons.map(addon => ({
    id: addon.id,
    name: addon.name,
    description: addon.description || undefined,
    price: Number(addon.price) || 0,
    unit: addon.unit || undefined,
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

// Billing multipliers
const billingMultipliers: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  'semi-annual': 6,
  yearly: 12,
};

// Helper function to get addon price based on billing cycle
const getAddonPriceForCycle = (addon: Addon, cycle: string): number => {
  if (addon.recurringPricesObj) {
    const priceMap: Record<string, number | null | undefined> = {
      monthly: addon.recurringPricesObj.monthly,
      quarterly: addon.recurringPricesObj.quarterly,
      'semi-annual': addon.recurringPricesObj.semiAnnual,
      yearly: addon.recurringPricesObj.yearly,
    };
    const price = priceMap[cycle];
    if (price !== null && price !== undefined) {
      return price;
    }
    if (priceMap.monthly !== null && priceMap.monthly !== undefined) {
      return priceMap.monthly;
    }
  }
  // Fallback: use base price with multiplier
  const multiplier = billingMultipliers[cycle] || 1;
  return addon.price * multiplier;
};

// Device names from the Excel sheet
const deviceNames = [
  'Stream OS',
  'AI-Box',
  'AI Licenses'
];

// AMC names from the Excel sheet
const amcNames = [
  'Cyber + Pack (Stream OS)',
  'Cyber + Pack (AI-Box & AI License)'
];

export function OnPremiseConfigurator({ onPremiseProduct }: OnPremiseConfiguratorProps) {
  const router = useRouter();
  const { addItem: addToCart } = useCartStore();
  
  // Transform addons from the product
  const onPremiseAddons = transformAddons(onPremiseProduct.addons);
  
  // State for addon quantities
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  
  // Billing cycle state - default to yearly for on-premise
  const [billingCycle, setBillingCycle] = useState<string>("yearly");
  
  // Filter addons by category
  const deviceAddons = useMemo(() => {
    return onPremiseAddons.filter(addon => 
      deviceNames.some(name => addon.name?.includes(name))
    );
  }, [onPremiseAddons]);
  
  const amcAddons = useMemo(() => {
    return onPremiseAddons.filter(addon => 
      amcNames.some(name => addon.name?.includes(name))
    );
  }, [onPremiseAddons]);
  
  const subscriptionAddons = useMemo(() => {
    // Find subscription-related addons (not devices, not AMC, not setup)
    return onPremiseAddons.filter(addon => {
      const isDevice = deviceNames.some(name => addon.name?.includes(name));
      const isAmc = amcNames.some(name => addon.name?.includes(name));
      const isSetup = addon.name?.includes('Setup') || addon.name?.includes('Implementation');
      return !isDevice && !isAmc && !isSetup;
    });
  }, [onPremiseAddons]);
  
  const setupAddon = useMemo(() => {
    return onPremiseAddons.find(addon => 
      addon.name?.includes('Setup') || addon.name?.includes('Implementation')
    );
  }, [onPremiseAddons]);
  
  // Toggle addon selection
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
  
  // Update quantity
  const updateQuantity = (addonId: string, delta: number) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0;
      const newQty = Math.max(0, Math.min(100, currentQty + delta));
      return { ...prev, [addonId]: newQty };
    });
  };
  
  // Calculate totals
  const deviceTotal = useMemo(() => {
    return deviceAddons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0;
      if (qty === 0) return sum;
      return sum + (addon.price * qty);
    }, 0);
  }, [deviceAddons, addonQuantities]);
  
  const amcTotal = useMemo(() => {
    return amcAddons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0;
      if (qty === 0) return sum;
      const price = getAddonPriceForCycle(addon, billingCycle);
      return sum + (price * qty);
    }, 0);
  }, [amcAddons, addonQuantities, billingCycle]);
  
  const subscriptionTotal = useMemo(() => {
    return subscriptionAddons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0;
      if (qty === 0) return sum;
      const price = getAddonPriceForCycle(addon, billingCycle);
      return sum + (price * qty);
    }, 0);
  }, [subscriptionAddons, addonQuantities, billingCycle]);
  
  const setupFee = setupAddon ? (addonQuantities[setupAddon.id] || 0) * setupAddon.price : 0;
  
  const totalPrice = deviceTotal + amcTotal + subscriptionTotal + setupFee;
  
  const handleAddToCart = () => {
    // Get all selected addons
    const allSelectedAddons = onPremiseAddons
      .filter(addon => (addonQuantities[addon.id] || 0) > 0)
      .map(addon => ({
        addon: {
          id: addon.id,
          name: addon.name,
          price: addon.price,
        },
        quantity: addonQuantities[addon.id] || 1,
      }));
    
    if (allSelectedAddons.length === 0) return;
    
    // Add on-premise solution as a bundle item
    // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
    const cartItem = {
      product: {
        id: onPremiseProduct.id,
        slug: onPremiseProduct.slug,
        name: onPremiseProduct.name,
      } as any,
      quantity: 1,
      selectedAddons: allSelectedAddons,
      billingCycle: billingCycle.toUpperCase() as any,
      isRecurring: true,
      unitPrice: totalPrice,
      totalPrice: totalPrice,
      recurringAmount: amcTotal + subscriptionTotal,
      variantId: undefined,
    };
    
    addToCart(cartItem as any);
    router.push("/cart");
  };
  
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column: Products */}
        <div className="lg:col-span-3 space-y-8">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">On-Premise Solution</h2>
            <p className="text-gray-500">
              Self-hosted video surveillance system with local storage and control.
            </p>
          </div>
          
          {/* Billing Cycle Selector - Separate Box */}
          <div className="mb-6">
            <Card className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Cycle</h3>
                <div className="space-y-2">
                  {['monthly', 'quarterly', 'semi-annual', 'yearly'].map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center justify-between ${
                        billingCycle === cycle
                          ? 'border-[#C62828] bg-red-50 text-[#C62828] shadow-sm'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === cycle
                            ? 'border-[#C62828] bg-[#C62828]'
                            : 'border-gray-300'
                        }`}>
                          {billingCycle === cycle && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium text-sm">
                          {cycle === 'monthly' && 'Monthly'}
                          {cycle === 'quarterly' && 'Quarterly'}
                          {cycle === 'semi-annual' && 'Semi-Annual'}
                          {cycle === 'yearly' && 'Yearly'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* DEVICES Section */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b">
              <h3 className="text-base font-semibold text-gray-900">Devices</h3>
            </div>
            
            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-xs text-gray-500 font-medium">
              <div className="col-span-5">Name</div>
              <div className="col-span-2 text-center">Unit</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Price</div>
            </div>
            
            {/* Device Rows */}
            {deviceAddons.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No devices available. Please add Stream OS, AI-Box, and AI Licenses products.
              </div>
            ) : (
              deviceAddons.map((addon) => {
                const isSelected = (addonQuantities[addon.id] || 0) > 0;
                const qty = addonQuantities[addon.id] || 0;
                const totalPrice = addon.price * qty;
                
                return (
                  <div 
                    key={addon.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                      isSelected ? 'bg-red-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <button
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-[#C62828] border-[#C62828] text-white' 
                            : 'border-gray-300 hover:border-[#C62828]'
                        }`}
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                        {addon.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{addon.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-center text-sm text-gray-500">
                      {addon.unit || 'one-time'}
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(addon.id, -1)}
                          disabled={qty <= 0}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-colors ${
                            qty <= 0
                              ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-medium text-sm min-w-[20px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(addon.id, 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatPrice(totalPrice)}
                        </div>
                        {qty > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatPrice(addon.price)} one-time
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Annual Maintenance Cost Section */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b">
              <h3 className="text-base font-semibold text-gray-900">Annual Maintenance Cost [AMC] After 3 Years</h3>
            </div>
            
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-xs text-gray-500 font-medium">
              <div className="col-span-5">Name</div>
              <div className="col-span-2 text-center">Unit</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Price</div>
            </div>
            
            {amcAddons.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No AMC products available.
              </div>
            ) : (
              amcAddons.map((addon) => {
                const isSelected = (addonQuantities[addon.id] || 0) > 0;
                const addonPrice = getAddonPriceForCycle(addon, billingCycle);
                const qty = addonQuantities[addon.id] || 0;
                const totalPrice = addonPrice * qty;
                
                return (
                  <div 
                    key={addon.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                      isSelected ? 'bg-red-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <button
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-[#C62828] border-[#C62828] text-white' 
                            : 'border-gray-300 hover:border-[#C62828]'
                        }`}
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                      <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-center text-sm text-gray-500">
                      {addon.unit || 'per year'}
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(addon.id, -1)}
                          disabled={qty <= 0}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-colors ${
                            qty <= 0
                              ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-medium text-sm min-w-[20px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(addon.id, 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatPrice(totalPrice)}
                        </div>
                        {qty > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatPrice(addonPrice)}/year
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Annually Subscription Charges */}
          {subscriptionAddons.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b">
                <h3 className="text-base font-semibold text-gray-900">Annually Subscription Charges</h3>
              </div>
              
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-xs text-gray-500 font-medium">
                <div className="col-span-5">Name</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Price</div>
              </div>
              
              {subscriptionAddons.map((addon) => {
                const isSelected = (addonQuantities[addon.id] || 0) > 0;
                const addonPrice = getAddonPriceForCycle(addon, billingCycle);
                const qty = addonQuantities[addon.id] || 0;
                const totalPrice = addonPrice * qty;
                
                return (
                  <div 
                    key={addon.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                      isSelected ? 'bg-red-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <button
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-[#C62828] border-[#C62828] text-white' 
                            : 'border-gray-300 hover:border-[#C62828]'
                        }`}
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                      <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-center text-sm text-gray-500">
                      {addon.unit || 'per year'}
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(addon.id, -1)}
                          disabled={qty <= 0}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-colors ${
                            qty <= 0
                              ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-medium text-sm min-w-[20px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQuantity(addon.id, 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatPrice(totalPrice)}
                        </div>
                        {qty > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatPrice(addonPrice)}/year
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Setup & Implementation Cost */}
          {setupAddon && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b">
                <h3 className="text-base font-semibold text-gray-900">One Time Setup & Implementation Cost</h3>
              </div>
              
              <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100">
                <div className="col-span-5 flex items-center gap-3">
                  <button
                    onClick={() => toggleAddon(setupAddon.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      (addonQuantities[setupAddon.id] || 0) > 0
                        ? 'bg-[#C62828] border-[#C62828] text-white' 
                        : 'border-gray-300 hover:border-[#C62828]'
                    }`}
                  >
                    {(addonQuantities[setupAddon.id] || 0) > 0 && <span className="text-xs">✓</span>}
                  </button>
                  <span className="text-sm font-medium text-gray-900">{setupAddon.name}</span>
                </div>
                
                <div className="col-span-2 flex items-center justify-center text-sm text-gray-500">
                  one-time
                </div>
                
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAddon(setupAddon.id)}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-colors ${
                        (addonQuantities[setupAddon.id] || 0) > 0
                          ? 'border-[#C62828] bg-[#C62828] text-white'
                          : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {(addonQuantities[setupAddon.id] || 0) > 0 ? '✓' : '+'}
                    </button>
                    <span className="font-medium text-sm min-w-[20px] text-center">
                      {addonQuantities[setupAddon.id] || 0}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-3 flex items-center justify-end">
                  <div className="font-semibold text-gray-900 text-sm">
                    {formatPrice(setupFee)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              {deviceTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Devices (One-time)</span>
                  <span className="font-medium text-gray-900">{formatPrice(deviceTotal)}</span>
                </div>
              )}
              {amcTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">AMC (Annual)</span>
                  <span className="font-medium text-gray-900">{formatPrice(amcTotal)}/year</span>
                </div>
              )}
              {subscriptionTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subscription (Annual)</span>
                  <span className="font-medium text-gray-900">{formatPrice(subscriptionTotal)}/year</span>
                </div>
              )}
              {setupFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Setup (One-time)</span>
                  <span className="font-medium text-gray-900">{formatPrice(setupFee)}</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-xl">{formatPrice(totalPrice)}</div>
                  <div className="text-xs text-gray-500">
                    {amcTotal + subscriptionTotal > 0 ? `${formatPrice(amcTotal + subscriptionTotal)}/year` : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={totalPrice === 0}
              className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
