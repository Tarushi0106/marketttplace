import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, ProductVariant, ProductAddon, Bundle } from "@/types";

export interface CartItem {
  id: string;
  product?: Product;
  variant?: ProductVariant;
  bundle?: Bundle;
  quantity: number;
  selectedAddons: {
    addon: ProductAddon;
    quantity: number;
  }[];
  selectedConfigs: {
    configId: string;
    configName?: string;
    value: string;
    priceModifier?: number;
    monthlyPriceModifier?: number;
    yearlyPriceModifier?: number;
    optionLabel?: string;
  }[];
  unitPrice: number;
  totalPrice: number;
  // Billing information
  billingCycle?: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRecurring?: boolean;
  // Recurring billing data
  recurringData?: {
    enabled: boolean;
    billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
    preferredTime: string;
    preferredDay: number;
    autoRenew: boolean;
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
  getItemCount: () => number;
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
  const unitPrice = safeNumber(item.unitPrice);
  const quantity = safeNumber(item.quantity);
  let total = unitPrice * quantity;

  return total || 0;
};

const calculateItemId = (item: Omit<CartItem, "id" | "totalPrice">): string => {
  const productId = item.product?.id || item.bundle?.id || "";
  const variantId = item.variant?.id || "default";
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

          if (existingItemIndex > -1) {
            // Update existing item quantity
            const items = [...get().items];
            items[existingItemIndex].quantity = safeNumber(items[existingItemIndex].quantity) + safeNumber(item.quantity);
            items[existingItemIndex].totalPrice = calculateItemTotal(
              items[existingItemIndex]
            );
            set({ items });
          } else {
            // Add new item
            const newItem: CartItem = {
              ...item,
              quantity: safeNumber(item.quantity),
              unitPrice,
              id,
              totalPrice: calculateItemTotal({ ...item, unitPrice }),
            };
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
        return get().items.reduce((sum, item) => sum + safeNumber(item.totalPrice), 0);
      },

      getTax: () => {
        // Calculate 18% tax
        return get().getSubtotal() * 0.18;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax();
        const discount = safeNumber(get().discountAmount);
        return Math.max(0, subtotal + tax - discount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + safeNumber(item.quantity), 0);
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
