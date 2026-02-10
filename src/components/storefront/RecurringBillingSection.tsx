"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CreditCard, AlertCircle, Info, RefreshCw, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RecurringBillingSectionProps {
  productId: string;
  variantId?: string;
  basePrice: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  onRecurringChange: (data: RecurringData) => void;
}

export interface RecurringData {
  enabled: boolean;
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
  preferredTime: string;
  preferredDay: number;
  autoRenew: boolean;
  // Calculated pricing
  pricePerCycle: number;
  totalForPeriod: number;
  savingsPercentage: number;
  monthlyEquivalent: number;
}

const BILLING_CYCLE_LABELS = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const BILLING_CYCLE_DESCRIPTIONS = {
  MONTHLY: "Billed every month - flexible and easy to cancel",
  QUARTERLY: "Billed every 3 months - save 5% compared to monthly",
  YEARLY: "Billed every 12 months - save 15% compared to monthly",
};

const TIME_PREFERENCES = [
  { value: "00:00", label: "12:00 AM (Midnight)" },
  { value: "06:00", label: "6:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "12:00", label: "12:00 PM (Noon)" },
  { value: "14:00", label: "2:00 PM" },
  { value: "18:00", label: "6:00 PM" },
];

const DAY_PREFERENCES = Array.from({ length: 28 }, (_, i) => ({
  value: String(i + 1),
  label: `Day ${i + 1}`,
}));

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
  monthlyPrice,
  yearlyPrice,
  onRecurringChange,
}: RecurringBillingSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "QUARTERLY" | "YEARLY">("MONTHLY");
  const [preferredTime, setPreferredTime] = useState("10:00");
  const [preferredDay, setPreferredDay] = useState(1);
  const [autoRenew, setAutoRenew] = useState(true);

  // Calculate prices based on billing cycle
  // The basePrice prop includes all configurations and addons
  const getPricing = useCallback((): PricingInfo => {
    if (!enabled) {
      return {
        pricePerCycle: basePrice,
        totalForPeriod: basePrice,
        savingsPercentage: 0,
        monthlyEquivalent: basePrice,
        periodLabel: '/one-time',
      };
    }

    const monthly = monthlyPrice || basePrice;
    const yearlyFromMonthly = monthly * 12;
    const quarterlyFromMonthly = monthly * 3;

    // Calculate savings based on yearlyPrice if provided
    let yearlyTotal: number;
    let savingsPct: number;

    if (yearlyPrice && yearlyPrice > 0) {
      // Use the explicitly set yearly price
      yearlyTotal = Number(yearlyPrice);
      savingsPct = Math.round(((yearlyFromMonthly - yearlyTotal) / yearlyFromMonthly) * 100);
    } else {
      // Calculate from monthly with default 15% discount
      yearlyTotal = yearlyFromMonthly * 0.85;
      savingsPct = 15;
    }

    const quarterlyTotal = quarterlyFromMonthly * 0.95; // 5% discount for quarterly

    switch (billingCycle) {
      case "MONTHLY":
        return {
          pricePerCycle: monthly,
          totalForPeriod: monthly,
          savingsPercentage: 0,
          monthlyEquivalent: monthly,
          periodLabel: '/mo',
        };
      case "QUARTERLY":
        return {
          pricePerCycle: quarterlyTotal,
          totalForPeriod: quarterlyTotal,
          savingsPercentage: 5,
          monthlyEquivalent: quarterlyTotal / 3,
          periodLabel: '/quarter',
        };
      case "YEARLY":
        return {
          pricePerCycle: yearlyTotal,
          totalForPeriod: yearlyTotal,
          savingsPercentage: savingsPct,
          monthlyEquivalent: yearlyTotal / 12,
          periodLabel: '/year',
        };
      default:
        return {
          pricePerCycle: basePrice,
          totalForPeriod: basePrice,
          savingsPercentage: 0,
          monthlyEquivalent: basePrice,
          periodLabel: '/one-time',
        };
    }
  }, [enabled, billingCycle, basePrice, monthlyPrice, yearlyPrice]);

  const isFirstRender = useRef(true);

  // Memoize the callback to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRecurringChange = useCallback(() => {
    const pricing = getPricing();
    onRecurringChange({
      enabled,
      billingCycle,
      preferredTime,
      preferredDay,
      autoRenew,
      pricePerCycle: pricing.pricePerCycle,
      totalForPeriod: pricing.totalForPeriod,
      savingsPercentage: pricing.savingsPercentage,
      monthlyEquivalent: pricing.monthlyEquivalent,
    });
  }, [enabled, billingCycle, preferredTime, preferredDay, autoRenew, onRecurringChange, getPricing]);

  // Notify parent of changes (only after first render and when data changes)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleRecurringChange();
  }, [handleRecurringChange]);

  // Calculate next billing date based on preferences
  const getNextBillingDate = () => {
    const now = new Date();
    let nextDate = new Date(now);
    
    if (billingCycle === "MONTHLY") {
      nextDate.setDate(preferredDay);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (billingCycle === "QUARTERLY") {
      nextDate.setDate(preferredDay);
      const currentMonth = nextDate.getMonth();
      nextDate.setMonth(currentMonth + 3);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 3);
      }
    } else {
      nextDate.setDate(preferredDay);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      if (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }

    // Set preferred time
    const [hours, minutes] = preferredTime.split(":");
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pricing = getPricing();

  return (
    <Card className="border-2 border-[#8B1D1D]/20">
      <CardHeader className="bg-[#8B1D1D]/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5 text-[#8B1D1D]" />
          Recurring Billing
          {enabled && (
            <Badge variant="default" className="bg-green-600">
              Enabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id="recurring-enabled"
              checked={enabled}
              onCheckedChange={(checked) => setEnabled(checked === true)}
            />
            <Label htmlFor="recurring-enabled" className="cursor-pointer">
              Enable automatic recurring billing
            </Label>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#8B1D1D]">
              {formatCurrency(pricing.pricePerCycle)}
            </span>
            <span className="text-gray-500">{pricing.periodLabel}</span>
          </div>
        </div>

        {enabled && (
          <>
            <Separator />

            {/* Billing Cycle Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Billing Frequency</Label>
              <RadioGroup
                value={billingCycle}
                onValueChange={(value) => setBillingCycle(value as "MONTHLY" | "QUARTERLY" | "YEARLY")}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {["MONTHLY", "QUARTERLY", "YEARLY"].map((cycle) => (
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
                      <div className="font-medium">{BILLING_CYCLE_LABELS[cycle as keyof typeof BILLING_CYCLE_LABELS]}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {BILLING_CYCLE_DESCRIPTIONS[cycle as keyof typeof BILLING_CYCLE_DESCRIPTIONS]}
                      </div>
                      {cycle !== "MONTHLY" && (
                        <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                          Save {cycle === "QUARTERLY" ? "5%" : "15%"}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Scheduling Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-gray-600" />
                <Label className="text-base font-medium">Scheduling Preferences</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preferred Day (for monthly) */}
                <div className="space-y-2">
                  <Label htmlFor="preferred-day" className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Preferred Billing Day
                  </Label>
                  <Select value={String(preferredDay)} onValueChange={(value) => setPreferredDay(parseInt(value))}>
                    <SelectTrigger id="preferred-day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_PREFERENCES.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Your card will be charged on this day each {billingCycle === "MONTHLY" ? "month" : billingCycle === "QUARTERLY" ? "quarter" : "year"}
                  </p>
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <Label htmlFor="preferred-time" className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Preferred Billing Time
                  </Label>
                  <Select value={preferredTime} onValueChange={setPreferredTime}>
                    <SelectTrigger id="preferred-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PREFERENCES.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    The system will attempt to charge your card at this time
                  </p>
                </div>
              </div>

              {/* Next Billing Date Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Next Billing Date</div>
                    <div className="text-blue-700 text-lg font-semibold mt-1">
                      {getNextBillingDate()}
                    </div>
                    <div className="text-blue-600 text-sm mt-1">
                      Amount: {formatCurrency(pricing.pricePerCycle)}{pricing.periodLabel} will be automatically charged
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Auto Renew Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="auto-renew"
                  checked={autoRenew}
                  onCheckedChange={(checked) => setAutoRenew(checked === true)}
                />
                <Label htmlFor="auto-renew" className="cursor-pointer">
                  <div className="font-medium">Auto-Renew</div>
                  <div className="text-sm text-gray-500">
                    Automatically renew at the end of each billing cycle
                  </div>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {autoRenew ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

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
                    {pricing.savingsPercentage > 0 && (
                      <li className="font-medium text-green-700">
                        Save {pricing.savingsPercentage}% compared to monthly billing
                      </li>
                    )}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
