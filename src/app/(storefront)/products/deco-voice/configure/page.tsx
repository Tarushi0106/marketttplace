"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Check, Mic, Phone, Megaphone, Building2, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    pricePerMin: 8,
    defaultMins: 1000,
    unit: "per minute",
    icon: Phone,
    tag: "< 2,000 min/month",
    description: "Perfect for small teams starting with AI voice — inbound or outbound.",
    features: ["Inbound & outbound calls", "10+ language support", "Standard CRM sync"],
  },
  {
    id: "growth",
    name: "Growth",
    pricePerMin: 7,
    defaultMins: 5000,
    unit: "per minute",
    icon: Megaphone,
    tag: "2,000 – 10,000 min/month",
    description: "Growing teams with regular call volume and CRM-driven campaigns.",
    features: ["All Starter features", "Priority call queue", "Advanced CRM integration"],
    isRecommended: true,
  },
  {
    id: "business",
    name: "Business",
    pricePerMin: 6,
    defaultMins: 15000,
    unit: "per minute",
    icon: Building2,
    tag: "10,000 – 50,000 min/month",
    description: "Businesses needing priority infrastructure and SLA-backed performance.",
    features: ["All Growth features", "Dedicated infrastructure", "SLA support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    pricePerMin: 5,
    defaultMins: 60000,
    unit: "per minute",
    icon: Mic,
    tag: "> 50,000 min/month",
    description: "Large-scale private AI deployment with private LLM and custom reporting.",
    features: ["All Business features", "Private LLM option", "Custom reporting"],
  },
];

const BILLING_CYCLES = [
  { id: "monthly",     label: "Monthly",     period: "/month",    multiplier: 1  },
  { id: "quarterly",   label: "Quarterly",   period: "/quarter",  multiplier: 3, savings: 5  },
  { id: "semi-annual", label: "Semi Annual", period: "/6 months", multiplier: 6, savings: 10 },
  { id: "yearly",      label: "Yearly",      period: "/year",     multiplier: 12, savings: 20 },
];

const MIN_STEP = 500;

interface Selection {
  planId: string;
  minutes: number;
}

export default function DecoVoiceConfigurePage() {
  const router = useRouter();
  const { addItem } = useCartStore();

  const [selections, setSelections] = useState<Selection[]>([{ planId: "growth", minutes: 5000 }]);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const cycle = BILLING_CYCLES.find((c) => c.id === billingCycle)!;

  const togglePlan = (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId)!;
    setSelections((prev) => {
      const exists = prev.find((s) => s.planId === planId);
      if (exists) return prev.filter((s) => s.planId !== planId);
      return [...prev, { planId, minutes: plan.defaultMins }];
    });
  };

  const updateMins = (planId: string, delta: number) => {
    setSelections((prev) =>
      prev.map((s) =>
        s.planId === planId ? { ...s, minutes: Math.max(MIN_STEP, s.minutes + delta) } : s
      )
    );
  };

  const isSelected = (planId: string) => selections.some((s) => s.planId === planId);
  const getMins = (planId: string) => selections.find((s) => s.planId === planId)?.minutes ?? PLANS.find((p) => p.id === planId)!.defaultMins;

  const getPlanTotal = (plan: typeof PLANS[0], minutes: number) =>
    plan.pricePerMin * minutes * cycle.multiplier;

  const total = selections.reduce((sum, s) => {
    const plan = PLANS.find((p) => p.id === s.planId);
    return sum + (plan ? getPlanTotal(plan, s.minutes) : 0);
  }, 0);

  const handleAddToCart = () => {
    selections.forEach((s) => {
      const plan = PLANS.find((p) => p.id === s.planId);
      if (!plan) return;
      const unitPrice = getPlanTotal(plan, s.minutes);
      addItem({
        product: { id: "deco-voice", slug: "deco-voice", name: "Deco Voice" } as any,
        quantity: 1,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase().replace("-", "_") as any,
        isRecurring: true,
        unitPrice,
        totalPrice: unitPrice,
        recurringAmount: unitPrice,
        variantId: s.planId,
        deploymentType: "cloud" as any,
      });
    });
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <nav className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#1E2260] transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-[#1E2260] transition-colors">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products/deco-voice" className="hover:text-[#1E2260] transition-colors">Deco Voice</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-700 font-medium">Configure</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pt-10 pb-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#1E2260] text-xs font-semibold mb-3">
            <Mic className="w-3.5 h-3.5" /> AI Voice Bot · Shared LLM
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configure Your Plan</h1>
          <p className="mt-2 text-gray-500 text-sm max-w-md mx-auto">
            Select one or more tiers. Set your monthly minutes — pricing scales with volume.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Left: Plan cards */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Select Plan</h3>
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const selected = isSelected(plan.id);
              const mins = getMins(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    selected
                      ? "border-[#1E2260] bg-[#EEF2FF]/50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <button onClick={() => togglePlan(plan.id)} className="w-full text-left p-5">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        selected ? "bg-[#1E2260] border-[#1E2260]" : "border-gray-300 bg-white"
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? "bg-[#1E2260]" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-gray-500"}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900">{plan.name}</span>
                          {plan.isRecommended && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full uppercase">
                              Popular
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
                            {plan.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xl font-black text-[#1E2260]">₹{plan.pricePerMin}</p>
                        <p className="text-[10px] text-gray-400">{plan.unit}</p>
                      </div>
                    </div>
                  </button>

                  {/* Minutes row — shown only when selected */}
                  {selected && (
                    <div className="px-5 pb-4 flex items-center justify-between border-t border-[#1E2260]/10 pt-3">
                      <div className="flex flex-wrap gap-3">
                        {plan.features.map((f) => (
                          <span key={f} className="flex items-center gap-1 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-[#1E2260]" /> {f}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-gray-500 mr-1">Min</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateMins(plan.id, -MIN_STEP); }}
                          disabled={mins <= MIN_STEP}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors text-sm"
                        >−</button>
                        <span className="w-14 text-center font-semibold text-sm">{mins.toLocaleString("en-IN")}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateMins(plan.id, MIN_STEP); }}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm"
                        >+</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Billing cycle + Order summary */}
          <div className="lg:col-span-2 space-y-5">

            {/* Billing Cycle */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Billing Cycle</h3>
              <div className="space-y-2">
                {BILLING_CYCLES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setBillingCycle(c.id)}
                    className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                      billingCycle === c.id
                        ? "border-[#1E2260] bg-[#EEF2FF] shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        billingCycle === c.id ? "border-[#1E2260] bg-[#1E2260]" : "border-gray-300"
                      }`}>
                        {billingCycle === c.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`font-medium text-sm ${billingCycle === c.id ? "text-[#1E2260]" : "text-gray-700"}`}>
                        {c.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.savings && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Save {c.savings}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{c.period}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

              {selections.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No plan selected</p>
              ) : (
                <div className="space-y-3">
                  {selections.map((s) => {
                    const plan = PLANS.find((p) => p.id === s.planId)!;
                    return (
                      <div key={s.planId} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {plan.name}
                          <span className="text-gray-400 ml-1">({s.minutes.toLocaleString("en-IN")} min)</span>
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹{getPlanTotal(plan, s.minutes).toLocaleString("en-IN")}
                          <span className="text-xs text-gray-400 ml-1">{cycle.period}</span>
                        </span>
                      </div>
                    );
                  })}

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#1E2260]">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{cycle.period}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={selections.length === 0}
                className="mt-5 w-full h-11 bg-gradient-to-r from-[#1E2260] to-[#161848] hover:from-[#161848] hover:to-[#1E2260] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1E2260]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                {["Inbound & Outbound calls", "10+ Language Support", "Real-Time CRM Sync", "24/7 AI availability"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3.5 h-3.5 text-[#1E2260] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing info */}
        <div className="mt-14 space-y-6">
          <h3 className="text-base font-bold text-gray-900">Additional Pricing Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">One-time Setup</p>
              <p className="text-xl font-black text-[#1E2260] mb-3">₹75,000 – ₹3,00,000</p>
              <p className="text-xs text-gray-500 mb-3">Depending on use case complexity. Includes:</p>
              <ul className="space-y-1.5">
                {["Telephony integration (Exotel, Airtel, VOIP)", "Use case scripting & call flow setup", "Dashboard for inbound & outbound"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E2260] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Enterprise Plus</p>
              <p className="text-xl font-black text-[#1E2260] mb-1">₹75,000 <span className="text-sm font-normal text-gray-400">flat</span></p>
              <p className="text-xs text-gray-500 mb-3">Custom setup, CRM, security &amp; private voice infra:</p>
              <ul className="space-y-2">
                {["Private deployment on NVIDIA GPU", "Dedicated infrastructure + SLA", "Custom AI training & reporting", "Security configuration + CRM"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#1E2260] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
