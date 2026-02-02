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
    configName: string;
    value: string;
    priceModifier: number;
  }[];
  unitPrice: number;
  totalPrice: number;
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

const calculateItemTotal = (item: Omit<CartItem, "id" | "totalPrice">): number => {
  let total = item.unitPrice * item.quantity;

  // Add addon prices
  for (const addon of item.selectedAddons) {
    total += addon.addon.price * addon.quantity * item.quantity;
  }

  // Add config price modifiers
  for (const config of item.selectedConfigs) {
    total += config.priceModifier * item.quantity;
  }

  return total;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discountCode: null,
      discountAmount: 0,

      addItem: (item) => {
        const id = `${item.product?.id || item.bundle?.id}-${item.variant?.id || "default"}-${JSON.stringify(item.selectedConfigs)}`;
        const existingItemIndex = get().items.findIndex((i) => i.id === id);

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const items = [...get().items];
          items[existingItemIndex].quantity += item.quantity;
          items[existingItemIndex].totalPrice = calculateItemTotal(
            items[existingItemIndex]
          );
          set({ items });
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id,
            totalPrice: calculateItemTotal(item),
          };
          set({ items: [...get().items, newItem] });
        }

        set({ isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        const items = get().items.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, quantity };
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
        set({ discountCode: code, discountAmount: amount });
      },

      removeDiscount: () => {
        set({ discountCode: null, discountAmount: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getTax: () => {
        // Calculate 10% tax
        return get().getSubtotal() * 0.1;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax();
        const discount = get().discountAmount;
        return Math.max(0, subtotal + tax - discount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
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
