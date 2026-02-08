import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WishlistItem {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedConfigs?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedAddons?: Record<string, any>;
  unitPrice: number;
  billingCycle?: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<WishlistItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  setIsOpen: (isOpen: boolean) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const id = `${item.product?.id || "unknown"}-${item.variant?.id || "default"}-${JSON.stringify(item.selectedConfigs)}`;
        
        // Check if item already exists
        if (get().isInWishlist(id)) {
          return;
        }

        const newItem: WishlistItem = {
          ...item,
          id,
          addedAt: new Date().toISOString(),
        };
        
        set({ items: [...get().items, newItem], isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: "naas-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
