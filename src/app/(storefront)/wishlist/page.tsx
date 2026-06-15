"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Trash2, ArrowRight, ShoppingCart, Package, X } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import type { ProductAddon } from "@/types";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleMoveToCart = (item: typeof items[0]) => {
    const selectedConfigsArray = item.selectedConfigs
      ? Object.entries(item.selectedConfigs).map(([configId, value]) => ({
          configId, configName: configId, value: String(value), priceModifier: 0,
        }))
      : [];
    const addonState = item.selectedAddons as Record<string, { quantity: number; selected: boolean; source?: string }> | undefined;
    const selectedAddonsArray = addonState
      ? Object.entries(addonState)
          .filter(([, a]) => a.selected)
          .map(([key, a]) => ({
            addon: { id: key, name: key, price: 0, source: (a.source as string) || "PRODUCT" } as unknown as ProductAddon,
            quantity: a.quantity,
          }))
      : [];
    addToCart({
      product: item.product, variant: item.variant,
      selectedConfigs: selectedConfigsArray, selectedAddons: selectedAddonsArray,
      unitPrice: item.unitPrice,
      billingCycle: (item.billingCycle as any) || "MONTHLY",
      quantity: 1,
    });
    removeItem(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-5">
            <Heart className="h-10 w-10 text-[#1E2260]" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-gray-500 mb-6">Save products you love here to revisit anytime.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E2260] text-white text-sm font-semibold rounded-lg hover:bg-[#161848] transition-colors">
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.unitPrice, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">

        {/* Page header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
              <Heart className="h-4.5 w-4.5 text-[#1E2260]" fill="#1E2260" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">My Wishlist</h1>
              <p className="text-xs text-gray-400 mt-0.5">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={clearWishlist}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const img = item.product?.images?.[0]?.url;
              const name = item.product?.name || "Product";
              const category = (item.product as any)?.category?.name;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                  {/* Thumbnail */}
                  <Link href={`/products/${item.product?.slug || "#"}`} className="flex-shrink-0">
                    <div className="w-[72px] h-[72px] rounded-xl bg-[#F0F4FF] flex items-center justify-center overflow-hidden border border-[#E8EDFF]">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="h-7 w-7 text-[#1E2260]/30" />
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {category && (
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#1E2260] bg-[#EEF2FF] px-2 py-0.5 rounded-full mb-1">
                          {category}
                        </span>
                      )}
                      <Link href={`/products/${item.product?.slug || "#"}`}>
                        <p className="text-sm font-semibold text-gray-900 hover:text-[#1E2260] transition-colors leading-snug">
                          {name}
                        </p>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-gray-900">{formatCurrency(item.unitPrice)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2260] hover:bg-[#161848] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-gray-500 truncate max-w-[130px]">{item.product?.name || "Product"}</span>
                    <span className="font-medium text-gray-800 ml-2 flex-shrink-0">{formatCurrency(item.unitPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-dashed border-gray-100" />

              <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#1E2260] text-base">{formatCurrency(total)}</span>
              </div>

              <div className="mt-5 space-y-2">
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1E2260] hover:bg-[#161848] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-center w-full py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
