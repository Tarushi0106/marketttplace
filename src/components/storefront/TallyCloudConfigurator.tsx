"use client";

import { useState, useMemo } from "react";
import { Check, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface Addon {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit?: string | null;
}

interface BillingPlan {
  id: string;
  label: string;
  period: string;
  price: number;
  savings?: number;
}

interface TallyCloudConfiguratorProps {
  productName?: string;
  productDescription?: string;
  basePrice: number;
  addons: Addon[];
  billingPlans?: BillingPlan[];
  onAddToCart?: (data: {
    billingPlan: BillingPlan;
    selectedAddons: Addon[];
    totalPrice: number;
  }) => void;
}

export function TallyCloudConfigurator({
  productName = "Tally Cloud Server",
  productDescription = "Enterprise-grade cloud hosting for Tally Prime with seamless integration",
  basePrice = 4500,
  addons = [],
  billingPlans = [
    { id: "monthly", label: "Monthly", period: "/month", price: 4500 },
    { id: "quarterly", label: "Quarterly", period: "/quarter", price: 12900, savings: 6 },
    { id: "semi-annual", label: "Semi Annual", period: "/6 months", price: 24300, savings: 10 },
    { id: "yearly", label: "Yearly", period: "/year", price: 43200, savings: 20 },
  ],
  onAddToCart,
}: TallyCloudConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>(billingPlans[0]);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(addonId)) {
        newSet.delete(addonId);
      } else {
        newSet.add(addonId);
      }
      return newSet;
    });
  };

  const selectedAddonObjects = useMemo(() => {
    return addons.filter((addon) => selectedAddons.has(addon.id));
  }, [addons, selectedAddons]);

  const addonsTotal = useMemo(() => {
    return selectedAddonObjects.reduce((sum, addon) => sum + addon.price, 0);
  }, [selectedAddonObjects]);

  const totalPrice = selectedPlan.price + addonsTotal;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({
        billingPlan: selectedPlan,
        selectedAddons: selectedAddonObjects,
        totalPrice,
      });
    }
  };

  const steps = [
    { number: 1, title: "Billing Plan" },
    { number: 2, title: "Add-ons" },
    { number: 3, title: "Summary" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                  currentStep > step.number
                    ? "bg-green-500 text-white"
                    : currentStep === step.number
                    ? "bg-[#C62828] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? "text-gray-900" : "text-gray-400"
                } hidden sm:inline`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Billing Plan */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Select a billing cycle that works best for you</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {billingPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedPlan.id === plan.id
                        ? "border-[#C62828] bg-red-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {plan.savings && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Save {plan.savings}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-900">{plan.label}</span>
                      {selectedPlan.id === plan.id && (
                        <div className="w-5 h-5 rounded-full bg-[#C62828] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                      <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <div className="mt-2 text-sm text-green-600">
                        Save {formatPrice(plan.price * (plan.savings / 100) * (plan.id === "quarterly" ? 3 : plan.id === "semi-annual" ? 6 : 12))} per year
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Add-ons */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhance Your Plan</h2>
                <p className="text-gray-600">Choose optional add-ons to enhance your experience</p>
              </div>

              {addons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No add-ons available for this product</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                        selectedAddons.has(addon.id)
                          ? "border-[#C62828] bg-red-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            selectedAddons.has(addon.id)
                              ? "bg-[#C62828] border-[#C62828]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddons.has(addon.id) && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{addon.name}</div>
                          {addon.description && (
                            <div className="text-sm text-gray-500 mt-1">{addon.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            +{formatPrice(addon.price)}
                            {addon.unit && <span className="text-sm font-normal text-gray-500"> {addon.unit}</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Order Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h2>
                <p className="text-gray-600">Confirm your selections before adding to cart</p>
              </div>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  {/* Selected Plan */}
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">{selectedPlan.label} Plan</div>
                      <div className="text-sm text-gray-500">Billed {selectedPlan.period}</div>
                    </div>
                    <div className="font-semibold text-gray-900">{formatPrice(selectedPlan.price)}</div>
                  </div>

                  {/* Selected Add-ons */}
                  {selectedAddonObjects.length > 0 && (
                    <div className="pb-4 border-b border-gray-100">
                      <div className="font-medium text-gray-900 mb-3">Add-ons</div>
                      {selectedAddonObjects.map((addon) => (
                        <div key={addon.id} className="flex justify-between items-center py-2">
                          <span className="text-gray-600">{addon.name}</span>
                          <span className="font-medium text-gray-900">{formatPrice(addon.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="font-semibold text-gray-900">Total</div>
                    <div className="text-2xl font-bold text-[#C62828]">{formatPrice(totalPrice)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-6"
            >
              Back
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                className="bg-[#C62828] hover:bg-[#8B1D1D] px-6"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleAddToCart}
                className="bg-[#C62828] hover:bg-[#8B1D1D] px-8"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Always visible summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#C62828] to-[#8B1D1D] px-6 py-4">
              <h3 className="font-semibold text-white">{productName}</h3>
              <p className="text-red-100 text-sm mt-1">{productDescription}</p>
            </div>
            <CardContent className="p-6 space-y-4">
              {/* Current Step Summary */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Selected Plan</div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{selectedPlan.label}</span>
                  <span className="text-gray-900">{formatPrice(selectedPlan.price)}</span>
                </div>
              </div>

              {selectedAddons.size > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    Add-ons ({selectedAddons.size})
                  </div>
                  <div className="space-y-1">
                    {selectedAddonObjects.map((addon) => (
                      <div key={addon.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{addon.name}</span>
                        <span className="text-gray-900">{formatPrice(addon.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#C62828]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
