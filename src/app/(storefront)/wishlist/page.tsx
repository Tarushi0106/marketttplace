"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import type { ProductAddon } from "@/types";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} className="mb-6" />
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
        </div>
      </div>
    );
  }

  const handleMoveToCart = (item: typeof items[0]) => {
    // Transform wishlist item to cart item format
    const selectedConfigsArray = item.selectedConfigs
      ? Object.entries(item.selectedConfigs).map(([configId, value]) => ({
          configId,
          configName: configId,
          value: String(value),
          priceModifier: 0,
        }))
      : [];

    const addonState = item.selectedAddons as Record<string, { quantity: number; selected: boolean; source?: string }> | undefined;
    const selectedAddonsArray = addonState
      ? Object.entries(addonState)
          .filter(([, addon]) => addon.selected)
          .map(([key, addon]) => ({
            addon: {
              id: key,
              name: key,
              price: 0,
              source: (addon.source as string) || "PRODUCT",
            } as unknown as ProductAddon,
            quantity: addon.quantity,
          }))
      : [];

    addToCart({
      product: item.product,
      variant: item.variant,
      selectedConfigs: selectedConfigsArray,
      selectedAddons: selectedAddonsArray,
      unitPrice: item.unitPrice,
      billingCycle: (item.billingCycle as "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "BIENNIAL" | "TRIENNIAL") || "MONTHLY",
      quantity: 1,
    });
    removeItem(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} className="mb-6" />

        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="h-24 w-24 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Save your favorite products here to find them easily later. Start
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
      <Breadcrumbs items={[{ label: "Wishlist" }]} className="mb-6" />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <Button variant="outline" onClick={clearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Heart className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {item.product?.name || "Unknown Product"}
                        </h3>
                        {item.billingCycle && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Billing: {item.billingCycle}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-[#1E2260]"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Selected Configurations */}
                    {item.selectedConfigs && Object.keys(item.selectedConfigs).length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Configuration:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.selectedConfigs).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Addons */}
                    {item.selectedAddons && Object.keys(item.selectedAddons).length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Add-ons:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.selectedAddons)
                            .filter(([, addon]) => (addon as { selected: boolean }).selected)
                            .map(([key, addon]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs text-blue-700"
                              >
                                {(addon as { source?: string }).source || 'addon'}: {key}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Unit Price</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <Button onClick={() => handleMoveToCart(item)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Wishlist Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Items
                  </span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Estimated Total</span>
                  <span>
                    {formatCurrency(
                      items.reduce((sum, item) => sum + item.unitPrice, 0)
                    )}
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
