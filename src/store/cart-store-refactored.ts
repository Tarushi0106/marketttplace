import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, ProductVariant, ProductAddon, Bundle } from "@/types";

// ============================================================
// CENTRALIZED STATE STRUCTURE
// ============================================================

export interface CartItem {
  id: string;
  product?: Product;
  variant?: ProductVariant;
  bundle?: Bundle;
  quantity: number;
  deploymentType?: 'cloud' | 'onPremise' | 'ai';
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
    price?: number;
    priceModifier?: number;
    monthlyPriceModifier?: number;
    yearlyPriceModifier?: number;
    optionLabel?: string;
  }[];
  // Pricing - SINGLE SOURCE OF TRUTH
  unitPrice: number; // Price per unit (recurring or one-time)
  billingCycle?: "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";
  isRecurring?: boolean;
  // Setup fee (one-time)
  setupFee?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discountCode: string | null;
  discountAmount: number;
  // Global billing cycle for consistency
  globalBillingCycle: "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL";

  // Actions - IMMUTABLE UPDATES ONLY
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<Omit<CartItem, "id">>) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  setGlobalBillingCycle: (cycle: CartState["globalBillingCycle"]) => void;

  // Computed - PURE FUNCTIONS (no side effects)
  getCartTotals: () => CartTotals;
  getItemCount: () => number;
}

interface CartTotals {
  subtotal: number;
  tax: number;
  setupTotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

// ============================================================
// PURE PRICING ENGINE - SINGLE SOURCE OF TRUTH
// ============================================================

/**
 * PURE FUNCTION: Calculate all cart totals
 * This is the ONLY place where pricing calculations happen
 * No side effects, no state mutations
 */
export function calculateCartTotals(
  items: CartItem[],
  discountAmount: number = 0
): CartTotals {
  let subtotal = 0;
  let setupTotal = 0;
  let itemCount = 0;

  // Calculate each item's contribution
  items.forEach((item) => {
    const quantity = Math.max(1, item.quantity || 1);
    itemCount += quantity;

    // Item total = unitPrice * quantity
    const itemTotal = (item.unitPrice || 0) * quantity;
    subtotal += itemTotal;

    // Setup fee (one-time charge per item)
    if (item.setupFee && item.setupFee > 0) {
      setupTotal += item.setupFee * quantity;
    }
  });

  // Tax calculation (18% on subtotal)
  const tax = subtotal * 0.18;

  // Total = subtotal + tax + setupTotal - discount
  const total = Math.max(0, subtotal + tax + setupTotal - discountAmount);

  // Debug logging
  if (typeof window !== 'undefined' && items.length > 0) {
    console.log('[Cart Engine] Calculated totals:', {
      itemCount,
      subtotal,
      tax,
      setupTotal,
      discount: discountAmount,
      total,
      items: items.map(item => ({
        name: item.product?.name || item.bundle?.name || 'Unknown',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        setupFee: item.setupFee,
        billingCycle: item.billingCycle,
      }))
    });
  }

  return {
    subtotal,
    tax,
    setupTotal,
    discount: discountAmount,
    total,
    itemCount,
  };
}

// ============================================================
// HELPER FUNCTIONS - PURE (NO SIDE EFFECTS)
// ============================================================

/**
 * PURE FUNCTION: Safely convert value to number
 */
const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * PURE FUNCTION: Calculate unique item ID
 * Prevents duplicate items and ensures proper merging
 */
const calculateItemId = (item: Omit<CartItem, "id">): string => {
  const productId = item.product?.id || item.bundle?.id || "";
  const variantId = item.variant?.id || "default";
  const deploymentType = item.deploymentType || "default";
  
  // Check for new instances format first
  if (item.instances && item.instances.length > 0) {
    const instancesHash = item.instances.map(inst => ({
      num: inst.instanceNumber,
      configs: inst.selectedConfigs?.map(c => ({ id: c.configId, value: c.value, price: c.price })) || [],
      addons: inst.selectedAddons?.map(a => ({ id: a.addon?.id || "", qty: a.quantity })) || [],
    }));
    return `${productId}-${variantId}-${deploymentType}-instances-${JSON.stringify(instancesHash)}`;
  }
  
  // Legacy support for flat configs/addons
  const configsHash = JSON.stringify(item.selectedConfigs || []);
  const addonsHash = JSON.stringify(
    (item.selectedAddons || []).map(a => ({ id: a.addon?.id || "", qty: a.quantity })).sort((a, b) => a.id.localeCompare(b.id))
  );
  return `${productId}-${variantId}-${deploymentType}-${configsHash}-${addonsHash}`;
};

// ============================================================
// ZUSTAND STORE - CENTRALIZED STATE
// ============================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discountCode: null,
      discountAmount: 0,
      globalBillingCycle: "MONTHLY",

      // ============================================================
      // ACTIONS - IMMUTABLE UPDATES ONLY
      // ============================================================

      addItem: (item) => {
        try {
          // Validate item data
          if (!item.product && !item.bundle) {
            console.error("[Cart] Invalid cart item: no product or bundle");
            return;
          }

          console.log("[Cart] Adding item to cart:", {
            productName: item.product?.name || item.bundle?.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            setupFee: item.setupFee,
          });

          const id = calculateItemId(item);
          const existingItemIndex = get().items.findIndex((i) => i.id === id);

          console.log("[Cart] Item ID:", id.substring(0, 80) + "...");
          console.log("[Cart] Existing item index:", existingItemIndex);

          if (existingItemIndex > -1) {
            // Update existing item - IMMUTABLE UPDATE
            const items = [...get().items];
            const existingItem = items[existingItemIndex];
            
            items[existingItemIndex] = {
              ...existingItem,
              ...item,
              id,
              quantity: safeNumber(item.quantity), // Replace quantity, don't add
              unitPrice: safeNumber(item.unitPrice),
              setupFee: safeNumber(item.setupFee),
            };

            console.log("[Cart] Updated existing item");
            set({ items });
          } else {
            // Add new item - IMMUTABLE UPDATE
            const newItem: CartItem = {
              ...item,
              id,
              quantity: safeNumber(item.quantity),
              unitPrice: safeNumber(item.unitPrice),
              setupFee: safeNumber(item.setupFee),
            };

            console.log("[Cart] Added new item:", {
              id: newItem.id?.substring(0, 50),
              name: newItem.product?.name || newItem.bundle?.name,
              quantity: newItem.quantity,
              unitPrice: newItem.unitPrice,
            });

            set({ items: [...get().items, newItem] });
          }

          set({ isOpen: true });
        } catch (error) {
          console.error("[Cart] Error adding item to cart:", error);
        }
      },

      removeItem: (id) => {
        console.log("[Cart] Removing item:", id);
        // IMMUTABLE UPDATE
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const qty = safeNumber(quantity);
        console.log("[Cart] Updating quantity:", { id, quantity: qty });

        if (qty < 1) {
          get().removeItem(id);
          return;
        }

        // IMMUTABLE UPDATE
        const items = get().items.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: qty };
          }
          return item;
        });
        set({ items });
      },

      updateItem: (id, updates) => {
        console.log("[Cart] Updating item:", { id, updates });
        // IMMUTABLE UPDATE
        const items = get().items.map((item) => {
          if (item.id === id) {
            return { ...item, ...updates };
          }
          return item;
        });
        set({ items });
      },

      clearCart: () => {
        console.log("[Cart] Clearing cart");
        set({ items: [], discountCode: null, discountAmount: 0 });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      applyDiscount: (code, amount) => {
        console.log("[Cart] Applying discount:", { code, amount });
        set({ discountCode: code, discountAmount: safeNumber(amount) });
      },

      removeDiscount: () => {
        console.log("[Cart] Removing discount");
        set({ discountCode: null, discountAmount: 0 });
      },

      setGlobalBillingCycle: (cycle) => {
        console.log("[Cart] Setting global billing cycle:", cycle);
        set({ globalBillingCycle: cycle });
      },

      // ============================================================
      // COMPUTED - PURE FUNCTIONS (NO SIDE EFFECTS)
      // ============================================================

      getCartTotals: () => {
        const { items, discountAmount } = get();
        return calculateCartTotals(items, discountAmount);
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
        globalBillingCycle: state.globalBillingCycle,
      }),
    }
  )
);

// ============================================================
// DEBUG MODE - CONSOLE LOGS
// ============================================================

if (typeof window !== "undefined") {
  // Log cart state changes
  useCartStore.subscribe((state: CartState) => {
    console.log("[Cart Debug] State changed:", {
      itemCount: state.items.length,
      items: state.items.map(item => ({
        id: item.id?.substring(0, 50),
        name: item.product?.name || item.bundle?.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        setupFee: item.setupFee,
        billingCycle: item.billingCycle,
      })),
      discountCode: state.discountCode,
      discountAmount: state.discountAmount,
      globalBillingCycle: state.globalBillingCycle,
    });

    // Log calculated totals
    const totals = calculateCartTotals(state.items, state.discountAmount);
    console.log("[Cart Debug] Calculated totals:", totals);
  });

  // Clean stale data on hydration
  const cleanStaleData = () => {
    const items = useCartStore.getState().items;
    
    const hasStaleData = items.some((item: CartItem) => {
      // Check if any numeric fields are strings with currency formatting
      const hasStaleUnitPrice = typeof item.unitPrice === 'string' && (item.unitPrice as any).includes('₹');
      const hasStaleSetupFee = typeof item.setupFee === 'string' && (item.setupFee as any).includes('₹');
      return hasStaleUnitPrice || hasStaleSetupFee;
    });
    
    if (hasStaleData) {
      const cleanedItems = items.map((item: CartItem) => ({
        ...item,
        unitPrice: safeNumber(item.unitPrice),
        setupFee: safeNumber(item.setupFee),
        quantity: safeNumber(item.quantity),
      }));
      useCartStore.setState({ items: cleanedItems });
      console.log("[Cart] Cleaned stale formatted string data from cart");
    }
  };

  // Clean on hydration
  setTimeout(cleanStaleData, 1000);
}
