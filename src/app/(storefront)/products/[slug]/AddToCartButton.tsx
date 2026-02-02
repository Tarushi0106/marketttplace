"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AddToCartButtonProps {
  product: any;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  // State for selections
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.variants?.find((v: any) => v.isDefault)?.id || product.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.configs?.forEach((config: any) => {
      if (config.defaultValue) {
        defaults[config.id] = config.defaultValue;
      }
    });
    return defaults;
  });

  // Get selected variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = Number(selectedVariant?.price || product.basePrice);

    // Add addon prices
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.addons?.forEach((addon: any) => {
      if (selectedAddons[addon.id]) {
        price += Number(addon.price);
      }
    });

    // Add config price modifiers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product.configs?.forEach((config: any) => {
      const selectedValue = selectedConfigs[config.id];
      if (selectedValue && Array.isArray(config.options)) {
        const options = config.options as Array<{ value: string; label: string; priceModifier?: number }>;
        const option = options.find((o) => o.value === selectedValue);
        if (option?.priceModifier) {
          price += option.priceModifier;
        }
      }
    });

    return price * quantity;
  }, [selectedVariant, selectedAddons, selectedConfigs, quantity, product]);

  const handleAddToCart = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addons = product.addons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter((addon: any) => selectedAddons[addon.id])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((addon: any) => ({ addon, quantity: 1 })) || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configs = product.configs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter((config: any) => selectedConfigs[config.id])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((config: any) => {
        const options = (Array.isArray(config.options) ? config.options : []) as Array<{ value: string; label: string; priceModifier?: number }>;
        const option = options.find((o) => o.value === selectedConfigs[config.id]);
        return {
          configId: config.id,
          configName: config.name,
          value: option?.label || selectedConfigs[config.id],
          priceModifier: option?.priceModifier || 0,
        };
      }) || [];

    addItem({
      product: product as unknown as import("@/types").Product,
      variant: selectedVariant as unknown as import("@/types").ProductVariant | undefined,
      quantity,
      selectedAddons: addons as unknown as Array<{ addon: import("@/types").ProductAddon; quantity: number }>,
      selectedConfigs: configs,
      unitPrice: Number(selectedVariant?.price || product.basePrice),
    });
  };

  return (
    <div className="space-y-6">
      {/* Variants Selection */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Select Plan</Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {product.variants.map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "relative rounded-lg border-2 p-4 text-left transition-all",
                  selectedVariantId === variant.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                {selectedVariantId === variant.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="font-medium">{variant.name}</div>
                {variant.attributes && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {Object.entries(variant.attributes)
                      .filter(([key]) => key !== "tier")
                      .map(([key, value]) => `${value}`)
                      .join(" / ")}
                  </div>
                )}
                <div className="mt-2 font-semibold">
                  {formatCurrency(Number(variant.price))}/mo
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Options */}
      {product.configs && product.configs.length > 0 && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {product.configs.map((config: any) => (
            <div key={config.id}>
              <Label className="text-sm font-medium">
                {config.name}
                {config.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Select
                value={selectedConfigs[config.id]}
                onValueChange={(value) =>
                  setSelectedConfigs((prev) => ({ ...prev, [config.id]: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={`Select ${config.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(config.options) ? config.options as Array<{ value: string; label: string; priceModifier?: number }> : []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {option.priceModifier && option.priceModifier > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            +{formatCurrency(option.priceModifier)}/mo
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Add-ons */}
      {product.addons && product.addons.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Add-ons (Optional)</Label>
          <div className="mt-2 space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {product.addons.map((addon: any) => (
              <label
                key={addon.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all",
                  selectedAddons[addon.id]
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Checkbox
                  checked={selectedAddons[addon.id] || false}
                  onCheckedChange={(checked) =>
                    setSelectedAddons((prev) => ({ ...prev, [addon.id]: !!checked }))
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium">{addon.name}</div>
                  {addon.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {addon.description}
                    </p>
                  )}
                </div>
                <div className="text-sm font-medium">
                  +{formatCurrency(Number(addon.price))}
                  {addon.pricingType === "RECURRING_MONTHLY" && "/mo"}
                  {addon.pricingType === "RECURRING_YEARLY" && "/yr"}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <Label className="text-sm font-medium">Quantity</Label>
        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total and Add to Cart */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{formatCurrency(totalPrice)}/mo</div>
        </div>
        <Button size="lg" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
