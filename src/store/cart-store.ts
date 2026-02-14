import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, ProductVariant, ProductAddon, Bundle } from "@/types";
import { extractNumericValue } from "@/lib/utils";

export interface CartItem {
  id: string;
  product?: Product;
  variant?: ProductVariant;
  bundle?: Bundle;
  quantity?: number;
  // Support for multiple configuration instances
  instances?: {
    instanceId: string;
    instanceNumber: number;
    instanceName: string;
    quantity: number;
    selectedConfigs: {
      configId: string;
      configName?: string;
      value: string;
      quantity?: number;
      price?: number;
      priceModifier?: number;
      monthlyPriceModifier?: number;
      yearlyPriceModifier?: number;
      optionLabel?: string;
    }[];
    selectedAddons: {
      addon?: {
        id: string;
        name?: string;
        price?: number;
      };
      quantity: number;
    }[];
  }[];
  // Legacy support for flat configs/addons
  selectedAddons?: {
    addon: ProductAddon;
    quantity: number;
  }[];
  selectedConfigs?: {
    configId: string;
    configName?: string;
    value: string;
    quantity?: number;
    price?: number; // Add price field for config pricing
    priceModifier?: number;
    monthlyPriceModifier?: number;
    yearlyPriceModifier?: number;
    optionLabel?: string;
  }[];
  // Pricing breakdown
  baseProductPrice?: number; // The one-time base product price (if applicable)
  productPrice?: number; // The full product price (base + configs + addons) for "Product Price (Due Today)"
  unitPrice?: number; // The price shown in cart (could be recurring or one-time)
  totalPrice?: number; // Total for the item
  // Billing information
  billingCycle?: "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRecurring?: boolean;
  // Recurring billing data
  recurringAmount?: number; // The recurring price per cycle
  recurringData?: {
    enabled: boolean;
    billingCycle: "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
    setupFee: number; // One-time setup fee
    pricePerCycle: number; // Recurring amount per cycle
    baseProductPrice: number; // One-time product price (if applicable)
    totalForPeriod: number;
    savingsPercentage: number;
    monthlyEquivalent: number;
    preferredTime?: string;
    preferredDay?: number;
    autoRenew?: boolean;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discountCode: string | null;
  discountAmount: number;

  // Actions
  addItem: (item: Omit<CartItem, "id" | "totalPrice">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<Omit<CartItem, "id">>) => void;
  updateAddons: (
    id: string,
    addons: { addon: ProductAddon; quantity: number }[]
  ) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;

  // Computed
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getTodayTotal: () => number; // Total due today (base price + setup fees)
  getItemCount: () => number;
  getSetupFeeTotal: () => number;
  cleanStaleData: () => void; // Clean any stale formatted string data
}

// Helper function to safely convert values to numbers
const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const calculateItemTotal = (item: Omit<CartItem, "id" | "totalPrice">): number => {
  // For items with recurringData: use unitPrice (pricePerCycle) directly, setupFee is added separately in getSetupFeeTotal()
  const unitPrice = safeNumber(item.unitPrice);
  const quantity = safeNumber(item.quantity);
  
  return unitPrice * quantity;
};

const calculateItemId = (item: Omit<CartItem, "id" | "totalPrice">): string => {
  const productId = item.product?.id || item.bundle?.id || "";
  const variantId = item.variant?.id || "default";
  // Don't include billingCycle in ID - same product should update existing item
  
  // Check for new instances format first
  if (item.instances && item.instances.length > 0) {
    // Generate a hash from all instances' configs and addons (excluding timestamp-based instanceId)
    const instancesHash = item.instances.map(inst => ({
      // Use instanceNumber instead of instanceId to avoid timestamp-based uniqueness
      num: inst.instanceNumber,
      configs: inst.selectedConfigs?.map(c => ({ id: c.configId, value: c.value, price: c.price })) || [],
      addons: inst.selectedAddons?.map(a => ({ id: a.addon?.id || "", qty: a.quantity })) || [],
    }));
    return `${productId}-${variantId}-instances-${JSON.stringify(instancesHash)}`;
  }
  
  // Legacy support for flat configs/addons
  const configsHash = JSON.stringify(item.selectedConfigs || []);
  const addonsHash = JSON.stringify(
    (item.selectedAddons || []).map(a => ({ id: a.addon?.id || "", qty: a.quantity })).sort((a, b) => a.id.localeCompare(b.id))
  );
  return `${productId}-${variantId}-${configsHash}-${addonsHash}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discountCode: null,
      discountAmount: 0,

      addItem: (item) => {
        try {
          // Validate item data
          if (!item.product && !item.bundle) {
            console.error("[Cart] Invalid cart item: no product or bundle");
            return;
          }
          
          console.log("[Cart] Adding item to cart:", {
            productName: item.product?.name,
            hasInstances: !!item.instances,
            instancesCount: item.instances?.length,
          });
          
          // Log instances if present
          if (item.instances) {
            item.instances.forEach((inst, idx) => {
              console.log(`[Cart] Instance ${idx}:`, {
                name: inst.instanceName,
                configsCount: inst.selectedConfigs?.length,
                addonsCount: inst.selectedAddons?.length,
              });
            });
          }
          
          const unitPrice = safeNumber(item.unitPrice);
          const id = calculateItemId(item);
          const existingItemIndex = get().items.findIndex((i) => i.id === id);

          console.log("[Cart] Item ID:", id.substring(0, 80) + "...");
          console.log("[Cart] Existing item index:", existingItemIndex);


          // Log instances data for debugging
          if (item.instances) {
            console.log("[Cart] Instances data:", JSON.stringify(item.instances).substring(0, 500));
          }
                    if (existingItemIndex > -1) {
            // Check if billing cycle changed - update billing info instead of adding quantity
            const existingItem = get().items[existingItemIndex];
            const billingCycleChanged = existingItem.billingCycle !== item.billingCycle;
            
            if (billingCycleChanged) {
              // Update billing cycle and pricing, preserve instances and configurations
              const items = [...get().items];
              items[existingItemIndex] = {
                ...items[existingItemIndex],
                ...item, // Preserve all new item data including instances
                billingCycle: item.billingCycle,
                isRecurring: item.isRecurring,
                recurringData: item.recurringData,
                unitPrice: unitPrice,
                totalPrice: calculateItemTotal(item),
              };
              console.log("[Cart Debug] Updated existing item billing cycle:", item.billingCycle);
              set({ items });
            } else {
              // Same billing cycle - update quantity and configurations
              const items = [...get().items];
              items[existingItemIndex] = {
                ...items[existingItemIndex],
                ...item, // Preserve all new item data including instances
                quantity: safeNumber(items[existingItemIndex].quantity) + safeNumber(item.quantity),
                totalPrice: calculateItemTotal({
                  ...items[existingItemIndex],
                  ...item,
                }),
              };
              console.log("[Cart Debug] Updated existing item quantity and configs");
              set({ items });
            }
          } else {
            // Add new item
            const newItem: CartItem = {
              ...item,
              quantity: safeNumber(item.quantity),
              unitPrice,
              id,
              // totalPrice is used for display only; the actual calculations use getTodayTotal() which adds setupFee separately
              // For recurring items, unitPrice is the pricePerCycle (not including setupFee)
              totalPrice: unitPrice * safeNumber(item.quantity),
            };
            console.log("[Cart Debug] New cart item created:", {
              id: newItem.id?.substring(0, 50),
              recurringData: newItem.recurringData,
              totalPrice: newItem.totalPrice
            });
            set({ items: [...get().items, newItem] });
          }

          set({ isOpen: true });
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const qty = safeNumber(quantity);
        if (qty < 1) {
          get().removeItem(id);
          return;
        }

        const items = get().items.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, quantity: qty };
            return { ...updatedItem, totalPrice: calculateItemTotal(updatedItem) };
          }
          return item;
        });
        set({ items });
      },

      updateItem: (id, updates) => {
        const items = get().items.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, ...updates };
            // Recalculate totalPrice with new values
            const unitPrice = safeNumber(updatedItem.unitPrice);
            const quantity = safeNumber(updatedItem.quantity);
            const newTotalPrice = unitPrice * quantity;
            return { ...updatedItem, totalPrice: newTotalPrice };
          }
          return item;
        });
        set({ items });
      },

      updateAddons: (id, addons) => {
        const items = get().items.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, selectedAddons: addons };
            return { ...updatedItem, totalPrice: calculateItemTotal(updatedItem) };
          }
          return item;
        });
        set({ items });
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountAmount: 0 });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      applyDiscount: (code, amount) => {
        set({ discountCode: code, discountAmount: safeNumber(amount) });
      },

      removeDiscount: () => {
        set({ discountCode: null, discountAmount: 0 });
      },

      getSubtotal: () => {
        // Subtotal = total due today
        // For recurring products: setup fee + first recurring payment (base + configs) + addons
        // For one-time products: productPrice (base + configs + addons)
        return get().items.reduce((sum, item) => {
          const quantity = Number(item.quantity) || 1;
          // For recurring items, charge: setup fee + first recurring payment + addons
          if (item.isRecurring && item.billingCycle !== "ONE_TIME") {
            const setupFee = Number(item.recurringData?.setupFee) || 0;
            const recurringAmount = Number(item.recurringAmount) || 0; // First recurring payment (base + configs)
            const addonsTotal = item.instances?.reduce((instSum: number, inst: any) => {
              return instSum + (inst.selectedAddons?.reduce((addonSum: number, addon: any) => 
                addonSum + Number(addon.addon?.price || 0) * addon.quantity, 0) || 0);
            }, 0) || 0;
            // Total due today = setup fee + first recurring payment + addons
            return sum + ((setupFee + recurringAmount + addonsTotal) * quantity);
          }
          const productPrice = Number(item.productPrice ?? item.baseProductPrice ?? 0);
          return sum + (productPrice * quantity);
        }, 0);
      },

      getTodayTotal: () => {
        // Total due today = subtotal (already includes setup fee for recurring products)
        return Number(get().getSubtotal());
      },

      getTax: () => {
        // Calculate 18% tax on subtotal
        return Number(get().getSubtotal()) * 0.18;
      },

      getTotal: () => {
        // Total = subtotal + tax - discount
        const subtotal = Number(get().getSubtotal());
        const tax = Number(get().getTax());
        const discount = Number(get().discountAmount);
        return Math.max(0, subtotal + tax - discount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + safeNumber(item.quantity), 0);
      },

      getSetupFeeTotal: () => {
        return get().items.reduce((sum, item) => {
          const setupFee = Number(item.recurringData?.setupFee);
          const quantity = Number(item.quantity) || 1;
          // Check if setupFee is a valid number greater than 0
          if (!isNaN(setupFee) && setupFee > 0) {
            return sum + (setupFee * quantity);
          }
          return sum;
        }, 0);
      },

      // Clean stale formatted string data from cart
      cleanStaleData: () => {
        const items = get().items;
        
        const hasStaleData = items.some((item: CartItem) => {
          const rp = item.recurringData;
          if (!rp) return false;
          // Check if any numeric fields are strings with currency formatting
          const rpAny = rp as any;
          const hasStaleSetupFee = typeof rpAny.setupFee === 'string' && rpAny.setupFee.includes('₹');
          const hasStalePricePerCycle = typeof rpAny.pricePerCycle === 'string' && rpAny.pricePerCycle.includes('₹');
          const hasStaleBaseProductPrice = typeof rpAny.baseProductPrice === 'string' && rpAny.baseProductPrice.includes('₹');
          return hasStaleSetupFee || hasStalePricePerCycle || hasStaleBaseProductPrice;
        });
        
        if (hasStaleData) {
          const cleanedItems = items.map((item: CartItem) => {
            const rp = item.recurringData;
            if (!rp) return item;
            
            return {
              ...item,
              recurringData: {
                ...rp,
                setupFee: Number(rp.setupFee),
                pricePerCycle: Number(rp.pricePerCycle),
                baseProductPrice: Number(rp.baseProductPrice),
                totalForPeriod: Number(rp.totalForPeriod),
                monthlyEquivalent: Number(rp.monthlyEquivalent),
              },
              // Also clean item-level price fields
              unitPrice: Number(item.unitPrice),
              productPrice: Number(item.productPrice),
              baseProductPrice: Number(item.baseProductPrice),
              totalPrice: Number(item.totalPrice),
              recurringAmount: Number(item.recurringAmount),
            };
          });
          set({ items: cleanedItems });
          console.log("[Cart] Cleaned stale formatted string data from cart");
        }
      },
    }),
    {
      name: "naas-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
      }),
    }
  )
);

// Subscribe to store changes and recalculate totals on hydration/rehydration
if (typeof window !== "undefined") {
  useCartStore.subscribe((state: CartState) => {
    const items = state.items;
    
    // Debug logging for setup fee tracking
    if (typeof window !== "undefined") {
      const localStorageData = localStorage.getItem("naas-cart");
      if (localStorageData) {
        try {
          const parsed = JSON.parse(localStorageData);
          if (parsed?.state?.items) {
            const hasSetupFee = parsed.state.items.some((item: any) => 
              item.recurringData?.setupFee > 0
            );
            if (hasSetupFee) {
              console.log("[Cart Debug] Items with setup fee found in localStorage:", 
                parsed.state.items.map((item: any) => ({
                  id: item.id?.substring(0, 50),
                  recurringData: item.recurringData,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice
                }))
              );
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // Check if any items have invalid totalPrice and recalculate
    const needsRecalculation = items.some(
      (item: CartItem) => 
        typeof item.totalPrice !== "number" || 
        isNaN(item.totalPrice) || 
        !isFinite(item.totalPrice)
    );
    
    if (needsRecalculation) {
      const recalculatedItems = items.map((item: CartItem) => ({
        ...item,
        totalPrice: calculateItemTotal(item as Omit<CartItem, "id" | "totalPrice">),
      }));
      useCartStore.setState({ items: recalculatedItems });
    }
    
    // Clean any stale formatted string data in recurringData
    const hasStaleData = items.some((item: CartItem) => {
      const rp = item.recurringData;
      if (!rp) return false;
      // Check if any numeric fields are strings with currency formatting
      const rpAny = rp as any;
      const hasStaleSetupFee = typeof rpAny.setupFee === 'string' && rpAny.setupFee.includes('₹');
      const hasStalePricePerCycle = typeof rpAny.pricePerCycle === 'string' && rpAny.pricePerCycle.includes('₹');
      const hasStaleBaseProductPrice = typeof rpAny.baseProductPrice === 'string' && rpAny.baseProductPrice.includes('₹');
      return hasStaleSetupFee || hasStalePricePerCycle || hasStaleBaseProductPrice;
    });
    
    if (hasStaleData) {
      const cleanedItems = items.map((item: CartItem) => {
        const rp = item.recurringData;
        if (!rp) return item;
        
        return {
          ...item,
          recurringData: {
            ...rp,
            setupFee: Number(rp.setupFee),
            pricePerCycle: Number(rp.pricePerCycle),
            baseProductPrice: Number(rp.baseProductPrice),
            totalForPeriod: Number(rp.totalForPeriod),
            monthlyEquivalent: Number(rp.monthlyEquivalent),
          },
          // Also clean item-level price fields
          unitPrice: Number(item.unitPrice),
          productPrice: Number(item.productPrice),
          baseProductPrice: Number(item.baseProductPrice),
          totalPrice: Number(item.totalPrice),
          recurringAmount: Number(item.recurringAmount),
        };
      });
      useCartStore.setState({ items: cleanedItems });
      console.log("[Cart] Cleaned stale formatted string data from cart");
    }
  });
}
