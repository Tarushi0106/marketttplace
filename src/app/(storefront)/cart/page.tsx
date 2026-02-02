"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Tag,
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    discountCode,
    discountAmount,
    applyDiscount,
    removeDiscount,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError("");

    // Mock coupon validation - in production, validate via API
    setTimeout(() => {
      if (couponCode.toUpperCase() === "SAVE20") {
        const discount = getSubtotal() * 0.2;
        applyDiscount("SAVE20", discount);
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

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Cart" }]} className="mb-6" />

        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Looks like you haven&apos;t added anything to your cart yet. Start
            shopping to fill it up!
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Cart" }]} className="mb-6" />

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">
              {items.length} item(s) in cart
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-surface">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product?.slug || item.bundle?.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product?.name || item.bundle?.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            Plan: {item.variant.name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Selected addons */}
                    {item.selectedAddons.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Add-ons:</p>
                        <ul className="text-sm">
                          {item.selectedAddons.map((addon) => (
                            <li key={addon.addon.id} className="text-muted-foreground">
                              + {addon.addon.name} ({formatCurrency(Number(addon.addon.price))})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Selected configs */}
                    {item.selectedConfigs.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Configuration:</p>
                        <ul className="text-sm">
                          {item.selectedConfigs.map((config) => (
                            <li key={config.configId} className="text-muted-foreground">
                              {config.configName}: {config.value}
                              {config.priceModifier > 0 && ` (+${formatCurrency(config.priceModifier)})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quantity and price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.totalPrice)}/mo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)}/mo each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Code */}
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
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-destructive mt-1">{couponError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Try: SAVE20 or FLAT50
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-success/10 text-success p-3 rounded-md">
                  <div>
                    <p className="font-medium">{discountCode}</p>
                    <p className="text-sm">-{formatCurrency(discountAmount)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-success hover:text-success"
                    onClick={removeDiscount}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal())}/mo</span>
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
