"use client";

import { useState } from "react";
import { ShoppingCart, Users, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";

// ── SMB Plans ────────────────────────────────────────────────────────────────
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

// ── Enterprise Plans ─────────────────────────────────────────────────────────
const ENTERPRISE_PLANS = [
  {
    id: "M365-E1",
    name: "Microsoft 365 Enterprise E1",
    monthlyPerUser: 1350,
    annualPerUser:  14580,
    description: "50 GB Mailbox | 1 TB OneDrive | Skype HD Video | Office Online | SharePoint Online",
  },
  {
    id: "M365-E3",
    name: "Microsoft 365 Enterprise E3",
    monthlyPerUser: 2520,
    annualPerUser:  27216,
    description: "All features of ProPlus and E1 plus compliance tools, information protection & voicemail",
  },
  {
    id: "M365-E5",
    name: "Microsoft 365 Enterprise E5",
    monthlyPerUser: 4140,
    annualPerUser:  44712,
    description: "All features of E3 plus advanced Skype for Business meetings and voice capabilities",
  },
  {
    id: "M365-PP",
    name: "Microsoft 365 ProPlus",
    monthlyPerUser: 3915,
    annualPerUser:  42282,
    description: "Full Office Professional License | 1 TB OneDrive Storage (Email not included)",
  },
];

// ── Shared ───────────────────────────────────────────────────────────────────
const BILLING_OPTIONS = [
  { value: "monthly",    label: "Monthly",     suffix: "/mo",       discount: 0,  billingCycle: "MONTHLY"     },
  { value: "quarterly",  label: "Quarterly",   suffix: "/quarter",  discount: 6,  billingCycle: "QUARTERLY"   },
  { value: "semiAnnual", label: "Semi-Annual", suffix: "/6 months", discount: 10, billingCycle: "SEMI_ANNUAL" },
  { value: "annual",     label: "Annual",      suffix: "/year",     discount: 5,  billingCycle: "YEARLY"      },
];

function getPrice(plan: { monthlyPerUser: number; annualPerUser: number }, cycle: string): number {
  switch (cycle) {
    case "monthly":    return plan.monthlyPerUser;
    case "quarterly":  return plan.monthlyPerUser * 3 * 0.94;
    case "semiAnnual": return plan.monthlyPerUser * 6 * 0.90;
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
  max,
}: {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  max?: number;
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
        disabled={max !== undefined && qty >= max}
        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
      >
        +
      </button>
    </div>
  );
}

export function Microsoft365CombinedConfigurator({
  productId,
  initialTab = "smb",
}: {
  productId: string;
  initialTab?: "smb" | "enterprise";
}) {
  const { addItem, setIsOpen } = useCartStore();

  const [tab, setTab] = useState<"smb" | "enterprise">(initialTab);
  const [billingCycle, setBillingCycle] = useState("annual");
  const activeCycle = BILLING_OPTIONS.find((o) => o.value === billingCycle)!;
  const termSuffix = activeCycle.suffix;

  const [smbQtys, setSmbQtys]           = useState<Record<string, number>>({});
  const [enterpriseQtys, setEnterpriseQtys] = useState<Record<string, number>>({});

  const plans    = tab === "smb" ? SMB_PLANS : ENTERPRISE_PLANS;
  const qtys     = tab === "smb" ? smbQtys   : enterpriseQtys;
  const setQtys  = tab === "smb" ? setSmbQtys : setEnterpriseQtys;

  const subtotal = plans.reduce(
    (s, p) => s + getPrice(p, billingCycle) * (qtys[p.id] || 0),
    0
  );

  const summaryLines = plans
    .filter((p) => (qtys[p.id] || 0) > 0)
    .map((p) => ({
      label:  `${p.name} × ${qtys[p.id]} user${qtys[p.id] === 1 ? "" : "s"}`,
      amount: getPrice(p, billingCycle) * (qtys[p.id] || 0),
    }));

  const handleAddToCart = () => {
    plans.forEach((p) => {
      const qty = qtys[p.id] || 0;
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
        <p className="text-sm text-gray-500 mt-1">Configure your plan — per user pricing</p>
      </div>

      {/* ── Toggle ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setTab("smb")}
          className={`flex-1 p-5 rounded-xl border-2 transition-all text-center shadow-sm ${
            tab === "smb"
              ? "border-[#DC2626] bg-red-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className={`w-5 h-5 ${tab === "smb" ? "text-[#DC2626]" : "text-gray-400"}`} />
            <span className="font-semibold text-base text-gray-900">SMB Plans</span>
          </div>
          <div className="text-sm text-gray-500">Up to 300 Users</div>
        </button>

        <button
          onClick={() => setTab("enterprise")}
          className={`flex-1 p-5 rounded-xl border-2 transition-all text-center shadow-sm ${
            tab === "enterprise"
              ? "border-[#DC2626] bg-red-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 className={`w-5 h-5 ${tab === "enterprise" ? "text-[#DC2626]" : "text-gray-400"}`} />
            <span className="font-semibold text-base text-gray-900">Enterprise Plans</span>
          </div>
          <div className="text-sm text-gray-500">Large Organisations</div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

        {/* ── LEFT (70%) ───────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Plans */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
              {tab === "smb"
                ? <Users className="w-4 h-4 text-gray-500" />
                : <Building2 className="w-4 h-4 text-gray-500" />}
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {tab === "smb" ? "Microsoft 365 SMB Plans" : "Microsoft 365 Enterprise Plans"}
              </h3>
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                tab === "smb" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                per user
              </span>
              {tab === "smb" && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  up to 300 users
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {plans.map((plan) => (
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
                      qty={qtys[plan.id] || 0}
                      max={tab === "smb" ? 300 : undefined}
                      onDecrease={() =>
                        setQtys((p) => ({
                          ...p,
                          [plan.id]: Math.max(0, (p[plan.id] || 0) - 1),
                        }))
                      }
                      onIncrease={() =>
                        setQtys((p) => ({
                          ...p,
                          [plan.id]: tab === "smb"
                            ? Math.min(300, (p[plan.id] || 0) + 1)
                            : (p[plan.id] || 0) + 1,
                        }))
                      }
                    />
                    <div className="text-right min-w-[110px]">
                      <div className="text-sm font-bold text-gray-900">
                        {(qtys[plan.id] || 0) > 0
                          ? formatINR(getPrice(plan, billingCycle) * (qtys[plan.id] || 0))
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

        {/* ── RIGHT (30%) — Order Summary ──────────────────────────────── */}
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
                            ? "border-[#DC2626] bg-red-50"
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
                        <span className="text-xl font-black text-[#DC2626]">
                          {formatINR(subtotal)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{termSuffix}</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleAddToCart}
                    disabled={subtotal === 0}
                    className="w-full py-3 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
