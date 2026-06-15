"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Eye, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatCurrency, calculateDiscount, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  showCompare?: boolean;
}

export function ProductCard({
  product,
  showQuickView = true,
  showCompare = true,
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const { setQuickViewProduct, addToComparison, comparisonItems } = useUIStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlistStore();

  const wishlistId = `${product.id}-default-null`;
  const isWishlisted = wishlistItems.some((i) => i.id === wishlistId);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(wishlistId);
    } else {
      addToWishlist({ product, unitPrice: displayPrice });
    }
  };

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  // For STANDALONE products: use basePrice
  // For CONFIGURABLE/BUNDLE products: use minimum variant price
  const isConfigurable = product.productType === 'CONFIGURABLE' || product.productType === 'BUNDLE' || product.productType === 'WITH_ADDONS';
  
  let displayPrice: number;
  if (isConfigurable && product.variants && product.variants.length > 0) {
    const variantPrices = product.variants
      .filter((v: any) => v.price !== null)
      .map((v: any) => Number(v.price));
    displayPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(product.basePrice);
  } else {
    displayPrice = Number(product.basePrice);
  }

  const discount = product.compareAtPrice
    ? calculateDiscount(Number(product.compareAtPrice), displayPrice)
    : 0;
  const isInComparison = comparisonItems.includes(product.id);

  const handleAddToCart = () => {
    addItem({
      product,
      variant: product.variants?.find((v) => v.isDefault) || undefined,
      quantity: 1,
      selectedAddons: [],
      selectedConfigs: [],
      unitPrice: displayPrice,
    });
  };

  return (
    <Card className="group relative overflow-hidden border-border hover:shadow-elevated transition-shadow">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {product.isFeatured && (
          <Badge variant="default">Featured</Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive">-{discount}%</Badge>
        )}
        {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
          <Badge variant="warning">Low Stock</Badge>
        )}
        {product.stockQuantity === 0 && (
          <Badge variant="secondary">Out of Stock</Badge>
        )}
      </div>

      {/* Quick actions — always visible */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full shadow-sm transition-all",
            isWishlisted ? "bg-red-50 border border-red-200" : "bg-white/90 backdrop-blur-sm"
          )}
          onClick={handleWishlistToggle}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
        </Button>
        {showQuickView && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setQuickViewProduct(product.id)}
            title="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {showCompare && (
          <Button
            variant={isInComparison ? "default" : "secondary"}
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => addToComparison(product.id)}
            title="Compare"
            disabled={comparisonItems.length >= 4 && !isInComparison}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-surface">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {product.category.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 font-medium text-foreground hover:text-primary line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Variant info for configurable products */}
        {isConfigurable && product.variants && product.variants.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.variants.length > 1 
              ? `${product.variants.length} variants available`
              : product.variants[0]?.name}
          </p>
        )}

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(Number(product.averageRating || 0))
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            {formatCurrency(displayPrice)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(Number(product.compareAtPrice))}
            </span>
          )}
          {isConfigurable && product.variants && product.variants.length > 0 && (
            <span className="text-xs text-muted-foreground">
              (Starts from)
            </span>
          )}
        </div>

        {/* Product type badge */}
        {product.productType !== "STANDALONE" && (
          <Badge variant="outline" className="mt-2">
            {product.productType === "WITH_ADDONS" && "Has Add-ons"}
            {product.productType === "CONFIGURABLE" && "Configurable"}
            {product.productType === "BUNDLE" && "Bundle"}
          </Badge>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            disabled={product.stockQuantity === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 flex-shrink-0 border transition-all",
              isWishlisted
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                : "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            )}
            onClick={handleWishlistToggle}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
