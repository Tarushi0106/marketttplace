"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  X,
  Calculator,
  Cloud,
  Shield,
  Server,
  Database,
  Lock,
  Globe,
  Brain,
  Cpu,
} from "lucide-react";

function renderCartIcon(iconName?: string | null) {
  const props = { size: 28, className: "text-[#C62828]" };
  switch (iconName) {
    case "Cloud": return <Cloud {...props} />;
    case "Shield": return <Shield {...props} />;
    case "Server": return <Server {...props} />;
    case "Database": return <Database {...props} />;
    case "Lock": return <Lock {...props} />;
    case "Globe": return <Globe {...props} />;
    default: return <Cloud {...props} />;
  }
}

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

const getRecurringInterval = (billingCycle?: string): string => {
  const intervals: Record<string, string> = {
    MONTHLY: "1 month", BIMONTHLY: "2 months", QUARTERLY: "3 months",
    FOUR_MONTHLY: "4 months", SEMI_ANNUAL: "6 months", TRI_ANNUAL: "9 months",
    YEARLY: "1 year", BIENNIAL: "2 years", TRIENNIAL: "3 years",
  };
  return intervals[billingCycle || ""] || "";
};

// ── Category definitions (order = display order) ──────────────────────────────
const CATEGORIES = [
  {
    key: "license",
    label: "Licences & Subscriptions",
    icon: <Shield className="w-4 h-4" />,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    match: (item: any) => {
      const n = [item.product?.name, item.variant?.name].filter(Boolean).join(" ").toLowerCase();
      return (
        item.isRecurring &&
        (n.includes("connect") || n.includes("platform") || n.includes("license") || n.includes("licence") || n.includes("cloud"))
      );
    },
  },
  {
    key: "hardware",
    label: "Network Hardware",
    icon: <Server className="w-4 h-4" />,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    match: (item: any) => {
      const n = [item.product?.name, item.variant?.name].filter(Boolean).join(" ").toLowerCase();
      return n.includes("gateway") || n.includes("network link") || n.includes("nld");
    },
  },
  {
    key: "storage",
    label: "Cloud Storage",
    icon: <Database className="w-4 h-4" />,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    match: (item: any) => {
      const n = [item.product?.name, item.variant?.name].filter(Boolean).join(" ").toLowerCase();
      return n.includes("storage");
    },
  },
  {
    key: "ai",
    label: "AI Features",
    icon: <Brain className="w-4 h-4" />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    match: (item: any) => {
      const n = [item.product?.name, item.variant?.name].filter(Boolean).join(" ").toLowerCase();
      return (
        item.deploymentType === "ai" ||
        n.includes("intrusion") || n.includes("loitering") || n.includes("anpr") ||
        n.includes("facial") || n.includes("heatmap") || n.includes("overcrowding") ||
        n.includes("ppe") || n.includes("smoke") || n.includes("queue") ||
        n.includes("people counting") || n.includes("sabotage") || n.includes("trespassing") ||
        n.includes("perimeter") || n.includes("zone monitoring") || n.includes("double line") ||
        n.includes("missing staff") || n.includes("occupancy") || n.includes("person of interest") ||
        n.includes("vehicle of interest")
      );
    },
  },
  {
    key: "hardware_device",
    label: "Hardware Devices",
    icon: <Cpu className="w-4 h-4" />,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    match: (item: any) => {
      const n = [item.product?.name, item.variant?.name].filter(Boolean).join(" ").toLowerCase();
      return n.includes("stream os") || n.includes("ai-box") || n.includes("ai box") || n.includes("ai license");
    },
  },
  {
    key: "onetime",
    label: "One-time Charges",
    icon: <Calculator className="w-4 h-4" />,
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-600",
    match: (item: any) => {
      const n = [item.product?.name, item.variant?.name].filter(Boolean).join(" ").toLowerCase();
      return (
        item.billingCycle === "ONE_TIME" ||
        n.includes("setup") || n.includes("cyber") || n.includes("amc")
      );
    },
  },
  {
    key: "other",
    label: "Other Products",
    icon: <ShoppingBag className="w-4 h-4" />,
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-600",
    match: () => true,
  },
] as const;

function groupItems(items: any[]) {
  const used = new Set<string>();
  const groups: { category: typeof CATEGORIES[number]; items: any[] }[] = [];

  for (const cat of CATEGORIES) {
    const matched = items.filter((item) => !used.has(item.id) && cat.match(item));
    matched.forEach((item) => used.add(item.id));
    if (matched.length > 0) groups.push({ category: cat, items: matched });
  }
  return groups;
}

export default function CartPage() {
  const {
    items, removeItem, clearCart,
    getSubtotal, getTax, getTodayTotal, getSetupFeeTotal,
    discountCode, discountAmount, applyDiscount, removeDiscount,
    cleanStaleData,
  } = useCartStore();

  useEffect(() => { cleanStaleData(); }, [cleanStaleData]);

  const [lastProduct, setLastProduct] = useState<{ label: string; href: string } | null>(null);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("lastProductPage");
      if (stored) setLastProduct(JSON.parse(stored));
    } catch {}
  }, []);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    setTimeout(() => {
      if (couponCode.toUpperCase() === "SAVE20") {
        applyDiscount("SAVE20", Number(getSubtotal()) * 0.2);
        setCouponCode("");
      } else if (couponCode.toUpperCase() === "FLAT50") {
        applyDiscount("FLAT50", 50);
        setCouponCode("");
      } else {
        setCouponError("Invalid coupon code");
      }
      setIsApplyingCoupon(false);
    }, 500);
  };

  const breadcrumbItems = [
    ...(lastProduct
      ? [{ label: "Products", href: "/products" }, lastProduct]
      : [{ label: "Products", href: "/products" }]),
    { label: "Cart" },
  ];

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Looks like you haven't added anything yet. Start shopping to fill it up!
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = Number(getSubtotal());
  const tax = Number(getTax());
  const setupFeeTotal = Number(getSetupFeeTotal());
  const recurringTotal = items
    .filter((item) => Number(item.recurringAmount) > 0)
    .reduce((sum, item) => {
      const amount = Number(item.recurringAmount) || 0;
      return sum + ((item as any).quantityLocked ? amount : amount * Number(item.quantity || 1));
    }, 0);
  const billingCycle = items.find((item) => item.billingCycle && item.billingCycle !== "ONE_TIME")?.billingCycle;

  const groups = groupItems(items);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{items.length} item(s) in cart</span>
            <Button
              variant="ghost" size="sm"
              className="text-destructive hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {groups.map(({ category, items: groupItems }) => (
            <div key={category.key}>
              {/* Category Header */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border ${category.borderColor} ${category.bgColor} ${category.textColor} font-semibold text-sm`}>
                {category.icon}
                {category.label}
                {category.key === "license" && (() => {
                  const cam = groupItems.find((i: any) => (i as any).cameraCount);
                  const count = cam ? (cam as any).cameraCount : null;
                  return count ? (
                    <span className="text-xs font-normal opacity-80">— for ({count}) camera{count > 1 ? "s" : ""} you selected</span>
                  ) : null;
                })()}
                <span className="ml-auto text-xs font-normal opacity-70">{groupItems.length} item{groupItems.length > 1 ? "s" : ""}</span>
              </div>

              <div className="border border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-100 overflow-hidden">
                {groupItems.map((item) => (
                  <div key={item.id} className="p-4 bg-white">
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[#FDECEC] flex items-center justify-center">
                        {item.product?.icon
                          ? renderCartIcon(item.product.icon)
                          : <ShoppingBag className="h-6 w-6 text-[#C62828]" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/products/${item.product?.slug || item.bundle?.slug}`}
                              className="font-medium hover:text-primary text-gray-900"
                            >
                              {item.product?.name || item.bundle?.name}
                            </Link>
                            {item.variant?.name && item.variant.name !== item.product?.name && (
                              <p className="text-sm text-muted-foreground">
                                Plan: {item.variant.name}
                              </p>
                            )}
                            {(item as any).cameraCount && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                For {(item as any).cameraCount} camera{(item as any).cameraCount > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost" size="icon"
                            className="text-muted-foreground hover:text-destructive -mt-1"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Configs */}
                        {item.selectedConfigs && item.selectedConfigs.length > 0 && (
                          <ul className="mt-1 text-sm">
                            {item.selectedConfigs.map((config: any) => (
                              <li key={config.configId} className="text-muted-foreground flex justify-between">
                                <span>{config.configName}: {config.value}</span>
                                <span>{formatPrice(config.price || 0)}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Price */}
                        <div className="mt-2 flex justify-end">
                          <p className="font-semibold text-gray-900">
                            {item.isRecurring && item.billingCycle && item.billingCycle !== "ONE_TIME" ? (
                              <>
                                {formatPrice(item.recurringAmount || 0)}
                                <span className="text-xs font-normal text-gray-400 ml-1">
                                  {item.billingCycle === "YEARLY" ? "/yr" : item.billingCycle === "QUARTERLY" ? "/qtr" : "/mo"}
                                </span>
                              </>
                            ) : (
                              formatPrice(item.baseProductPrice || 0)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Coupon */}
              {!discountCode ? (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Coupon code"
                        className="pl-10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={handleApplyCoupon} disabled={isApplyingCoupon}>Apply</Button>
                  </div>
                  {couponError && <p className="text-sm text-destructive mt-1">{couponError}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Try: SAVE20 or FLAT50</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-success/10 text-success p-3 rounded-md">
                  <div>
                    <p className="font-medium">{discountCode}</p>
                    <p className="text-sm">-{formatPrice(discountAmount)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-success hover:text-success" onClick={removeDiscount}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Separator />

              {/* Itemized */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate pr-2">{item.product?.name || item.bundle?.name || "Product"}</span>
                    <span className="flex-shrink-0 font-medium">
                      {formatPrice(item.isRecurring ? (item.recurringAmount || item.unitPrice || 0) : (item.baseProductPrice || 0))}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price (Due Today)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {Number(tax) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                )}

                {Number(recurringTotal) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2 mt-2">
                    <p className="text-sm text-gray-600">
                      Charged <span className="font-medium">{formatPrice(Number(recurringTotal))}</span> every {getRecurringInterval(billingCycle)} after purchase.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Due Today</span>
                  <span className="text-2xl font-bold text-[#8B1D1D]">
                    {formatPrice(subtotal + tax + setupFeeTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
