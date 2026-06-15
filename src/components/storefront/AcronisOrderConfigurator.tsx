"use client";

import { useState } from "react";
import { ShoppingCart, Check, Monitor, Server, Package, Database, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";

// On-premise appliances
const APPLIANCES = [
  { id: "e1000",     name: "E1000",  spec: "1 TB Backup Storage (1 TB x 2 on RAID 1 | 32 GB RAM | 1 U | Single Processor)",   inrMonthly: 11250 },
  { id: "e4000",     name: "E4000",  spec: "4 TB Backup Storage (2 TB x 3 on RAID 5 | 32 GB RAM | 1 U | Single Processor)",   inrMonthly: 18000 },
  { id: "e6000",     name: "E6000",  spec: "6 TB Backup Storage (3 TB x 3 on RAID 5 | 48 GB RAM | 1 U | Single Processor)",   inrMonthly: 22500 },
  { id: "e12000",    name: "E12000", spec: "12 TB Backup Storage (4 TB x 4 on RAID 5 | 64 GB RAM | 1 U | Single Processor)",  inrMonthly: 27000 },
  { id: "e18000",    name: "E18000", spec: "18 TB Backup Storage (3 TB x 12 on RAID 6 | 64 GB RAM | 2 U | Dual Processor)",   inrMonthly: 27000 },
  { id: "e24000",    name: "E24000", spec: "24 TB Backup Storage (3 TB x 10 on RAID 6 | 64 GB RAM | 2 U | Dual Processor)",   inrMonthly: 36000 },
  { id: "e36000_36", name: "E36000", spec: "36 TB Backup Storage (4 TB x 11 on RAID 6 | 96 GB RAM | 2 U | Dual Processor)",  inrMonthly: 45000 },
  { id: "e36000_48", name: "E36000", spec: "48 TB Backup Storage (6 TB x 10 on RAID 6 | 128 GB RAM | 2 U | Dual Processor)", inrMonthly: 54000 },
  { id: "e36000_60", name: "E36000", spec: "60 TB Backup Storage (6 TB x 12 on RAID 6 | 128 GB RAM | 2 U | Dual Processor)", inrMonthly: 63000 },
];

// Billing cycle options
const BILLING_OPTIONS = [
  { value: "monthly",    label: "Monthly",     suffix: "/mo",       discount: 0,  billingCycle: "MONTHLY"     },
  { value: "quarterly",  label: "Quarterly",   suffix: "/quarter",  discount: 6,  billingCycle: "QUARTERLY"   },
  { value: "semiAnnual", label: "Semi-Annual", suffix: "/6 months", discount: 10, billingCycle: "SEMI_ANNUAL" },
  { value: "yearly",     label: "Yearly",      suffix: "/year",     discount: 20, billingCycle: "YEARLY"      },
];

function getPriceForCycle(monthlyPrice: number, cycle: string): number {
  switch (cycle) {
    case "monthly":    return monthlyPrice;
    case "quarterly":  return monthlyPrice * 3 * 0.94;
    case "semiAnnual": return monthlyPrice * 6 * 0.90;
    case "yearly":     return monthlyPrice * 12 * 0.80;
    default:           return monthlyPrice;
  }
}

// Which sections to show per category
const CATEGORY_SECTIONS: Record<string, string[]> = {
  device:      ["A", "B", "C", "D", "E"],
  workstation: ["A", "B", "C", "E"],
  vm:          ["A", "B", "C", "E"],
  server:      ["A", "B", "C", "E"],
  virtualhost: ["A", "C", "E"],
  mailbox:     ["A", "C", "E"],
  mobile:      ["A"],
  install:     ["D"],
  core:        ["B"],
  storage:     ["C", "E"],
};

interface Variant { id: string; name: string; price: number; }
interface Addon   { id: string; name: string; price: number; unit?: string; }

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
  category?: string;
  categoryLabel: string;
  variants: Variant[];
  addons: Addon[];
}

function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function QtyControl({ qty, onDecrease, onIncrease }: { qty: number; onDecrease: () => void; onIncrease: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
      <button onClick={onDecrease} disabled={qty <= 0}
        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold">
        −
      </button>
      <span className="w-10 text-center text-sm font-semibold text-gray-900">{qty}</span>
      <button onClick={onIncrease}
        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm font-bold">
        +
      </button>
    </div>
  );
}

export function AcronisOrderConfigurator({ productId, productName, category, categoryLabel, variants, addons }: Props) {
  const allowedSections = category && CATEGORY_SECTIONS[category] ? CATEGORY_SECTIONS[category] : ["A","B","C","D","E"];
  const show = (s: string) => allowedSections.includes(s);

  const { addItem, setIsOpen } = useCartStore();

  // Billing cycle — applies to all prices
  const [billingCycle, setBillingCycle] = useState("yearly");
  const activeCycle = BILLING_OPTIONS.find(o => o.value === billingCycle) ?? BILLING_OPTIONS[0];
  const termSuffix  = activeCycle.suffix;
  const cyclePrice  = (base: number) => getPriceForCycle(base, billingCycle);

  // Section A — all category variants, each with qty control
  const [variantQtys, setVariantQtys] = useState<Record<string, number>>({});

  // Section B — Windows license
  const windowsAddon = addons.find(a => a.name?.toLowerCase().includes("windows 2019"));
  const [winQty, setWinQty] = useState(0);

  // Section C — Cloud storage
  const cloudAddon = addons.find(a => a.name?.toLowerCase().includes("backup cloud storage") && !a.name?.toLowerCase().includes("managed"));
  const [cloudQty, setCloudQty] = useState(0);

  // Section D — Appliances
  const [applianceQtys, setApplianceQtys] = useState<Record<string, number>>({});

  // Section E — Managed services
  const managedAddons = addons.filter(a => a.name?.toLowerCase().includes("managed backup"));
  const [managedQtys, setManagedQtys] = useState<Record<string, number>>({});

  // Totals (all cycle-adjusted)
  const variantTotal   = variants.reduce((s, v) => s + cyclePrice(v.price) * (variantQtys[v.id] || 0), 0);
  const winTotal       = windowsAddon ? cyclePrice(windowsAddon.price) * winQty : 0;
  const cloudTotal     = cloudAddon   ? cyclePrice(cloudAddon.price) * cloudQty : 0;
  const applianceTotal = APPLIANCES.reduce((s, a) => s + cyclePrice(a.inrMonthly) * (applianceQtys[a.id] || 0), 0);
  const managedTotal   = managedAddons.reduce((s, a) => s + cyclePrice(a.price) * (managedQtys[a.id] || 0), 0);
  const subtotal   = variantTotal + winTotal + cloudTotal + applianceTotal + managedTotal;

  // Summary lines
  const summaryLines = [
    ...variants.filter(v => (variantQtys[v.id] || 0) > 0).map(v => ({
      label: `${v.name} ×${variantQtys[v.id]}`,
      amount: cyclePrice(v.price) * (variantQtys[v.id] || 0),
    })),
    ...(winQty > 0 && windowsAddon ? [{ label: `Windows License ×${winQty}`, amount: winTotal }] : []),
    ...(cloudQty > 0 && cloudAddon  ? [{ label: `Cloud Storage ×${cloudQty} TB`, amount: cloudTotal }] : []),
    ...APPLIANCES.filter(a => (applianceQtys[a.id] || 0) > 0).map(a => ({
      label: `${a.name} ×${applianceQtys[a.id]}`, amount: cyclePrice(a.inrMonthly) * (applianceQtys[a.id] || 0),
    })),
    ...managedAddons.filter(a => (managedQtys[a.id] || 0) > 0).map(a => ({
      label: `${a.name} ×${managedQtys[a.id]}`, amount: cyclePrice(a.price) * (managedQtys[a.id] || 0),
    })),
  ];

  const handleAddToCart = () => {
    variants.forEach(v => {
      const qty = variantQtys[v.id] || 0;
      if (qty > 0) addItem({
        quantity: qty,
        baseProductPrice: v.price,
        productPrice: cyclePrice(v.price) * qty,
        unitPrice: cyclePrice(v.price),
        billingCycle: activeCycle.billingCycle as any,
        isRecurring: true,
        recurringAmount: cyclePrice(v.price),
        product: { id: productId, name: v.name, images: [] } as any,
      } as any);
    });
    if (winQty > 0 && windowsAddon)
      addItem({ quantity: winQty, baseProductPrice: windowsAddon.price, productPrice: cyclePrice(windowsAddon.price) * winQty, unitPrice: cyclePrice(windowsAddon.price), billingCycle: activeCycle.billingCycle as any, isRecurring: true, recurringAmount: cyclePrice(windowsAddon.price), product: { id: productId, name: windowsAddon.name, images: [] } as any } as any);
    if (cloudQty > 0 && cloudAddon)
      addItem({ quantity: cloudQty, baseProductPrice: cloudAddon.price, productPrice: cyclePrice(cloudAddon.price) * cloudQty, unitPrice: cyclePrice(cloudAddon.price), billingCycle: activeCycle.billingCycle as any, isRecurring: true, recurringAmount: cyclePrice(cloudAddon.price), product: { id: productId, name: cloudAddon.name, images: [] } as any } as any);
    managedAddons.forEach(a => {
      const qty = managedQtys[a.id] || 0;
      if (qty > 0) addItem({ quantity: qty, baseProductPrice: a.price, productPrice: cyclePrice(a.price) * qty, unitPrice: cyclePrice(a.price), billingCycle: activeCycle.billingCycle as any, isRecurring: true, recurringAmount: cyclePrice(a.price), product: { id: productId, name: a.name, images: [] } as any } as any);
    });
    setIsOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{productName}</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your backup solution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

        {/* ── LEFT (70%) ─────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION A: Subscription Licenses */}
          {show("A") && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Advanced Backup Software Subscription Licenses — {categoryLabel}
                </h3>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  per device
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {variants.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-gray-400 text-center">No variants found for this selection.</p>
                ) : variants.map(v => (
                  <div key={v.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatINR(cyclePrice(v.price))}<span className="text-gray-400">{termSuffix}</span> / device
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                      <QtyControl
                        qty={variantQtys[v.id] || 0}
                        onDecrease={() => setVariantQtys(p => ({ ...p, [v.id]: Math.max(0, (p[v.id] || 0) - 1) }))}
                        onIncrease={() => setVariantQtys(p => ({ ...p, [v.id]: (p[v.id] || 0) + 1 }))}
                      />
                      <div className="text-right min-w-[100px]">
                        <div className="text-sm font-bold text-gray-900">
                          {(variantQtys[v.id] || 0) > 0 ? formatINR(cyclePrice(v.price) * (variantQtys[v.id] || 0)) : "—"}
                        </div>
                        <div className="text-xs text-gray-400">{termSuffix}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: Windows License */}
          {show("B") && windowsAddon && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Windows Subscription License</h3>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">per 2 core</span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{windowsAddon.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatINR(windowsAddon.price)} / 2 cores / month</div>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> For Backup Server use</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Standard Edition</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <QtyControl qty={winQty} onDecrease={() => setWinQty(q => Math.max(0, q - 1))} onIncrease={() => setWinQty(q => q + 1)} />
                    <div className="text-right min-w-[100px]">
                      <div className="text-sm font-bold text-gray-900">{winQty > 0 ? formatINR(cyclePrice(windowsAddon.price) * winQty) : "—"}</div>
                      <div className="text-xs text-gray-400">{termSuffix}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: Cloud Storage */}
          {show("C") && cloudAddon && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Backup Cloud Storage</h3>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">per TB / month</span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{cloudAddon.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatINR(cloudAddon.price)} / TB / month</div>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Acronis cloud datacenter</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> 99.9% uptime SLA</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <QtyControl qty={cloudQty} onDecrease={() => setCloudQty(q => Math.max(0, q - 1))} onIncrease={() => setCloudQty(q => q + 1)} />
                    <div className="text-right min-w-[100px]">
                      <div className="text-sm font-bold text-gray-900">{cloudQty > 0 ? formatINR(cyclePrice(cloudAddon.price) * cloudQty) : "—"}</div>
                      <div className="text-xs text-gray-400">{termSuffix}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION D: On-Premise Backup Appliances */}
          {show("D") && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">On-Premise Backup Appliances</h3>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Capex</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">per device / month</span>
              </div>
              <div className="divide-y divide-gray-100">
                {APPLIANCES.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{a.spec}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatINR(a.inrMonthly)} / device / month</div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                      <QtyControl
                        qty={applianceQtys[a.id] || 0}
                        onDecrease={() => setApplianceQtys(p => ({ ...p, [a.id]: Math.max(0, (p[a.id] || 0) - 1) }))}
                        onIncrease={() => setApplianceQtys(p => ({ ...p, [a.id]: (p[a.id] || 0) + 1 }))}
                      />
                      <div className="text-right min-w-[100px]">
                        <div className="text-sm font-bold text-gray-900">
                          {(applianceQtys[a.id] || 0) > 0 ? formatINR(cyclePrice(a.inrMonthly) * (applianceQtys[a.id] || 0)) : "—"}
                        </div>
                        <div className="text-xs text-gray-400">{termSuffix}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION E: Managed Backup Services */}
          {show("E") && managedAddons.length > 0 && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Managed Backup Services</h3>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">Managed</span>
              </div>
              <div className="divide-y divide-gray-100">
                {managedAddons.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{a.name}</div>
                      {a.unit && <div className="text-xs text-gray-400 mt-0.5">{a.unit}</div>}
                      <div className="text-xs text-gray-500 mt-1">{formatINR(a.price)} / {a.unit || "unit"}</div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                      <QtyControl
                        qty={managedQtys[a.id] || 0}
                        onDecrease={() => setManagedQtys(p => ({ ...p, [a.id]: Math.max(0, (p[a.id] || 0) - 1) }))}
                        onIncrease={() => setManagedQtys(p => ({ ...p, [a.id]: (p[a.id] || 0) + 1 }))}
                      />
                      <div className="text-right min-w-[100px]">
                        <div className="text-sm font-bold text-gray-900">
                          {(managedQtys[a.id] || 0) > 0 ? formatINR(cyclePrice(a.price) * (managedQtys[a.id] || 0)) : "—"}
                        </div>
                        <div className="text-xs text-gray-400">/{a.unit || "unit"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT (30%) — Order Summary ─────────────────────────── */}
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
                    {BILLING_OPTIONS.map(option => (
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
                          <div className="text-xs text-gray-500">Save {option.discount}%</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected items */}
                <div className="px-6 py-4 border-b border-gray-100">
                  {summaryLines.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">Select items above to see total</p>
                  ) : (
                    <div className="space-y-2.5">
                      {summaryLines.map((line, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div className="text-sm text-gray-600 flex-1 pr-2 leading-snug">{line.label}</div>
                          <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                            {formatINR(line.amount)}<span className="text-xs text-gray-400">{termSuffix}</span>
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
                        <span className="text-xl font-black text-[#1E2260]">{formatINR(subtotal)}</span>
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
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
