"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, ShoppingCart, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface AddonOption {
  label: string;
  price: number;
  unit?: string;
  recurringPricesObj?: {
    monthly?: number | null;
    quarterly?: number | null;
    yearly?: number | null;
    biennial?: number | null;
    triennial?: number | null;
    semiAnnual?: number | null;
  } | null;
}

interface Addon {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit?: string | null;
  quantity?: number;
  group?: string; // For grouping addons in dropdown
  options?: AddonOption[]; // For dropdown options (e.g., Cloud Storage - 4 Days, 27 Days, etc.)
  recurringPricesObj?: {
    monthly?: number | null;
    quarterly?: number | null;
    yearly?: number | null;
    biennial?: number | null;
    triennial?: number | null;
    semiAnnual?: number | null;
  } | null;
}

interface BillingPlan {
  id: string;
  label: string;
  period: string;
  price: number;
  savings?: number;
}

interface TallyCloudConfiguratorProps {
  productId?: string;
  productSlug?: string;
  productName?: string;
  productDescription?: string;
  basePrice: number;
  addons: Addon[];
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    isDefault?: boolean;
    attributes?: Record<string, string>;
    billingType?: string;
    setupFee?: number;
    minQuantity?: number;
    maxQuantity?: number | null;
    recurringPricesObj?: {
      monthly?: number | null;
      quarterly?: number | null;
      yearly?: number | null;
      biennial?: number | null;
      triennial?: number | null;
      semiAnnual?: number | null;
    } | null;
    recurringPrices?: Array<{
      id: string;
      variantId: string | null;
      monthlyPrice: number | null;
      quarterlyPrice: number | null;
      yearlyPrice: number | null;
      biMonthlyPrice: number | null;
      fourMonthlyPrice: number | null;
      semiAnnualPrice: number | null;
      triAnnualPrice: number | null;
      biennialPrice: number | null;
      triennialPrice: number | null;
    }>;
  }>;
  selectedVariantId?: string | null;
  billingPlans?: BillingPlan[];
  /** When provided, the variant is locked and cannot be changed. Shows "Selected Plan" display instead of "Select Plan" section */
  lockedVariantId?: string | null;
}

export function TallyCloudConfigurator({
  productId,
  productSlug,
  productName = "Tally Cloud Server",
  productDescription = "",
  basePrice = 4500,
  addons = [],
  variants = [],
  selectedVariantId = null,
  lockedVariantId = null,
  billingPlans = [
    { id: "monthly", label: "Monthly", period: "/month", price: 4500 },
    { id: "quarterly", label: "Quarterly", period: "/quarter", price: 12900, savings: 6 },
    { id: "semi-annual", label: "Semi Annual", period: "/6 months", price: 24300, savings: 10 },
    { id: "yearly", label: "Yearly", period: "/year", price: 43200, savings: 20 },
  ],
}: TallyCloudConfiguratorProps) {
  const router = useRouter();
  const { addItem: addToCart } = useCartStore();
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  // ============================================
  // BILLING CYCLE PRICING LOGIC - SINGLE SOURCE OF TRUTH
  // ============================================
  
  // Multipliers for each billing cycle (how many months)
  const billingMultipliers: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    'semi-annual': 6,
    yearly: 12,
  };

  // Labels for each billing cycle
  const billingLabels: Record<string, string> = {
    monthly: "month",
    quarterly: "quarter",
    'semi-annual': "6 months",
    yearly: "year",
  };

  // SINGLE FUNCTION: Get final price based on billing cycle
  // Uses monthly base price and applies multiplier
  const getFinalPrice = (basePrice: number, cycle: string): number => {
    const multiplier = billingMultipliers[cycle] || 1;
    return basePrice * multiplier;
  };

  // Helper function to get price based on billing cycle
  // First checks if option has recurringPricesObj, otherwise uses base price with multiplier
  const getDynamicPrice = (basePrice: number, cycle: string, recurringPricesObj?: any): number => {
    // If option has recurringPricesObj, use the specific price for the billing cycle
    if (recurringPricesObj) {
      const priceKeyMap: Record<string, string> = {
        monthly: 'monthly',
        quarterly: 'quarterly',
        'semi-annual': 'semiAnnual',
        yearly: 'yearly'
      };
      const priceKey = priceKeyMap[cycle];
      if (priceKey && recurringPricesObj[priceKey] !== undefined && recurringPricesObj[priceKey] !== null) {
        return recurringPricesObj[priceKey];
      }
    }
    // Fallback: use base price with multiplier
    return getFinalPrice(basePrice, cycle);
  };

  // Discounts for each billing cycle
  const billingDiscounts: Record<string, number> = {
    monthly: 0,
    quarterly: 0.05,  // 5% discount
    'semi-annual': 0.10, // 10% discount
    yearly: 0.20,    // 20% discount
  };

  // Calculate addon price based on billing cycle
  const calculateAddonPrice = (basePrice: number, quantity: number, cycle: string): number => {
    console.log("calculateAddonPrice called:", { basePrice, quantity, cycle, multiplier: billingMultipliers[cycle], discount: billingDiscounts[cycle] });
    const multiplier = billingMultipliers[cycle] || 1;
    const discount = billingDiscounts[cycle] || 0;
    const total = basePrice * quantity * multiplier;
    const finalPrice = total - (total * discount);
    console.log("calculateAddonPrice result:", { total, finalPrice });
    return finalPrice;
  };

  // Get display price per billing period
  const getDisplayAddonPrice = (basePrice: number, quantity: number, cycle: string): number => {
    const multiplier = billingMultipliers[cycle] || 1;
    const discount = billingDiscounts[cycle] || 0;
    const total = basePrice * quantity * multiplier;
    const finalPrice = total - (total * discount);
    return finalPrice;
  };

  // Get savings amount for display
  const getAddonSavings = (basePrice: number, quantity: number, cycle: string): number => {
    const multiplier = billingMultipliers[cycle] || 1;
    const discount = billingDiscounts[cycle] || 0;
    const total = basePrice * quantity * multiplier;
    return total * discount;
  };

  // Get billing suffix for display
  const getBillingSuffix = (cycle: string): string => {
    switch (cycle) {
      case 'monthly': return '/mo';
      case 'quarterly': return '/quarter';
      case 'semi-annual': return '/6 months';
      case 'yearly': return '/year';
      default: return '/period';
    }
  };

  // ============================================
  
  // Determine if variant is locked (configure page) or selectable (pricing page)
  const isVariantLocked = !!lockedVariantId;
  
  // Initialize selected variant - use lockedVariantId if provided, otherwise use selectedVariantId prop
  // When locked, the variant cannot be changed
  const defaultVariantId = variants && variants.length > 0 
    ? (lockedVariantId && variants.some(v => v.id === lockedVariantId) 
        ? lockedVariantId 
        : (selectedVariantId && variants.some(v => v.id === selectedVariantId) 
            ? selectedVariantId 
            : variants.find(v => v.isDefault)?.id || variants[0]?.id))
    : null;
  const [selectedVariant, setSelectedVariant] = useState<string | null>(defaultVariantId);

  // Generate billing plans from the selected variant's recurring prices
  const generatedBillingPlans = useMemo(() => {
    console.log("Generating billing plans:", { selectedVariant, variants });
    
    if (!selectedVariant || variants.length === 0) {
      console.log("No selected variant, returning default billing plans");
      return billingPlans; // Fall back to default billing plans
    }
    
    const variant = variants.find(v => v.id === selectedVariant);
    console.log("Found variant:", variant?.name, "recurringPrices:", variant?.recurringPrices);
    
    // Use recurringPrices array from the database
    if (variant?.recurringPrices && variant.recurringPrices.length > 0) {
      const rp = variant.recurringPrices[0]; // Use the first set of recurring prices
      const plans: BillingPlan[] = [];
      
      // Monthly price - use variant.price as base, fallback to rp.monthlyPrice
      const monthlyPrice = variant.price || (rp.monthlyPrice ? Number(rp.monthlyPrice) : null);
      if (monthlyPrice) {
        plans.push({ id: "monthly", label: "Monthly", period: "/month", price: Number(monthlyPrice) });
      }
      
      // Quarterly price
      if (rp.quarterlyPrice !== null) {
        const price = Number(rp.quarterlyPrice);
        const savings = monthlyPrice ? Math.round(((monthlyPrice * 3 - price) / (monthlyPrice * 3)) * 100) : undefined;
        plans.push({ id: "quarterly", label: "Quarterly", period: "/quarter", price, savings });
      } else if (monthlyPrice) {
        // Calculate quarterly as monthly * 3
        const price = monthlyPrice * 3;
        plans.push({ id: "quarterly", label: "Quarterly", period: "/quarter", price });
      }
      
      // Semi-annual price
      if (rp.semiAnnualPrice !== null) {
        const price = Number(rp.semiAnnualPrice);
        const savings = monthlyPrice ? Math.round(((monthlyPrice * 6 - price) / (monthlyPrice * 6)) * 100) : undefined;
        plans.push({ id: "semi-annual", label: "Semi Annual", period: "/6 months", price, savings });
      } else if (monthlyPrice) {
        // Calculate semi-annual as monthly * 6
        const price = monthlyPrice * 6;
        plans.push({ id: "semi-annual", label: "Semi Annual", period: "/6 months", price });
      }
      
      // Yearly price
      if (rp.yearlyPrice !== null) {
        const price = Number(rp.yearlyPrice);
        const savings = monthlyPrice ? Math.round(((monthlyPrice * 12 - price) / (monthlyPrice * 12)) * 100) : undefined;
        plans.push({ id: "yearly", label: "Yearly", period: "/year", price, savings });
      } else if (monthlyPrice) {
        // Calculate yearly as monthly * 12
        const price = monthlyPrice * 12;
        plans.push({ id: "yearly", label: "Yearly", period: "/year", price });
      }
      
      console.log("Generated plans from recurringPrices:", plans);
      return plans.length > 0 ? plans : billingPlans;
    }
    
    // If no recurring prices, use variant.price as monthly
    if (variant?.price) {
      const monthlyPrice = Number(variant.price);
      return [
        { id: "monthly", label: "Monthly", period: "/month", price: monthlyPrice },
        { id: "quarterly", label: "Quarterly", period: "/quarter", price: monthlyPrice * 3 },
        { id: "semi-annual", label: "Semi Annual", period: "/6 months", price: monthlyPrice * 6 },
        { id: "yearly", label: "Yearly", period: "/year", price: monthlyPrice * 12 },
      ];
    }
    
    return billingPlans;
  }, [selectedVariant, variants, billingPlans]);

  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>(generatedBillingPlans[0]);
  
  // Separate billing cycle state for simpler control
  const [billingCycle, setBillingCycle] = useState<string>("monthly");
  
  // Debug: Log billing cycle changes
  const handleBillingCycleChange = (newCycle: string) => {
    console.log('Billing cycle changed:', { from: billingCycle, to: newCycle });
    setBillingCycle(newCycle);
  };

  // Sync billingCycle with selectedPlan when plan changes
  useEffect(() => {
    console.log("Billing:", billingCycle, "Selected Plan:", selectedPlan?.id);
    if (selectedPlan && selectedPlan.id) {
      setBillingCycle(selectedPlan.id);
    }
  }, [selectedPlan?.id]);

  // Update selected plan when generated billing plans change (variant changes)
  useEffect(() => {
    if (generatedBillingPlans.length > 0) {
      const currentPlan = generatedBillingPlans.find(p => p.id === selectedPlan.id);
      if (!currentPlan) {
        setSelectedPlan(generatedBillingPlans[0]);
      }
    }
  }, [generatedBillingPlans, selectedPlan.id]);

  // Group addons by base name (use group field if available, otherwise parse from name)
  const groupedAddons = useMemo(() => {
    const groups: Record<string, Addon[]> = {};
    addons.forEach(addon => {
      // Use explicit group field if available, otherwise parse from name
      // Match patterns like "Cloud Storage - 4 Days", "Cloud Storage - 27 Days" -> "Cloud Storage"
      let groupName = addon.group || addon.name.replace(/\s*-\s+.+$/, '').trim();
      
      // Special handling for Cloud Storage
      if (addon.name && addon.name.includes('Cloud - Storage')) {
        groupName = 'Cloud - Storage';
      }
      
      console.log('Grouping addon:', addon.name, '-> group:', groupName);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(addon);
    });
    // Return groups sorted: Licences first, then Cloud Storage, then others
    return Object.entries(groups).filter(([name, items]) => {
      console.log('Group:', name, 'has', items.length, 'items');
      const isCloudStorageGroup = name === 'Cloud Storage' || 
        name === 'Cloud - Storage' || 
        name === 'Cloud' ||
        name.toLowerCase().includes('cloud storage');
      return items.length > 1 || isCloudStorageGroup;
    }).sort(([nameA], [nameB]) => {
      // Sort: Licences first, then others, then Cloud Storage last
      const isCloudStorageA = nameA.toLowerCase().includes('cloud storage');
      const isCloudStorageB = nameB.toLowerCase().includes('cloud storage');
      const isLicencesA = nameA.toLowerCase().includes('licence') || nameA.toLowerCase().includes('license');
      const isLicencesB = nameB.toLowerCase().includes('licence') || nameB.toLowerCase().includes('license');
      
      if (isLicencesA && !isLicencesB) return -1;
      if (!isLicencesA && isLicencesB) return 1;
      if (isCloudStorageA && !isCloudStorageB) return 1;
      if (!isCloudStorageA && isCloudStorageB) return -1;
      return 0;
    });
  }, [addons]);

  // Get standalone addons (not part of a group with multiple options)
  // But exclude Cloud Storage since it's handled specially
  const standaloneAddons = useMemo(() => {
    const groupNames = new Set(groupedAddons.map(([name]) => name));
    return addons.filter(addon => {
      const groupName = (addon as any).group || addon.name.replace(/\s*-\s*\d+.*$/, '').trim();
      const isCloudStorage = groupName === 'Cloud Storage' || 
        groupName === 'Cloud - Storage' || 
        groupName === 'Cloud' ||
        groupName.toLowerCase().includes('cloud storage');
      // Exclude Cloud Storage from standalone addons (it's handled in groupedAddons)
      return !groupNames.has(groupName) && !isCloudStorage;
    });
  }, [addons, groupedAddons]);

  // Track selected dropdown values (for single-select)
  const [selectedDropdownAddon, setSelectedDropdownAddon] = useState<Record<string, string>>({});

  // Track open/closed state of dropdown sections
  const [openDropdownSections, setOpenDropdownSections] = useState<Record<string, boolean>>({});

  // Toggle dropdown section open/close
  const toggleDropdownSection = (sectionName: string) => {
    setOpenDropdownSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Track MULTI-SELECT for dropdown groups with quantities
  interface SelectedAddonOption {
    id: string;
    name: string;
    price: number;
    qty: number;
  }
  const [multiSelectedAddons, setMultiSelectedAddons] = useState<Record<string, SelectedAddonOption[]>>({});

  // Handler for multi-select addon changes with quantities
  const handleMultiAddonChange = (groupName: string, selectedOptions: SelectedAddonOption[]) => {
    setMultiSelectedAddons(prev => ({
      ...prev,
      [groupName]: selectedOptions
    }));
    
    // Update addonQuantities to reflect selection with quantities
    setAddonQuantities(prev => {
      const updated = { ...prev };
      const group = groupedAddons.find(([name]) => name === groupName);
      if (!group) return prev;
      const [_, items] = group;
      
      // Clear all items in this group first
      items.forEach(item => {
        updated[item.id] = 0;
      });
      
      // Set selected items with their quantities
      selectedOptions.forEach(opt => {
        updated[opt.id] = opt.qty;
      });
      
      return updated;
    });
  };
   
  // Track selected option index for addons with options
  const [selectedAddonOption, setSelectedAddonOption] = useState<Record<string, number>>({});

  // Initialize dropdown selections with first option
  useMemo(() => {
    groupedAddons.forEach(([baseName, items]) => {
      if (!selectedDropdownAddon[baseName] && items.length > 0) {
        setSelectedDropdownAddon(prev => ({ ...prev, [baseName]: items[0].id }));
      }
    });
  }, [groupedAddons]);

  const toggleAddon = (addonId: string) => {
    setAddonQuantities((prev) => {
      const newQuantities = { ...prev };
      if (newQuantities[addonId] > 0) {
        newQuantities[addonId] = 0;
      } else {
        newQuantities[addonId] = 1;
      }
      return newQuantities;
    });
  };

  const updateQuantity = (addonId: string, delta: number) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addonId] || 0;
      const newQty = Math.max(0, Math.min(4, currentQty + delta));
      return { ...prev, [addonId]: newQty };
    });
  };

  const selectedAddonObjects = useMemo(() => {
    return addons
      .filter((addon) => (addonQuantities[addon.id] || 0) > 0)
      .map((addon) => {
        // Get the actual price (option price if available)
        let actualPrice = addon.price;
        let selectedOptionLabel: string | undefined;
        
        if (addon.options && addon.options.length > 0) {
          const selectedOptionIndex = selectedAddonOption[addon.id] ?? 0;
          const option = addon.options[selectedOptionIndex];
          if (option) {
            actualPrice = option.price;
            selectedOptionLabel = option.label;
          }
        }
        
        return {
          ...addon,
          price: actualPrice,
          quantity: addonQuantities[addon.id] || 0,
          selectedOption: selectedOptionLabel,
        };
      });
  }, [addons, addonQuantities, selectedAddonOption]);

  // Helper function to get addon price based on billing cycle
  // Uses getFinalPrice which multiplies base price by billing cycle multiplier
  const getAddonPriceForCycle = (addon: any, cycle: string): number => {
    // First check if addon has recurringPricesObj
    if (addon.recurringPricesObj) {
      const priceMap: Record<string, number | null | undefined> = {
        monthly: addon.recurringPricesObj.monthly,
        quarterly: addon.recurringPricesObj.quarterly,
        'semi-annual': addon.recurringPricesObj.semiAnnual,
        yearly: addon.recurringPricesObj.yearly,
      };
      const price = priceMap[cycle];
      if (price !== null && price !== undefined) {
        return price;
      }
      // Fallback to monthly
      if (priceMap.monthly !== null && priceMap.monthly !== undefined) {
        return priceMap.monthly;
      }
    }
    // Fallback: use getFinalPrice with base price (monthly price)
    return getFinalPrice(addon.price || 0, cycle);
  };

  const addonsTotal = useMemo(() => {
    return addons.reduce((sum, addon) => {
      const qty = addonQuantities[addon.id] || 0;
      if (qty === 0) return sum;
      
      // Use option price if addon has options
      if (addon.options && addon.options.length > 0) {
        const selectedOptionIndex = selectedAddonOption[addon.id] ?? 0;
        const option = addon.options[selectedOptionIndex];
        const basePrice = option ? option.price : addon.price;
        // Use getFinalPrice for dynamic billing cycle pricing
        return sum + (getFinalPrice(basePrice, billingCycle) * qty);
      }
      
      // Use getFinalPrice for dynamic billing cycle pricing
      const addonPrice = getAddonPriceForCycle(addon, billingCycle);
      return sum + (addonPrice * qty);
    }, 0);
  }, [addons, addonQuantities, selectedAddonOption, billingCycle]);

  // Helper function to get price based on billing cycle
  // First checks if variant has specific prices in recurringPricesObj, otherwise uses base price with multiplier
  const getPriceForBillingCycle = (variant: any, cycle: string): number => {
    console.log("getPriceForBillingCycle: variant.price =", variant?.price, "cycle =", cycle, "recurringPricesObj =", variant?.recurringPricesObj);
    
    // First check if recurringPricesObj has a specific price for this billing cycle
    if (variant?.recurringPricesObj) {
      // Map cycle names to recurringPricesObj keys
      const priceKeyMap: Record<string, string> = {
        monthly: 'monthly',
        quarterly: 'quarterly',
        'semi-annual': 'semiAnnual',
        yearly: 'yearly'
      };
      const priceKey = priceKeyMap[cycle];
      if (priceKey && variant.recurringPricesObj[priceKey] !== undefined && variant.recurringPricesObj[priceKey] !== null) {
        console.log("Using recurringPricesObj price:", variant.recurringPricesObj[priceKey]);
        return variant.recurringPricesObj[priceKey];
      }
    }
    
    // Fallback: Use getFinalPrice with base price (monthly price) - applies multiplier for billing cycle
    const basePrice = variant?.price || 0;
    return getFinalPrice(basePrice, cycle);
  };

  // Get billing cycle label
  const getBillingLabel = (cycle: string): string => {
    const labelMap: Record<string, string> = {
      monthly: "Monthly Plan",
      quarterly: "Quarterly Plan",
      "semi-annual": "Semi Annual Plan",
      yearly: "Yearly Plan",
    };
    return labelMap[cycle] || cycle;
  };

  // Get the base price - use variant.price as the single source of truth
  const variantPrice = useMemo(() => {
    if (!selectedVariant || variants.length === 0) {
      return selectedPlan?.price || 0;
    }
    
    const variant = variants.find(v => v.id === selectedVariant);
    if (!variant) {
      return selectedPlan?.price || 0;
    }
    
    // Use getPriceForBillingCycle to get the correct recurring price based on billing cycle
    return getPriceForBillingCycle(variant, billingCycle);
  }, [selectedVariant, variants, selectedPlan, billingCycle]);
  
  // Product quantity state
  // For VSAAS products: use minimum 2 as default (Connect Cloud requirement)
  // Use minQuantity from variant if available, otherwise check product's minQuantity
  const getInitialQuantity = () => {
    // First try to get from selected variant
    if (selectedVariant) {
      const variant = variants.find(v => v.id === selectedVariant);
      if (variant?.minQuantity && variant.minQuantity > 1) {
        return variant.minQuantity;
      }
    }
    // For VSAAS products with multiple variants, ensure minimum of 2
    if (variants && variants.length > 0) {
      const minVariantQty = Math.min(...variants.map(v => v.minQuantity || 1));
      return Math.max(minVariantQty, 2); // Ensure at least 2 for VSAAS
    }
    return 2; // Default to 2 for VSAAS products
  };
  const [quantity, setQuantity] = useState(getInitialQuantity());

  // Find Cloud Gateway variant from the variants list
  const cloudGatewayVariant = variants?.find((v: any) => 
    v.name?.toLowerCase().includes('cloud gateway')
  );
  
  // Calculate Cloud Gateway quantity based on Connect Cloud quantity
  // Rule: If Connect Cloud >= 8, Cloud Gateway = 2, else Cloud Gateway = 1
  const getGatewayQuantity = (cameraQty: number) => {
    if (cameraQty >= 8) return 2;
    return 1;
  };

  // Calculate Cloud Gateway price based on billing cycle
  const gatewayPrice = useMemo(() => {
    console.log('gatewayPrice recalculating:', { billingCycle, variant: cloudGatewayVariant?.price, recurringPricesObj: cloudGatewayVariant?.recurringPricesObj });
    if (!cloudGatewayVariant) return 0;
    // Use getPriceForBillingCycle to properly get the recurring price for the selected cycle
    return getPriceForBillingCycle(cloudGatewayVariant, billingCycle);
  }, [cloudGatewayVariant, billingCycle]);
  
  const gatewayQty = getGatewayQuantity(quantity);
  const gatewayTotal = cloudGatewayVariant ? gatewayPrice * gatewayQty : 0;
  
  // Calculate total price: unit price × quantity + addons + Cloud Gateway
  const calculatedBasePrice = variants.length > 0 ? variantPrice * quantity : selectedPlan.price;
  const totalPrice = calculatedBasePrice + addonsTotal + gatewayTotal;

  const handleAddToCart = () => {
    // Debug logging
    console.log('=== Add to Cart Debug ===');
    console.log('selectedVariant:', selectedVariant);
    console.log('variants:', variants?.map((v: any) => v.name));
    
    // Check if selected variant is Connect Cloud
    const selectedVariantName = variants?.find((v: any) => v.id === selectedVariant)?.name || '';
    console.log('selectedVariantName:', selectedVariantName);
    const isConnectCloud = selectedVariantName.toLowerCase().includes('connect cloud');
    console.log('isConnectCloud:', isConnectCloud);
    console.log('cloudGatewayVariant:', cloudGatewayVariant);
    
    // Add the main item (Connect Cloud)
    // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
    const cartItem = {
      product: {
        id: productId || '',
        slug: productSlug || '',
        name: productName,
      } as any,
      quantity: quantity,
      selectedAddons: selectedAddonObjects.map((addon) => ({
        addon: {
          id: addon.id,
          name: addon.name,
          price: addon.price,
        },
        quantity: addonQuantities[addon.id] || 1,
      })),
      billingCycle: selectedPlan.id.toUpperCase() as any,
      isRecurring: true,
      unitPrice: variantPrice,
      totalPrice: totalPrice,
      recurringAmount: variantPrice,
      variantId: selectedVariant || undefined,
      deploymentType: 'cloud' as const,
    };
    
    addToCart(cartItem as any);
    
    // Always automatically add Cloud Gateway if available in variants (for VSAAS products)
    if (cloudGatewayVariant) {
      const gatewayQty = getGatewayQuantity(quantity);
      // Use getPriceForBillingCycle to properly get the recurring price for the selected cycle
      const gatewayPrice = getPriceForBillingCycle(cloudGatewayVariant, billingCycle);
      
      // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
      const gatewayCartItem = {
        product: {
          id: productId || '',
          slug: productSlug || '',
          name: productName,
        } as any,
        quantity: gatewayQty,
        selectedAddons: [],
        billingCycle: selectedPlan.id.toUpperCase() as any,
        isRecurring: true,
        unitPrice: gatewayPrice,
        totalPrice: gatewayPrice * gatewayQty,
        recurringAmount: gatewayPrice,
        variantId: cloudGatewayVariant.id,
        isDependentItem: true, // Flag to identify as dependent item
        deploymentType: 'cloud' as const,
      };
      
      addToCart(gatewayCartItem as any);
      console.log('Added Cloud Gateway to cart with quantity:', gatewayQty);
    } else {
      console.log('Cloud Gateway NOT found in variants');
    }
    
    router.push("/cart");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column: Add-ons (3 columns) */}
        <div className="lg:col-span-3">
          {/* Cloud Gateway - Primary Dependency - Shown at top as header */}
          {cloudGatewayVariant && (
            <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md border-2 border-red-500 bg-red-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-red-800 font-medium text-sm">Cloud Gateway</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-700 text-sm">Qty: {quantity >= 8 ? 2 : 1}</span>
                </div>
              </div>
              <div className="text-red-600 text-xs mt-1 ml-6">
                {quantity >= 8 ? '2 units (8+ cameras need 2 hardware)' : 'Connects up to 8 cameras in local network'}
              </div>
              <div className="text-red-800 font-semibold text-sm mt-1 ml-6">
                {formatPrice(gatewayTotal)}{getBillingSuffix(billingCycle)}
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Available Add-ons</h3>
          
          {addons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No add-ons available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Render each group as a collapsible dropdown section */}
              {groupedAddons.map(([baseName, items]) => {
                // Determine if this is Cloud Storage
                const isCloudStorageGroup = baseName === 'Cloud Storage' || 
                  baseName === 'Cloud - Storage' || 
                  baseName === 'Cloud' ||
                  baseName.toLowerCase().includes('cloud storage');
                
                const isOpen = true; // Always open by default
                
                if (isCloudStorageGroup) {
                  // CLOUD STORAGE - Single selection cards
                  const currentStorageSelection = multiSelectedAddons[baseName]?.[0];
                  
                  return (
                    <div key={baseName} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      {/* Dropdown Header */}
                      <button
                        onClick={() => toggleDropdownSection(baseName)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 uppercase text-sm tracking-wide">CLOUD STORAGE</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Content */}
                      {isOpen && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {items.map((item) => {
                              const isSelected = currentStorageSelection?.id === item.id;
                              const storageLabel = item.name?.replace(/^Cloud Storage - /, '').replace(/^Cloud - Storage - /, '').replace(/^Cloud Storage /, '') || '';
                              
                              return (
                                <div
                                  key={item.id}
                                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    isSelected 
                                      ? "border-[#C62828] bg-red-50" 
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                  onClick={() => {
                                    handleMultiAddonChange(baseName, [{ id: item.id, name: item.name, price: item.price, qty: 1 }]);
                                  }}
                                >
                                  {/* Radio-style selection indicator */}
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                                    isSelected ? "border-[#C62828] bg-[#C62828]" : "border-gray-300"
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <div className="text-gray-900 font-medium text-sm text-center">{storageLabel}</div>
                                  <div className="font-bold text-gray-900 text-sm mt-1">
                                    {formatPrice(getDynamicPrice(item.price, billingCycle, item.recurringPricesObj))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // LICENCES or other groups - Checkbox with quantity selector
                const selectedId = selectedDropdownAddon[baseName] || items[0]?.id;
                const qty = addonQuantities[selectedId] || 0;
                const hasAnySelection = items.some(item => (addonQuantities[item.id] || 0) > 0);
                
                return (
                  <div key={baseName} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {/* Dropdown Header */}
                    <button
                      onClick={() => toggleDropdownSection(baseName)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-gray-900 uppercase text-sm tracking-wide">LICENCES</div>
                        {hasAnySelection && (
                          <span className="px-2 py-0.5 bg-[#C62828] text-white text-xs rounded-full">
                            {items.reduce((sum, item) => sum + (addonQuantities[item.id] || 0), 0)}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Content */}
                    {isOpen && (
                      <div className="border-t border-gray-200">
                        {items.map((item, index) => {
                          const itemQty = addonQuantities[item.id] || 0;
                          const isLastItem = index === items.length - 1;
                          
                          return (
                            <div 
                              key={item.id}
                              className={`flex items-center justify-between p-4 ${!isLastItem ? 'border-b border-gray-100' : ''}`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                {/* Checkbox */}
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                                    itemQty > 0 ? "bg-[#C62828] border-[#C62828]" : "border-gray-300 bg-white"
                                  }`}
                                  onClick={() => {
                                    if (itemQty > 0) {
                                      setAddonQuantities(prev => ({ ...prev, [item.id]: 0 }));
                                    } else {
                                      setAddonQuantities(prev => ({ ...prev, [item.id]: 1 }));
                                    }
                                  }}
                                >
                                  {itemQty > 0 && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{item.name}</div>
                                  {item.unit && <div className="text-xs text-gray-400">{item.unit}</div>}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {/* Quantity selector */}
                                <div className="flex items-center bg-gray-100 rounded-full p-1">
                                  <button
                                    onClick={() => {
                                      const currentQty = addonQuantities[item.id] || 0;
                                      if (currentQty > 0) {
                                        setAddonQuantities(prev => ({ ...prev, [item.id]: currentQty - 1 }));
                                      }
                                    }}
                                    disabled={itemQty === 0}
                                    className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
                                  >
                                    −
                                  </button>
                                  <span className="w-6 text-center font-medium text-gray-900 text-sm">{itemQty}</span>
                                  <button
                                    onClick={() => {
                                      const currentQty = addonQuantities[item.id] || 0;
                                      if (currentQty < 10) {
                                        setAddonQuantities(prev => ({ ...prev, [item.id]: currentQty + 1 }));
                                      }
                                    }}
                                    disabled={itemQty >= 10}
                                    className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                                {/* Price */}
                                <div className="w-24 text-right">
                                  <div className="font-semibold text-gray-900">
                                    {itemQty > 0 ? formatPrice(getDynamicPrice(item.price, billingCycle, item.recurringPricesObj)) : formatPrice(getDynamicPrice(item.price, billingCycle, item.recurringPricesObj))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Render standalone addons that don't belong to groups */}
              {standaloneAddons.map((addon) => {
                const qty = addonQuantities[addon.id] || 0;
                return (
                  <div 
                    key={addon.id}
                    className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                          qty > 0 ? "bg-[#C62828] border-[#C62828]" : "border-gray-300 bg-white"
                        }`}
                        onClick={() => {
                          if (qty > 0) {
                            setAddonQuantities(prev => ({ ...prev, [addon.id]: 0 }));
                          } else {
                            setAddonQuantities(prev => ({ ...prev, [addon.id]: 1 }));
                          }
                        }}
                      >
                        {qty > 0 && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{addon.name}</div>
                        {addon.unit && <div className="text-xs text-gray-400">{addon.unit}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => {
                            if (qty > 0) {
                              setAddonQuantities(prev => ({ ...prev, [addon.id]: qty - 1 }));
                            }
                          }}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900 text-sm">{qty}</span>
                        <button
                          onClick={() => {
                            setAddonQuantities(prev => ({ ...prev, [addon.id]: qty + 1 }));
                          }}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all text-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-24 text-right">
                        <div className="font-semibold text-gray-900">
                          {formatPrice(getDynamicPrice(addon.price, billingCycle, addon.recurringPricesObj))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Billing Plans + Order Summary (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Plans - Vertical Layout - Show when there are recurring prices */}
          {generatedBillingPlans.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Billing Cycle</h3>
            <div className="space-y-2">
              {generatedBillingPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    handleBillingCycleChange(plan.id);
                    setSelectedPlan(plan);
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                    billingCycle === plan.id
                      ? "border-[#C62828] bg-red-50 text-[#C62828] shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      billingCycle === plan.id
                        ? "border-[#C62828] bg-[#C62828]"
                        : "border-gray-300"
                    }`}>
                      {billingCycle === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium text-base">{plan.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      {plan.period}
                    </span>
                    {plan.savings !== undefined && plan.savings > 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Save {plan.savings}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Variants - Show if variants are provided AND not locked (i.e., on pricing page, not configure page) */}
          {variants && variants.length > 0 && !isVariantLocked && productSlug !== 'acronis-backup-advanced-spla' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Select Plan</h3>
              <div className="space-y-3">
                {variants.map((variant) => {
                  // Use variant's own recurring prices - check both recurringPricesObj and recurringPrices
                  const hasRecurringPricesObj = variant.recurringPricesObj && (
                    variant.recurringPricesObj.monthly !== null ||
                    variant.recurringPricesObj.quarterly !== null ||
                    variant.recurringPricesObj.semiAnnual !== null ||
                    variant.recurringPricesObj.yearly !== null
                  );
                  const hasRecurringPricesArray = variant.recurringPrices && variant.recurringPrices.length > 0;
                  const isRecurring = hasRecurringPricesObj || hasRecurringPricesArray;
                  
                  // Build variant object with correct recurring prices
                  const variantWithPrices = {
                    ...variant,
                    // Use recurringPricesObj if available, otherwise use recurringPrices array
                    ...(hasRecurringPricesObj && { recurringPricesObj: variant.recurringPricesObj }),
                    // Also include recurringPrices array as fallback
                    ...(hasRecurringPricesArray && { recurringPrices: variant.recurringPrices }),
                  };
                  
                  const displayPrice = isRecurring ? getPriceForBillingCycle(variantWithPrices, billingCycle) : variant.price;
                  const priceSuffix = isRecurring ? getBillingSuffix(billingCycle) : "";
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                        selectedVariant === variant.id
                          ? "border-[#C62828] bg-red-50/40 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedVariant === variant.id 
                              ? "bg-[#C62828] border-[#C62828]" 
                              : "border-gray-300"
                          }`}
                        >
                          {selectedVariant === variant.id && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{variant.name}</div>
                          {variant.isDefault && (
                            <div className="text-xs text-[#C62828] font-medium">Recommended</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(displayPrice)}
                          {priceSuffix && <span className="text-sm font-normal text-gray-500">{priceSuffix}</span>}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <Card className="border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 text-lg">Order Summary</h3>
              
              <div className="space-y-3">
                {/* Show variant name if variants are being used, otherwise show billing plan */}
                {variants && variants.length > 0 && selectedVariant ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {variants.find(v => v.id === selectedVariant)?.name || 'Selected Plan'}
                      </span>
                      <span className="font-medium text-gray-900">{formatPrice(variantPrice)}{getBillingSuffix(billingCycle)}</span>
                    </div>
                    {/* Quantity controls for main product */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quantity</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(q => Math.max(2, q - 1))}
                          disabled={quantity <= 2}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                            quantity <= 2
                              ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(100, quantity + 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Unit price × quantity */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {formatPrice(variantPrice)} × {quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(variantPrice * quantity)}{getBillingSuffix(billingCycle)}
                      </span>
                    </div>

                    {/* Cloud Gateway price (auto-added) */}
                    {cloudGatewayVariant && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          Cloud Gateway (x{gatewayQty})
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(gatewayTotal)}{getBillingSuffix(billingCycle)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{selectedPlan.label}</span>
                    <span className="font-medium text-gray-900">{formatPrice(selectedPlan.price)}</span>
                  </div>
                )}

                {selectedAddonObjects.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    {selectedAddonObjects.map((addon) => {
                      const qty = addonQuantities[addon.id] || 0;
                      return (
                        <div key={addon.id} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            {addon.name && typeof addon.name === 'string' ? addon.name : 'Unnamed Addon'}
                            {qty > 1 && <span className="text-gray-400 ml-1">(x{qty})</span>}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">
                                    {formatPrice(getDisplayAddonPrice(addon.price, qty, billingCycle))}
                                    <span className="text-xs font-normal text-gray-500 ml-1">{getBillingSuffix(billingCycle)}</span>
                                  </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#C62828]">{formatPrice(totalPrice)}</span>
                    <span className="text-sm font-normal text-gray-500 ml-1">{getBillingSuffix(billingCycle)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#C62828] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#8B1D1D] shadow-lg shadow-red-100 hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
