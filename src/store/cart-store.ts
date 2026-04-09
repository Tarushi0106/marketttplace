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
  deploymentType?: 'cloud' | 'onPremise' | 'ai'; // Track which deployment type this item belongs to
  quantityLocked?: boolean; // When true, cart UI should not allow manual quantity changes
  cameraCount?: number; // For VSAAS items: the camera count this was configured for
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
  // Persistent cart data — survives checkout, shown on /cart page
  items: CartItem[];
  // UI-only sidebar state — cleared on checkout, shown in CartDrawer
  sidebarItems: CartItem[];
  isOpen: boolean;
  isCheckedOut: boolean; // true after checkout; cleared when new item is added
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
  clearSidebar: () => void;
  syncSidebarFromCart: () => void;
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
  const variantName = item.variant?.name || "default";
  const deploymentType = item.deploymentType || "default";
  const cameraKey = ""; // cameraCount not used in ID — same product accumulates quantity

  // Check for new instances format first
  if (item.instances && item.instances.length > 0) {
    const instancesHash = item.instances.map(inst => ({
      num: inst.instanceNumber,
      configs: inst.selectedConfigs?.map(c => ({ id: c.configId, value: c.value, price: c.price })) || [],
      addons: inst.selectedAddons?.map(a => ({ id: a.addon?.id || "", qty: a.quantity })) || [],
    }));
    return `${productId}-${variantId}-${variantName}-${deploymentType}${cameraKey}-instances-${JSON.stringify(instancesHash)}`;
  }

  // Legacy support for flat configs/addons
  const configsHash = JSON.stringify(item.selectedConfigs || []);
  const addonsHash = JSON.stringify(
    (item.selectedAddons || []).map(a => ({ id: a.addon?.id || "", qty: a.quantity })).sort((a, b) => a.id.localeCompare(b.id))
  );
  return `${productId}-${variantId}-${variantName}-${deploymentType}${cameraKey}-${configsHash}-${addonsHash}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sidebarItems: [],
      isOpen: false,
      discountCode: null,
      discountAmount: 0,
      isCheckedOut: false,

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

          console.log("[Cart] Item ID:", id.substring(0, 80) + "...");

          if (item.instances) {
            console.log("[Cart] Instances data:", JSON.stringify(item.instances).substring(0, 500));
          }

          // Helper: add-or-update an item in a list
          const applyToList = (list: CartItem[]): CartItem[] => {
            const existingIndex = list.findIndex((i) => i.id === id);
            if (existingIndex > -1) {
              const existing = list[existingIndex];
              const billingCycleChanged = existing.billingCycle !== item.billingCycle;
              const updated = [...list];
              if (billingCycleChanged) {
                updated[existingIndex] = {
                  ...existing,
                  ...item,
                  billingCycle: item.billingCycle,
                  isRecurring: item.isRecurring,
                  recurringData: item.recurringData,
                  unitPrice,
                  totalPrice: calculateItemTotal(item),
                };
              } else {
                updated[existingIndex] = {
                  ...existing,
                  ...item,
                  quantity: safeNumber(item.quantity),
                  totalPrice: calculateItemTotal({ ...existing, ...item }),
                };
              }
              return updated;
            } else {
              const newItem: CartItem = {
                ...item,
                quantity: safeNumber(item.quantity),
                unitPrice,
                id,
                totalPrice: unitPrice * safeNumber(item.quantity),
              };
              console.log("[Cart Debug] New cart item:", {
                id: newItem.id?.substring(0, 50),
                recurringData: newItem.recurringData,
                totalPrice: newItem.totalPrice,
              });
              return [...list, newItem];
            }
          };

          // If coming back after checkout, reset isCheckedOut flag (new session starts)
          const wasCheckedOut = get().isCheckedOut;

          set({
            items: applyToList(get().items),
            // New session after checkout: start sidebar fresh with only this new item
            sidebarItems: applyToList(wasCheckedOut ? [] : get().sidebarItems),
            isCheckedOut: false,
            isOpen: true,
          });
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
          sidebarItems: get().sidebarItems.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        const qty = safeNumber(quantity);
        if (qty < 1) {
          get().removeItem(id);
          return;
        }
        const updateList = (list: CartItem[]) =>
          list.map((item) => {
            if (item.id === id) {
              const updated = { ...item, quantity: qty };
              return { ...updated, totalPrice: calculateItemTotal(updated) };
            }
            return item;
          });
        set({ items: updateList(get().items), sidebarItems: updateList(get().sidebarItems) });
      },

      updateItem: (id, updates) => {
        const updateList = (list: CartItem[]) =>
          list.map((item) => {
            if (item.id === id) {
              const updated = { ...item, ...updates };
              return { ...updated, totalPrice: safeNumber(updated.unitPrice) * safeNumber(updated.quantity) };
            }
            return item;
          });
        set({ items: updateList(get().items), sidebarItems: updateList(get().sidebarItems) });
      },

      updateAddons: (id, addons) => {
        const updateList = (list: CartItem[]) =>
          list.map((item) => {
            if (item.id === id) {
              const updated = { ...item, selectedAddons: addons };
              return { ...updated, totalPrice: calculateItemTotal(updated) };
            }
            return item;
          });
        set({ items: updateList(get().items), sidebarItems: updateList(get().sidebarItems) });
      },

      clearCart: () => {
        set({ items: [], sidebarItems: [], discountCode: null, discountAmount: 0, isCheckedOut: false });
      },

      // Clear only the sidebar (called on checkout). Persistent cart items are preserved.
      clearSidebar: () => {
        set({ sidebarItems: [], isCheckedOut: true, isOpen: false });
      },

      // Sync sidebar from persistent cart (called when cart icon is clicked after checkout)
      syncSidebarFromCart: () => {
        set({ sidebarItems: [...get().items], isCheckedOut: false });
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
        // For recurring products: first recurring payment (base + configs) + addons (setup fee is separate)
        // For one-time products: productPrice (base + configs + addons)
        const subtotal = get().items.reduce((sum, item) => {
          const quantity = Number(item.quantity) || 1;
          // For recurring items, charge: first recurring payment + addons (setup fee is separate)
          if (item.isRecurring && item.billingCycle !== "ONE_TIME") {
            const recurringAmount = Number(item.recurringAmount) || 0; // First recurring payment (base + configs)
            const addonsTotal = item.instances?.reduce((instSum: number, inst: any) => {
              return instSum + (inst.selectedAddons?.reduce((addonSum: number, addon: any) =>
                addonSum + Number(addon.addon?.price || 0) * addon.quantity, 0) || 0);
            }, 0) || 0;
            // For quantityLocked VSAAS items: recurringAmount is already the full total (not per-unit)
            if (item.quantityLocked) {
              return sum + recurringAmount + addonsTotal;
            }
            // Total due today = (first recurring payment * quantity) + addons (setup fee is separate)
            // recurringAmount is the per-unit recurring price, so we multiply by quantity
            return sum + (recurringAmount * quantity) + addonsTotal;
          }
          const productPrice = Number(item.productPrice ?? item.baseProductPrice ?? 0);
          return sum + (productPrice * quantity);
        }, 0);
        
        // Debug log for validation
        if (typeof window !== 'undefined' && get().items.length > 0) {
          console.log('[Cart Debug] Subtotal calculated:', {
            subtotal,
            itemCount: get().items.length,
            items: get().items.map(item => ({
              name: item.product?.name || item.bundle?.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              baseProductPrice: item.baseProductPrice,
              productPrice: item.productPrice,
              isRecurring: item.isRecurring,
              billingCycle: item.billingCycle,
              recurringAmount: item.recurringAmount,
            }))
          });
        }
        
        return subtotal;
      },

      getTodayTotal: () => {
        // Total due today = subtotal + setup fee
        const subtotal = Number(get().getSubtotal());
        const setupFee = Number(get().getSetupFeeTotal());
        return subtotal + setupFee;
      },

      getTax: () => {
        // Calculate 18% tax on subtotal
        return Number(get().getSubtotal()) * 0.18;
      },

      getTotal: () => {
        // Total = subtotal + setup fee + tax - discount
        const subtotal = Number(get().getSubtotal());
        const setupFee = Number(get().getSetupFeeTotal());
        const tax = Number(get().getTax());
        const discount = Number(get().discountAmount);
        const total = Math.max(0, subtotal + setupFee + tax - discount);
        
        // Debug log for validation
        if (typeof window !== 'undefined' && get().items.length > 0) {
          console.log('[Cart Debug] Total calculated:', {
            subtotal,
            setupFee,
            tax,
            discount,
            total,
            itemCount: get().items.length,
          });
        }
        
        return total;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + safeNumber(item.quantity), 0);
      },

      getSetupFeeTotal: () => {
        return get().items.reduce((sum, item) => {
          const setupFee = Number(item.recurringData?.setupFee);
          // Check if setupFee is a valid number greater than 0
          // Setup fee is charged once per product, not multiplied by quantity
          if (!isNaN(setupFee) && setupFee > 0) {
            return sum + setupFee;
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
        isCheckedOut: state.isCheckedOut,
        // sidebarItems is intentionally NOT persisted — it is UI-only state
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
