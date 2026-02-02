"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Eye, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
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

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const discount = product.compareAtPrice
    ? calculateDiscount(Number(product.compareAtPrice), Number(product.basePrice))
    : 0;
  const isInComparison = comparisonItems.includes(product.id);

  const handleAddToCart = () => {
    addItem({
      product,
      variant: product.variants?.find((v) => v.isDefault) || undefined,
      quantity: 1,
      selectedAddons: [],
      selectedConfigs: [],
      unitPrice: Number(product.basePrice),
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

      {/* Quick actions */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full shadow-subtle"
          onClick={() => {}}
          title="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </Button>
        {showQuickView && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-subtle"
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
            className="h-8 w-8 rounded-full shadow-subtle"
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
            {formatCurrency(Number(product.basePrice))}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(Number(product.compareAtPrice))}
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

        {/* Add to cart button */}
        <Button
          className="mt-4 w-full"
          disabled={product.stockQuantity === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
