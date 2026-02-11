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
  // For items with productPrice (new format): total = productPrice + setupFee
  // productPrice includes base + configs + addons
  const productPrice = safeNumber(item.productPrice ?? item.baseProductPrice);
  const setupFee = safeNumber(item.recurringData?.setupFee);
  const quantity = safeNumber(item.quantity);
  
  if (productPrice > 0) {
    return (productPrice + setupFee) * quantity;
  }
  
  // Fallback for legacy items: use unitPrice
  const unitPrice = safeNumber(item.unitPrice);
  return unitPrice * quantity;
};

const calculateItemId = (item: Omit<CartItem, "id" | "totalPrice">): string => {
  const productId = item.product?.id || item.bundle?.id || "";
  const variantId = item.variant?.id || "default";
  // Don't include billingCycle in ID - same product should update existing item
  
  // Check for new instances format first
  if (item.instances && item.instances.length > 0) {
    // Generate a hash from all instances' configs and addons
    const instancesHash = item.instances.map(inst => ({
      id: inst.instanceId,
      name: inst.instanceName,
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
              // Calculate totalPrice including baseProductPrice + setupFee
              totalPrice: (safeNumber(item.baseProductPrice) + safeNumber(item.recurringData?.setupFee)) * safeNumber(item.quantity),
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
        // Subtotal includes productPrice (base + configs + addons) for all items
        // This represents "Product Price (Due Today)"
        return get().items.reduce((sum, item) => {
          const productPrice = item.productPrice ?? item.baseProductPrice ?? 0;
          const quantity = safeNumber(item.quantity) || 1;
          return sum + (productPrice * quantity);
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
          const quantity = safeNumber(item.quantity) || 1;
          // Check if setupFee is a valid number greater than 0
          if (typeof setupFee === 'number' && setupFee > 0) {
            return sum + (setupFee * quantity);
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
    
    // Migration: Fix items that have incorrect baseProductPrice (includes configs)
    // These items were added before the fix and have baseProductPrice = productPrice
    // We need to recalculate baseProductPrice to be just the base product price
    const needsMigration = items.some((item: CartItem) => {
      // If item has instances with configs, and the first item's baseProductPrice equals the subtotal,
      // it likely needs migration
      if (item.instances && item.instances.length > 0 && item.baseProductPrice) {
        // Check if there are configs that might have 0 prices
        let hasConfigsWithZeroPrice = false;
        item.instances.forEach((instance) => {
          if (instance.selectedConfigs) {
            instance.selectedConfigs.forEach((config) => {
              if (!config.price || config.price === 0) {
                hasConfigsWithZeroPrice = true;
              }
            });
          }
        });
        return hasConfigsWithZeroPrice;
      }
      return false;
    });
    
    if (needsMigration) {
      console.log("[Cart] Migrating cart items to fix baseProductPrice and config prices");
      const migratedItems = items.map((item: CartItem) => {
        if (item.instances && item.instances.length > 0 && item.baseProductPrice) {
          // Calculate configs total by subtracting known base from total
          // We need to estimate the base product price
          // For now, use a simple heuristic: baseProductPrice should be around the product's base price
          
          // If baseProductPrice equals productPrice (when set), the base is incorrect
          // We need to estimate the correct base by checking what's typical
          
          let configsTotal = 0;
          let addonsTotal = 0;
          
          // Sum up instance config and addon prices
          if (item.instances) {
            item.instances.forEach((instance) => {
              if (instance.selectedConfigs) {
                instance.selectedConfigs.forEach((config) => {
                  configsTotal += config.price || 0;
                });
              }
              if (instance.selectedAddons) {
                instance.selectedAddons.forEach((addon) => {
                  addonsTotal += addon.addon?.price || 0;
                });
              }
            });
          }
          
          // The baseProductPrice should be total minus configs and addons
          // But if configsTotal is 0, we can't determine the breakdown
          // In this case, we'll try to estimate by looking at the total
          
          // If configsTotal is 0 but we have instances with configs,
          // the prices might not be stored correctly
          // We'll leave baseProductPrice as is for now
          
          if (configsTotal > 0 || addonsTotal > 0) {
            const newBaseProductPrice = Math.max(0, item.baseProductPrice - configsTotal - addonsTotal);
            
            console.log("[Cart] Migrated item:", {
              productName: item.product?.name,
              oldBaseProductPrice: item.baseProductPrice,
              newBaseProductPrice,
              configsTotal,
              addonsTotal
            });
            
            return {
              ...item,
              baseProductPrice: newBaseProductPrice,
            };
          }
        }
        return item;
      });
      useCartStore.setState({ items: migratedItems });
    }
  });
}
