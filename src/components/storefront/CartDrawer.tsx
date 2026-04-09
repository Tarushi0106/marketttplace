"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

// Helper to get billing cycle label (slash format for prices)
const getBillingCycleLabel = (cycle?: string): string => {
  const labels: Record<string, string> = {
    ONE_TIME: "",
    MONTHLY: "/month",
    BIMONTHLY: "/2 months",
    QUARTERLY: "/quarter",
    FOUR_MONTHLY: "/4 months",
    SEMI_ANNUAL: "/6 months",
    TRI_ANNUAL: "/9 months",
    YEARLY: "/year",
    BIENNIAL: "/2 years",
    TRIENNIAL: "/3 years",
  };
  return labels[cycle || ""] || cycle || "";
};

// Helper to get billing cycle name (full format for badges)
const getBillingCycleName = (cycle?: string): string => {
  const labels: Record<string, string> = {
    ONE_TIME: "One-time",
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
  return labels[cycle || ""] || cycle || "";
};

export function CartDrawer() {
  const { sidebarItems, isOpen, setIsOpen, removeItem, discountAmount, clearSidebar } = useCartStore();

  if (!isOpen) return null;

  const items = sidebarItems;

  // Compute totals from sidebar items only (not from the persistent full cart)
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 1;
    if (item.isRecurring && item.billingCycle !== "ONE_TIME") {
      const amount = Number(item.recurringAmount) || 0;
      return sum + (item.quantityLocked ? amount : amount * qty);
    }
    return sum + Number(item.productPrice ?? item.baseProductPrice ?? 0) * (item.quantityLocked ? 1 : qty);
  }, 0);
  const tax = subtotal * 0.18;
  const total = Math.max(0, subtotal + tax - Number(discountAmount || 0));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-modal animate-slide-in-right">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
              <span className="text-sm font-normal text-muted-foreground">
                ({items.length} items)
              </span>
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart items */}
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground text-center">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button asChild onClick={() => setIsOpen(false)}>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-lg border border-border p-3"
                    >
                      {/* Product image */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-surface">
                        {item.product?.images?.[0]?.url ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium">
                              {item.product?.name || item.bundle?.name}
                            </h3>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant.name}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Billing cycle and setup fee for recurring items */}
                        {item.isRecurring && item.billingCycle && (
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <CreditCard className="h-3 w-3 mr-1" />
                              {getBillingCycleName(item.billingCycle)}
                            </Badge>
                            {item.recurringData?.setupFee != null && item.recurringData.setupFee > 0 && (
                              <span className="text-xs text-amber-600">
                                + {formatPrice(item.recurringData.setupFee)} setup
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-auto flex items-center justify-end pt-2">
                          <p className="font-medium">
                            {item.isRecurring && item.billingCycle && item.billingCycle !== "ONE_TIME" ? (
                              <>
                                {formatPrice(item.recurringAmount || 0)}
                                <span className="text-sm text-muted-foreground ml-1">
                                  {getBillingCycleLabel(item.billingCycle)}
                                </span>
                              </>
                            ) : (
                              formatPrice(item.baseProductPrice || 0)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-border p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/cart" onClick={() => { clearSidebar(); }}>
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
