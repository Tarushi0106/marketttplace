"use client";

import { useState } from "react";
import { ShoppingCart, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";

// ── SMB plans from XcellHost Excel ──────────────────────────────────────────
const SMB_PLANS = [
  {
    id: "M365-BB",
    name: "Microsoft 365 Business Basic",
    monthlyPerUser: 157.5,
    annualPerUser:  1795.5,
    description: "50 GB Mailbox | OneDrive | SharePoint | Teams · Web Office apps only",
  },
  {
    id: "M365-BS",
    name: "Microsoft 365 Business Standard",
    monthlyPerUser: 819,
    annualPerUser:  9336.6,
    description: "Desktop Office apps + business email + HD meetings + webinar hosting",
  },
  {
    id: "M365-BP",
    name: "Microsoft 365 Business Premium",
    monthlyPerUser: 1953,
    annualPerUser:  22264.2,
    description: "Everything in Standard + Defender + Intune + Azure AD Premium P1",
  },
  {
    id: "M365-AB",
    name: "Microsoft 365 Apps for Business",
    monthlyPerUser: 819,
    annualPerUser:  9336.6,
    description: "Desktop Office apps + 1 TB OneDrive · No email, no Teams",
  },
];

const BILLING_OPTIONS = [
  { value: "monthly",    label: "Monthly",     suffix: "/mo",       discount: 0,  billingCycle: "MONTHLY"     },
  { value: "quarterly",  label: "Quarterly",   suffix: "/quarter",  discount: 6,  billingCycle: "QUARTERLY"   },
  { value: "semiAnnual", label: "Semi-Annual", suffix: "/6 months", discount: 10, billingCycle: "SEMI_ANNUAL" },
  { value: "annual",     label: "Annual",      suffix: "/year",     discount: 5,  billingCycle: "YEARLY"      },
];

function getPrice(plan: typeof SMB_PLANS[0], cycle: string): number {
  switch (cycle) {
    case "monthly":    return plan.monthlyPerUser;
    case "quarterly":  return plan.monthlyPerUser * 3  * 0.94;
    case "semiAnnual": return plan.monthlyPerUser * 6  * 0.90;
    case "annual":     return plan.annualPerUser;
    default:           return plan.monthlyPerUser;
  }
}

function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function QtyControl({
  qty,
  onDecrease,
  onIncrease,
}: {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
      <button
        onClick={onDecrease}
        disabled={qty <= 0}
        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-semibold text-gray-900">{qty}</span>
      <button
        onClick={onIncrease}
        disabled={qty >= 300}
        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
      >
        +
      </button>
    </div>
  );
}

export function Microsoft365SMBConfigurator({ productId }: { productId: string }) {
  const { addItem, setIsOpen } = useCartStore();

  const [billingCycle, setBillingCycle] = useState("annual");
  const activeCycle = BILLING_OPTIONS.find((o) => o.value === billingCycle)!;
  const termSuffix  = activeCycle.suffix;

  // qty per plan = number of users
  const [planQtys, setPlanQtys] = useState<Record<string, number>>({});

  const subtotal = SMB_PLANS.reduce(
    (s, p) => s + getPrice(p, billingCycle) * (planQtys[p.id] || 0),
    0
  );

  const summaryLines = SMB_PLANS
    .filter((p) => (planQtys[p.id] || 0) > 0)
    .map((p) => ({
      label:  `${p.name} × ${planQtys[p.id]} user${planQtys[p.id] === 1 ? "" : "s"}`,
      amount: getPrice(p, billingCycle) * (planQtys[p.id] || 0),
    }));

  const handleAddToCart = () => {
    SMB_PLANS.forEach((p) => {
      const qty = planQtys[p.id] || 0;
      if (qty > 0) {
        addItem({
          quantity: qty,
          baseProductPrice: p.monthlyPerUser,
          productPrice: getPrice(p, billingCycle) * qty,
          unitPrice: getPrice(p, billingCycle),
          billingCycle: activeCycle.billingCycle as any,
          isRecurring: true,
          recurringAmount: getPrice(p, billingCycle),
          product: { id: productId, name: p.name, images: [] } as any,
        } as any);
      }
    });
    setIsOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Microsoft 365 Services</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your SMB plan — up to 300 users per plan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

        {/* ── LEFT (70%) ───────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* SMB Plans section */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Microsoft 365 SMB Plans
              </h3>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                per user
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                up to 300 users
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {SMB_PLANS.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {plan.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatINR(getPrice(plan, billingCycle))}
                      <span className="text-gray-400">{termSuffix}</span> / user
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <QtyControl
                      qty={planQtys[plan.id] || 0}
                      onDecrease={() =>
                        setPlanQtys((p) => ({
                          ...p,
                          [plan.id]: Math.max(0, (p[plan.id] || 0) - 1),
                        }))
                      }
                      onIncrease={() =>
                        setPlanQtys((p) => ({
                          ...p,
                          [plan.id]: Math.min(300, (p[plan.id] || 0) + 1),
                        }))
                      }
                    />
                    <div className="text-right min-w-[110px]">
                      <div className="text-sm font-bold text-gray-900">
                        {(planQtys[plan.id] || 0) > 0
                          ? formatINR(getPrice(plan, billingCycle) * (planQtys[plan.id] || 0))
                          : "—"}
                      </div>
                      <div className="text-xs text-gray-400">{termSuffix}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT (30%) — Order Summary ──────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <Card className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <CardContent className="p-0">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                </div>

                {/* Billing Cycle */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Billing Cycle</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {BILLING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBillingCycle(option.value)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          billingCycle === option.value
                            ? "border-[#1E2260] bg-[#EEF2FF]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        {option.discount > 0 && (
                          <div className="text-xs text-green-600">Save {option.discount}%</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected items */}
                <div className="px-6 py-4 border-b border-gray-100">
                  {summaryLines.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Select users above to see total
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {summaryLines.map((line, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div className="text-sm text-gray-600 flex-1 pr-2 leading-snug">
                            {line.label}
                          </div>
                          <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                            {formatINR(line.amount)}
                            <span className="text-xs text-gray-400">{termSuffix}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grand total + CTA */}
                <div className="px-6 py-5">
                  {subtotal > 0 && (
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-[#1E2260]">
                          {formatINR(subtotal)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{termSuffix}</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleAddToCart}
                    disabled={subtotal === 0}
                    className="w-full py-3 rounded-lg bg-[#1E2260] hover:bg-[#161848] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                    Prices per user · 18% GST applicable<br />
                    Annual plans billed upfront
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
