"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Layers, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import type { Bundle } from "@/types";

interface BundleCardProps {
  bundle: Bundle;
}

export function BundleCard({ bundle }: BundleCardProps) {
  const { addItem } = useCartStore();

  const discount = bundle.compareAtPrice
    ? calculateDiscount(Number(bundle.compareAtPrice), Number(bundle.price))
    : 0;

  const totalOriginalPrice = bundle.items.reduce(
    (sum, item) => sum + Number(item.product.basePrice) * item.quantity,
    0
  );

  const savings = totalOriginalPrice - Number(bundle.price);

  const handleAddToCart = () => {
    addItem({
      bundle,
      quantity: 1,
      selectedAddons: [],
      selectedConfigs: [],
      unitPrice: Number(bundle.price),
    });
  };

  return (
    <Card className="group relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        <Badge className="bg-primary">Bundle</Badge>
        {bundle.isFeatured && <Badge variant="secondary">Featured</Badge>}
        {discount > 0 && <Badge variant="destructive">Save {discount}%</Badge>}
      </div>

      {/* Header */}
      <CardHeader className="pb-0">
        <Link href={`/bundles/${bundle.slug}`}>
          <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-surface">
            {bundle.image ? (
              <Image
                src={bundle.image}
                alt={bundle.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Layers className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Title */}
        <Link href={`/bundles/${bundle.slug}`}>
          <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
            {bundle.name}
          </h3>
        </Link>

        {/* Description */}
        {bundle.shortDescription && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {bundle.shortDescription}
          </p>
        )}

        {/* Included products */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Includes {bundle.items.length} products
          </p>
          <ul className="mt-2 space-y-1">
            {bundle.items.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-3 w-3 text-success" />
                <span className="truncate">
                  {item.product.name}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
              </li>
            ))}
            {bundle.items.length > 4 && (
              <li className="text-sm text-primary">
                +{bundle.items.length - 4} more items
              </li>
            )}
          </ul>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(Number(bundle.price))}
          </span>
          {totalOriginalPrice > Number(bundle.price) && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(totalOriginalPrice)}
            </span>
          )}
        </div>

        {/* Savings */}
        {savings > 0 && (
          <p className="mt-1 text-sm font-medium text-success">
            You save {formatCurrency(savings)}
          </p>
        )}

        {/* Customizable badge */}
        {bundle.isCustomizable && (
          <Badge variant="outline" className="mt-2">
            Customizable
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button className="flex-1" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add Bundle
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/bundles/${bundle.slug}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
