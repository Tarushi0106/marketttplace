"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, RefreshCw, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface RecurringBillingSectionProps {
  productId: string;
  variantId?: string;
  basePrice: number;
  // Billing type: ONE_TIME or RECURRING
  billingType?: "ONE_TIME" | "RECURRING";
  // Per-billing-frequency setup fees
  monthlySetupFee?: number;
  biMonthlySetupFee?: number;
  quarterlySetupFee?: number;
  fourMonthlySetupFee?: number;
  semiAnnualSetupFee?: number;
  triAnnualSetupFee?: number;
  yearlySetupFee?: number;
  biennialSetupFee?: number;
  triennialSetupFee?: number;
  // Per-billing-frequency prices
  monthlyPrice?: number;
  biMonthlyPrice?: number;
  quarterlyPrice?: number;
  fourMonthlyPrice?: number;
  semiAnnualPrice?: number;
  triAnnualPrice?: number;
  yearlyPrice?: number;
  biennialPrice?: number;
  triennialPrice?: number;
  monthlySavings?: number;
  quarterlySavings?: number;
  yearlySavings?: number;
  onRecurringChange: (data: RecurringData) => void;
}

export interface RecurringData {
  enabled: boolean;
  billingCycle: BillingCycleType;
  // Calculated pricing
  setupFee: number;
  pricePerCycle: number;
  totalForPeriod: number;
  savingsPercentage: number;
  monthlyEquivalent: number;
}

export type BillingCycleType = 
  | "MONTHLY" 
  | "BIMONTHLY" 
  | "QUARTERLY" 
  | "FOUR_MONTHLY" 
  | "SEMI_ANNUAL" 
  | "TRI_ANNUAL" 
  | "YEARLY" 
  | "BIENNIAL" 
  | "TRIENNIAL";

const BILLING_CYCLE_LABELS: Record<BillingCycleType, string> = {
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

const BILLING_CYCLE_PERIODS: Record<BillingCycleType, string> = {
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

const BILLING_CYCLE_DESCRIPTIONS: Record<BillingCycleType, string> = {
  MONTHLY: "Billed every month - flexible and easy to cancel",
  BIMONTHLY: "Billed every 2 months",
  QUARTERLY: "Billed every 3 months",
  FOUR_MONTHLY: "Billed every 4 months",
  SEMI_ANNUAL: "Billed every 6 months",
  TRI_ANNUAL: "Billed 3 times per year",
  YEARLY: "Billed every 12 months",
  BIENNIAL: "Billed every 2 years",
  TRIENNIAL: "Billed every 3 years",
};

interface PricingInfo {
  pricePerCycle: number;
  totalForPeriod: number;
  savingsPercentage: number;
  monthlyEquivalent: number;
  periodLabel: string;
}

export function RecurringBillingSection({
  productId,
  variantId,
  basePrice,
  billingType = "RECURRING",
  monthlySetupFee,
  biMonthlySetupFee,
  quarterlySetupFee,
  fourMonthlySetupFee,
  semiAnnualSetupFee,
  triAnnualSetupFee,
  yearlySetupFee,
  biennialSetupFee,
  triennialSetupFee,
  monthlyPrice,
  biMonthlyPrice,
  quarterlyPrice,
  fourMonthlyPrice,
  semiAnnualPrice,
  triAnnualPrice,
  yearlyPrice,
  biennialPrice,
  triennialPrice,
  monthlySavings,
  quarterlySavings,
  yearlySavings,
  onRecurringChange,
}: RecurringBillingSectionProps) {
  // Recurring is compulsory when admin has set recurring prices
  const [billingCycle, setBillingCycle] = useState<BillingCycleType>("MONTHLY");

  // Debug logging
  console.log("[RecurringBillingSection] Props received:", {
    billingType,
    monthlyPrice,
    quarterlyPrice,
    monthlySetupFee,
    quarterlySetupFee,
  });

  // Check if any recurring prices are configured
  const hasRecurringPrices = useCallback((): boolean => {
    const result = (
      (monthlyPrice !== undefined && monthlyPrice !== null && Number(monthlyPrice) > 0) ||
      (biMonthlyPrice !== undefined && biMonthlyPrice !== null && Number(biMonthlyPrice) > 0) ||
      (quarterlyPrice !== undefined && quarterlyPrice !== null && Number(quarterlyPrice) > 0) ||
      (fourMonthlyPrice !== undefined && fourMonthlyPrice !== null && Number(fourMonthlyPrice) > 0) ||
      (semiAnnualPrice !== undefined && semiAnnualPrice !== null && Number(semiAnnualPrice) > 0) ||
      (triAnnualPrice !== undefined && triAnnualPrice !== null && Number(triAnnualPrice) > 0) ||
      (yearlyPrice !== undefined && yearlyPrice !== null && Number(yearlyPrice) > 0) ||
      (biennialPrice !== undefined && biennialPrice !== null && Number(biennialPrice) > 0) ||
      (triennialPrice !== undefined && triennialPrice !== null && Number(triennialPrice) > 0)
    );
    console.log("[RecurringBillingSection] hasRecurringPrices result:", result, {
      monthlyPriceCheck: monthlyPrice !== undefined && monthlyPrice !== null && Number(monthlyPrice) > 0,
      quarterlyPriceCheck: quarterlyPrice !== undefined && quarterlyPrice !== null && Number(quarterlyPrice) > 0,
    });
    return result;
  }, [monthlyPrice, biMonthlyPrice, quarterlyPrice, fourMonthlyPrice, semiAnnualPrice, triAnnualPrice, yearlyPrice, biennialPrice, triennialPrice]);

  // Get price for selected billing cycle
  const getPriceForCycle = useCallback((cycle: BillingCycleType): number | undefined => {
    switch (cycle) {
      case "MONTHLY": return monthlyPrice;
      case "BIMONTHLY": return biMonthlyPrice;
      case "QUARTERLY": return quarterlyPrice;
      case "FOUR_MONTHLY": return fourMonthlyPrice;
      case "SEMI_ANNUAL": return semiAnnualPrice;
      case "TRI_ANNUAL": return triAnnualPrice;
      case "YEARLY": return yearlyPrice;
      case "BIENNIAL": return biennialPrice;
      case "TRIENNIAL": return triennialPrice;
      default: return undefined;
    }
  }, [monthlyPrice, biMonthlyPrice, quarterlyPrice, fourMonthlyPrice, semiAnnualPrice, triAnnualPrice, yearlyPrice, biennialPrice, triennialPrice]);

  // Get setup fee for selected billing cycle
  const getSetupFeeForCycle = useCallback((cycle: BillingCycleType): number => {
    switch (cycle) {
      case "MONTHLY": return monthlySetupFee || 0;
      case "BIMONTHLY": return biMonthlySetupFee || 0;
      case "QUARTERLY": return quarterlySetupFee || 0;
      case "FOUR_MONTHLY": return fourMonthlySetupFee || 0;
      case "SEMI_ANNUAL": return semiAnnualSetupFee || 0;
      case "TRI_ANNUAL": return triAnnualSetupFee || 0;
      case "YEARLY": return yearlySetupFee || 0;
      case "BIENNIAL": return biennialSetupFee || 0;
      case "TRIENNIAL": return triennialSetupFee || 0;
      default: return 0;
    }
  }, [monthlySetupFee, biMonthlySetupFee, quarterlySetupFee, fourMonthlySetupFee, semiAnnualSetupFee, triAnnualSetupFee, yearlySetupFee, biennialSetupFee, triennialSetupFee]);

  // Get savings for selected billing cycle
  const getSavingsForCycle = useCallback((cycle: BillingCycleType): number | undefined => {
    switch (cycle) {
      case "MONTHLY": return monthlySavings;
      case "QUARTERLY": 
      case "BIMONTHLY":
      case "FOUR_MONTHLY":
      case "SEMI_ANNUAL":
      case "TRI_ANNUAL": return quarterlySavings;
      case "YEARLY": return yearlySavings;
      case "BIENNIAL":
      case "TRIENNIAL": return yearlySavings;
      default: return undefined;
    }
  }, [monthlySavings, quarterlySavings, yearlySavings]);

  // Calculate prices based on billing cycle
  const getPricing = useCallback((): PricingInfo => {
    const cyclePrice = getPriceForCycle(billingCycle) || basePrice;
    const savings = getSavingsForCycle(billingCycle) || 0;
    const setupFee = getSetupFeeForCycle(billingCycle);

    // Calculate monthly equivalent based on billing cycle
    let monthlyEquivalent: number;
    let periodLabel: string;

    switch (billingCycle) {
      case "MONTHLY":
        monthlyEquivalent = cyclePrice;
        periodLabel = '/month';
        break;
      case "BIMONTHLY":
        monthlyEquivalent = cyclePrice / 2;
        periodLabel = '/2 months';
        break;
      case "QUARTERLY":
        monthlyEquivalent = cyclePrice / 3;
        periodLabel = '/quarter';
        break;
      case "FOUR_MONTHLY":
        monthlyEquivalent = cyclePrice / 4;
        periodLabel = '/4 months';
        break;
      case "SEMI_ANNUAL":
        monthlyEquivalent = cyclePrice / 6;
        periodLabel = '/6 months';
        break;
      case "TRI_ANNUAL":
        monthlyEquivalent = cyclePrice / 3.69; // ~12/3.25 for 4 months avg
        periodLabel = '/4 months';
        break;
      case "YEARLY":
        monthlyEquivalent = cyclePrice / 12;
        periodLabel = '/year';
        break;
      case "BIENNIAL":
        monthlyEquivalent = cyclePrice / 24;
        periodLabel = '/2 years';
        break;
      case "TRIENNIAL":
        monthlyEquivalent = cyclePrice / 36;
        periodLabel = '/3 years';
        break;
      default:
        monthlyEquivalent = cyclePrice;
        periodLabel = '/cycle';
    }

    return {
      pricePerCycle: cyclePrice,
      totalForPeriod: cyclePrice + setupFee,
      savingsPercentage: savings,
      monthlyEquivalent,
      periodLabel,
    };
  }, [billingCycle, basePrice, getPriceForCycle, getSavingsForCycle, getSetupFeeForCycle]);

  const isFirstRender = useRef(true);

  // Notify parent of changes whenever billingCycle changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }

    // Use the current billingCycle value from state
    const cyclePrice = getPriceForCycle(billingCycle) ?? basePrice;
    const savings = getSavingsForCycle(billingCycle) ?? 0;
    const setupFee = getSetupFeeForCycle(billingCycle);

    console.log(`[RecurringBillingSection] Billing cycle changed to: ${billingCycle}, cyclePrice: ${cyclePrice}, setupFee: ${setupFee}`);

    // Calculate monthly equivalent
    let monthlyEquivalent: number;
    switch (billingCycle) {
      case "MONTHLY": monthlyEquivalent = cyclePrice; break;
      case "BIMONTHLY": monthlyEquivalent = cyclePrice / 2; break;
      case "QUARTERLY": monthlyEquivalent = cyclePrice / 3; break;
      case "FOUR_MONTHLY": monthlyEquivalent = cyclePrice / 4; break;
      case "SEMI_ANNUAL": monthlyEquivalent = cyclePrice / 6; break;
      case "TRI_ANNUAL": monthlyEquivalent = cyclePrice / 3.69; break;
      case "YEARLY": monthlyEquivalent = cyclePrice / 12; break;
      case "BIENNIAL": monthlyEquivalent = cyclePrice / 24; break;
      case "TRIENNIAL": monthlyEquivalent = cyclePrice / 36; break;
      default: monthlyEquivalent = cyclePrice;
    }

    onRecurringChange({
      enabled: true,
      billingCycle,
      setupFee,
      pricePerCycle: cyclePrice,
      totalForPeriod: cyclePrice + setupFee,
      savingsPercentage: savings,
      monthlyEquivalent,
    });
  }, [billingCycle, basePrice, getPriceForCycle, getSavingsForCycle, getSetupFeeForCycle, onRecurringChange]);

  const pricing = getPricing();
  const currentSetupFee = getSetupFeeForCycle(billingCycle);

  // Build list of available billing cycles based on configured prices (filter out undefined and 0 prices)
  const availableCycles: BillingCycleType[] = [];
  if (monthlyPrice !== undefined && monthlyPrice !== null && Number(monthlyPrice) > 0) availableCycles.push("MONTHLY");
  if (biMonthlyPrice !== undefined && biMonthlyPrice !== null && Number(biMonthlyPrice) > 0) availableCycles.push("BIMONTHLY");
  if (quarterlyPrice !== undefined && quarterlyPrice !== null && Number(quarterlyPrice) > 0) availableCycles.push("QUARTERLY");
  if (fourMonthlyPrice !== undefined && fourMonthlyPrice !== null && Number(fourMonthlyPrice) > 0) availableCycles.push("FOUR_MONTHLY");
  if (semiAnnualPrice !== undefined && semiAnnualPrice !== null && Number(semiAnnualPrice) > 0) availableCycles.push("SEMI_ANNUAL");
  if (triAnnualPrice !== undefined && triAnnualPrice !== null && Number(triAnnualPrice) > 0) availableCycles.push("TRI_ANNUAL");
  if (yearlyPrice !== undefined && yearlyPrice !== null && Number(yearlyPrice) > 0) availableCycles.push("YEARLY");
  if (biennialPrice !== undefined && biennialPrice !== null && Number(biennialPrice) > 0) availableCycles.push("BIENNIAL");
  if (triennialPrice !== undefined && triennialPrice !== null && Number(triennialPrice) > 0) availableCycles.push("TRIENNIAL");

  // Debug logging for render decision
  console.log("[RecurringBillingSection] Render decision:", {
    billingType,
    hasRecurringPrices: hasRecurringPrices(),
    availableCyclesCount: availableCycles.length,
    availableCycles,
  });

  // If billing type is ONE_TIME, don't show recurring billing UI
  // This check must come BEFORE the hasRecurringPrices check
  if (billingType === "ONE_TIME") {
    console.log("[RecurringBillingSection] Returning null because billingType is ONE_TIME");
    return null;
  }

  // If no cycles configured, show nothing
  if (!hasRecurringPrices()) {
    console.log("[RecurringBillingSection] Returning null because hasRecurringPrices is false");
    return null;
  }

  console.log("[RecurringBillingSection] Rendering the component");

  return (
    <Card className="border-2 border-[#1E2260]/20">
      <CardHeader className="bg-[#1E2260]/05 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5 text-[#1E2260]" />
          Recurring Billing
          <Badge variant="default" className="bg-green-600">
            Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Billing Frequency Selection - Vertical Style */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select Billing Frequency</Label>
          <RadioGroup
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as BillingCycleType)}
            className="space-y-2"
          >
            {availableCycles.map((cycle: BillingCycleType) => {
              const cyclePrice = getPriceForCycle(cycle) || 0;
              const cycleSavings = getSavingsForCycle(cycle);
              const cycleSetupFee = cycle === billingCycle ? currentSetupFee : getSetupFeeForCycle(cycle);

              return (
                <div
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gray-400 ${
                    billingCycle === cycle
                      ? "border-[#1E2260] bg-[#1E2260]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem 
                      value={cycle} 
                      id={cycle} 
                      className="w-5 h-5"
                    />
                    <Label htmlFor={cycle} className="cursor-pointer">
                      <span className="font-medium text-base">{BILLING_CYCLE_LABELS[cycle]}</span>
                    </Label>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#1E2260]">
                      {formatPrice(cyclePrice)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      {BILLING_CYCLE_PERIODS[cycle]}
                    </span>
                    {cycleSavings !== undefined && cycleSavings > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        Save {cycleSavings}%
                      </Badge>
                    )}
                    {cycleSetupFee > 0 && (
                      <div className="text-xs text-amber-600 mt-1">
                        + {formatPrice(cycleSetupFee)} setup fee
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <Separator />

        {/* Setup Fee Display for Selected Cycle */}
        {currentSetupFee > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
                <Label className="text-amber-800 font-medium">One-time Setup Fee</Label>
              </div>
              <span className="text-xl font-bold text-amber-700">
                {formatPrice(currentSetupFee)}
              </span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              This fee will be charged at the time of initial purchase
            </p>
          </div>
        )}

        <Separator />

        {/* Price Summary for Selected Cycle */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total per {BILLING_CYCLE_LABELS[billingCycle].toLowerCase()}</span>
            <span className="text-2xl font-bold text-[#1E2260]">
              {formatPrice(pricing.pricePerCycle)}
              {pricing.periodLabel}
            </span>
          </div>
          {pricing.savingsPercentage > 0 && (
            <div className="text-sm text-green-600 mt-1">
              You save {pricing.savingsPercentage}% compared to monthly billing
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { BILLING_CYCLE_LABELS, BILLING_CYCLE_PERIODS };
