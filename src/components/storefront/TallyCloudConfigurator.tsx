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
  quantity?: number;
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
  billingPlans?: BillingPlan[];
}

export function TallyCloudConfigurator({
  productId,
  productSlug,
  productName = "Tally Cloud Server",
  productDescription = "Enterprise-grade cloud hosting for Tally Prime",
  basePrice = 4500,
  addons = [],
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
      .map((addon) => ({
        ...addon,
        quantity: addonQuantities[addon.id] || 0,
      }));
  }, [addons, addonQuantities]);

  const addonsTotal = useMemo(() => {
    return addons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0;
      return sum + (addon.price * qty);
    }, 0);
  }, [addons, addonQuantities]);

  const totalPrice = selectedPlan.price + addonsTotal;

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
      recurringAmount: selectedPlan.price,
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
              {addons.map((addon) => {
                const qty = addonQuantities[addon.id] || 0;
                return (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      qty > 0 
                        ? "border-[#C62828] bg-red-50/40 shadow-sm" 
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          qty > 0 ? "bg-[#C62828] border-[#C62828]" : "border-gray-300 bg-white"
                        }`}
                      >
                        {qty > 0 && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{addon.name}</div>
                        {addon.description && (
                          <div className="text-sm text-gray-500 mt-0.5">{addon.description}</div>
                        )}
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
                          {qty > 0 ? formatPrice(addon.price * qty) : `+${formatPrice(addon.price)}`}
                        </div>
                        {addon.unit && qty === 0 && (
                          <div className="text-xs text-gray-400">{addon.unit}</div>
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
          {/* Billing Plans */}
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

          {/* Order Summary */}
          <Card className="border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 text-lg">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{selectedPlan.label}</span>
                  <span className="font-medium text-gray-900">{formatPrice(selectedPlan.price)}</span>
                </div>

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
