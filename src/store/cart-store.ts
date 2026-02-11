import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, ProductVariant, ProductAddon, Bundle } from "@/types";

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
    priceModifier?: number;
    monthlyPriceModifier?: number;
    yearlyPriceModifier?: number;
    optionLabel?: string;
  }[];
  // Pricing breakdown
  baseProductPrice?: number; // The one-time product price (if applicable)
  unitPrice?: number; // The price shown in cart (could be recurring or one-time)
  totalPrice?: number; // Total for the item
  // Billing information
  billingCycle?: "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRecurring?: boolean;
  // Recurring billing data
  recurringAmount?: number; // The recurring price per cycle
  recurringData?: {
    enabled: boolean;
    billingCycle: "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
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
}

// Helper function to safely convert values to numbers
const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const calculateItemTotal = (item: Omit<CartItem, "id" | "totalPrice">): number => {
  // For items with baseProductPrice (new format): total = baseProductPrice + setupFee
  const baseProductPrice = safeNumber(item.baseProductPrice);
  const setupFee = safeNumber(item.recurringData?.setupFee);
  const quantity = safeNumber(item.quantity);
  
  if (baseProductPrice > 0) {
    return (baseProductPrice + setupFee) * quantity;
  }
  
  // Fallback for legacy items: use unitPrice
  const unitPrice = safeNumber(item.unitPrice);
  return unitPrice * quantity;
};

const calculateItemId = (item: Omit<CartItem, "id" | "totalPrice">): string => {
  const productId = item.product?.id || item.bundle?.id || "";
  const variantId = item.variant?.id || "default";
  // Don't include billingCycle in ID - same product should update existing item
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
            console.error("Invalid cart item: no product or bundle");
            return;
          }
          
          const unitPrice = safeNumber(item.unitPrice);
          const id = calculateItemId(item);
          const existingItemIndex = get().items.findIndex((i) => i.id === id);

          console.log("[Cart Debug] Adding item to cart:", {
            productName: item.product?.name,
            id,
            existingItemIndex,
            billingCycle: item.billingCycle,
          });

          if (existingItemIndex > -1) {
            // Check if billing cycle changed - update billing info instead of adding quantity
            const existingItem = get().items[existingItemIndex];
            const billingCycleChanged = existingItem.billingCycle !== item.billingCycle;
            
            if (billingCycleChanged) {
              // Update billing cycle and pricing
              const items = [...get().items];
              items[existingItemIndex] = {
                ...items[existingItemIndex],
                billingCycle: item.billingCycle,
                isRecurring: item.isRecurring,
                recurringData: item.recurringData,
                unitPrice: unitPrice,
                totalPrice: unitPrice * (safeNumber(item.quantity) || 1),
              };
              console.log("[Cart Debug] Updated existing item billing cycle:", item.billingCycle);
              set({ items });
            } else {
              // Same billing cycle - update quantity
              const items = [...get().items];
              items[existingItemIndex].quantity = safeNumber(items[existingItemIndex].quantity) + safeNumber(item.quantity);
              items[existingItemIndex].totalPrice = calculateItemTotal(
                items[existingItemIndex]
              );
              console.log("[Cart Debug] Updated existing item quantity");
              set({ items });
            }
          } else {
            // Add new item
            const newItem: CartItem = {
              ...item,
              quantity: safeNumber(item.quantity),
              unitPrice,
              id,
              totalPrice: calculateItemTotal({ ...item, unitPrice }),
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
        // Subtotal includes baseProductPrice (one-time product price) for all items
        return get().items.reduce((sum, item) => {
          const basePrice = safeNumber(item.baseProductPrice);
          const quantity = safeNumber(item.quantity) || 1;
          return sum + (basePrice * quantity);
        }, 0);
      },

      getTodayTotal: () => {
        // Total due today = subtotal (baseProductPrice) + setup fees
        const subtotal = get().getSubtotal();
        const setupFee = get().getSetupFeeTotal();
        return subtotal + setupFee;
      },

      getTax: () => {
        // Calculate 18% tax
        return get().getSubtotal() * 0.18;
      },

      getTotal: () => {
        // Total = Today Total (baseProductPrice + setup fees) + tax - discount
        const todayTotal = get().getTodayTotal();
        const tax = get().getTax();
        const discount = safeNumber(get().discountAmount);
        return Math.max(0, todayTotal + tax - discount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + safeNumber(item.quantity), 0);
      },

      getSetupFeeTotal: () => {
        return get().items.reduce((sum, item) => {
          const setupFee = item.recurringData?.setupFee;
          // Check if setupFee is a valid number greater than 0
          if (typeof setupFee === 'number' && setupFee > 0) {
            return sum + setupFee;
          }
          return sum;
        }, 0);
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
  });
}
