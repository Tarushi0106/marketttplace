"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, Info, RefreshCw, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RecurringBillingSectionProps {
  productId: string;
  variantId?: string;
  basePrice: number;
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

  // Check if any recurring prices are configured
  const hasRecurringPrices = useCallback((): boolean => {
    return (
      monthlyPrice !== undefined ||
      biMonthlyPrice !== undefined ||
      quarterlyPrice !== undefined ||
      fourMonthlyPrice !== undefined ||
      semiAnnualPrice !== undefined ||
      triAnnualPrice !== undefined ||
      yearlyPrice !== undefined ||
      biennialPrice !== undefined ||
      triennialPrice !== undefined
    );
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
  const prevBillingCycle = useRef<BillingCycleType | null>(null);

  // Notify parent of changes whenever billingCycle changes
  useEffect(() => {
    // Only notify on first render or when billingCycle actually changes
    // This avoids infinite loops from re-renders
    if (!isFirstRender.current && prevBillingCycle.current === billingCycle) {
      return; // billingCycle hasn't changed, skip
    }

    // Use the current billingCycle value from props/state
    const cyclePrice = getPriceForCycle(billingCycle) || basePrice;
    const savings = getSavingsForCycle(billingCycle) || 0;
    const setupFee = getSetupFeeForCycle(billingCycle);

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

    prevBillingCycle.current = billingCycle;
    isFirstRender.current = false;

    onRecurringChange({
      enabled: true,
      billingCycle,
      setupFee,
      pricePerCycle: cyclePrice,
      totalForPeriod: cyclePrice + setupFee,
      savingsPercentage: savings,
      monthlyEquivalent,
    });
  }, [billingCycle, basePrice, getPriceForCycle, getSavingsForCycle, getSetupFeeForCycle]);

  const pricing = getPricing();
  const currentSetupFee = getSetupFeeForCycle(billingCycle);

  // Build list of available billing cycles based on configured prices
  const availableCycles: BillingCycleType[] = [];
  if (monthlyPrice !== undefined) availableCycles.push("MONTHLY");
  if (biMonthlyPrice !== undefined) availableCycles.push("BIMONTHLY");
  if (quarterlyPrice !== undefined) availableCycles.push("QUARTERLY");
  if (fourMonthlyPrice !== undefined) availableCycles.push("FOUR_MONTHLY");
  if (semiAnnualPrice !== undefined) availableCycles.push("SEMI_ANNUAL");
  if (triAnnualPrice !== undefined) availableCycles.push("TRI_ANNUAL");
  if (yearlyPrice !== undefined) availableCycles.push("YEARLY");
  if (biennialPrice !== undefined) availableCycles.push("BIENNIAL");
  if (triennialPrice !== undefined) availableCycles.push("TRIENNIAL");

  // If no cycles configured, show nothing
  if (!hasRecurringPrices()) {
    return null;
  }

  return (
    <Card className="border-2 border-[#8B1D1D]/20">
      <CardHeader className="bg-[#8B1D1D]/05 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5 text-[#8B1D1D]" />
          Recurring Billing
          <Badge variant="default" className="bg-green-600">
            Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Billing Frequency Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select Billing Frequency</Label>
          <RadioGroup
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as BillingCycleType)}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {availableCycles.map((cycle: BillingCycleType) => {
              const cyclePrice = getPriceForCycle(cycle) || 0;
              const cycleSavings = getSavingsForCycle(cycle);
              const cycleSetupFee = cycle === billingCycle ? currentSetupFee : getSetupFeeForCycle(cycle);

              return (
                <div
                  key={cycle}
                  className={`flex items-start space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    billingCycle === cycle
                      ? "border-[#8B1D1D] bg-[#8B1D1D]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value={cycle} id={cycle} className="mt-1" />
                  <Label htmlFor={cycle} className="cursor-pointer flex-1">
                    <div className="font-medium">{BILLING_CYCLE_LABELS[cycle]}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {BILLING_CYCLE_DESCRIPTIONS[cycle]}
                    </div>
                    <div className="text-sm font-semibold text-[#8B1D1D] mt-2">
                      {formatCurrency(cyclePrice)}
                      {BILLING_CYCLE_PERIODS[cycle]}
                    </div>
                    {cycleSavings !== undefined && cycleSavings > 0 && (
                      <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                        Save {cycleSavings}%
                      </Badge>
                    )}
                    {cycleSetupFee > 0 && (
                      <div className="text-xs text-amber-600 mt-1">
                        + {formatCurrency(cycleSetupFee)} setup fee
                      </div>
                    )}
                  </Label>
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
                {formatCurrency(currentSetupFee)}
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
            <span className="text-2xl font-bold text-[#8B1D1D]">
              {formatCurrency(pricing.pricePerCycle)}
              {pricing.periodLabel}
            </span>
          </div>
          {pricing.savingsPercentage > 0 && (
            <div className="text-sm text-green-600 mt-1">
              You save {pricing.savingsPercentage}% compared to monthly billing
            </div>
          )}
        </div>

        <Separator />

        {/* Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">Recurring Billing Benefits:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Never run out of service - automatic renewal</li>
                <li>No manual repurchasing required</li>
                <li>Lock in your current price (subject to terms)</li>
                <li>Easy cancellation anytime from your account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Important:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Your payment method will be stored securely</li>
                <li>You will receive email reminders before each billing</li>
                <li>You can pause or cancel anytime from your account</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
