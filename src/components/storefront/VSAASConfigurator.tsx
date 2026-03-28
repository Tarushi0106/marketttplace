"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, ShoppingCart, ChevronDown, Server, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";

// ============================================================
// TYPES - Single Source of Truth
// ============================================================

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  productType: string;
  images: any[];
  variants: Variant[];
  addons: Addon[];
}

interface Variant {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  isDefault: boolean;
  type?: string;
  attributes: Record<string, string>;
  billingType: string;
  setupFee: number;
  minQuantity: number;
  maxQuantity: number | null;
  recurringPrices: RecurringPrice[];
  recurringPricesObj: RecurringPricesObj | null;
}

interface RecurringPrice {
  id: string;
  variantId: string;
  monthlyPrice: number | null;
  quarterlyPrice: number | null;
  yearlyPrice: number | null;
  biMonthlyPrice: number | null;
  fourMonthlyPrice: number | null;
  semiAnnualPrice: number | null;
  triAnnualPrice: number | null;
  biennialPrice: number | null;
  triennialPrice: number | null;
}

interface RecurringPricesObj {
  monthly: number | null;
  quarterly: number | null;
  yearly: number | null;
  semiAnnual: number | null;
  biennial: number | null;
  triennial: number | null;
}

interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  pricingType?: string;
  source: string;
  group?: string;
  options?: any;
  recurringPricesObj?: RecurringPricesObj | null;
}

interface VSAASConfiguratorProps {
  cloudProduct?: Product;
  onPremiseProduct?: Product;
  aiProduct?: Product;
  selectedVariantId?: string | null;
}

// AI Features data from vsaas-cloud-data.json
export const AIFEATURES = [
  {
    category: 'Security Essentials AI',
    features: [
      { name: 'Intrusion Detection', price: 161 },
      { name: 'Zone Monitoring', price: 161 },
      { name: 'Camera Sabotage', price: 161 },
      { name: 'Activity Detection', price: 161 },
      { name: 'Trespassing', price: 161 },
      { name: 'Perimeter Fence Jumping', price: 161 },
    ],
  },
  {
    category: 'Business Efficiency & Security Advanced AI',
    features: [
      { name: 'Double Line Crossing', price: 782 },
      { name: 'Loitering', price: 782 },
      { name: 'Overcrowding', price: 782 },
      { name: 'People Counting', price: 782 },
      { name: 'Missing Staff', price: 782 },
      { name: 'Occupancy Statistics', price: 782 },
      { name: 'Queue Management', price: 782 },
      { name: 'Heatmap', price: 782 },
    ],
  },
  {
    category: 'Safety & Hazard Advanced AI',
    features: [
      { name: 'PPE/Safety Kit Detection', price: 920 },
      { name: 'Smoke & Fire Detection', price: 920 },
    ],
  },
  {
    category: 'Investigation Advanced AI',
    features: [
      { name: 'Person of Interest (Appearance Search)', price: 1242 },
      { name: 'Vehicle of Interest (Color & Type Search)', price: 1242 },
    ],
  },
  {
    category: 'ANPR',
    features: [
      { name: 'Automatic Number Plate Recognition', price: 2231 },
    ],
  },
  {
    category: 'Facial Recognition',
    features: [
      { name: 'Facial Recognition (with Up to 50 POI registration)', price: 3312 },
    ],
  },
];

// ============================================================
// BILLING CYCLE DEFINITIONS
// ============================================================

type BillingCycle = 'monthly' | 'quarterly' | 'semiAnnual' | 'yearly';

interface BillingOption {
  value: BillingCycle;
  label: string;
  discount: number;
}

const BILLING_OPTIONS: BillingOption[] = [
  { value: 'monthly', label: 'Monthly', discount: 0 },
  { value: 'quarterly', label: 'Quarterly', discount: 6 },
  { value: 'semiAnnual', label: 'Semi-Annual', discount: 10 },
  { value: 'yearly', label: 'Yearly', discount: 20 },
];

// ============================================================
// LICENSE TYPES
// ============================================================

type LicenseType = 'core' | 'web' | 'mobile';

interface LicenseOption {
  value: LicenseType;
  label: string;
}

const LICENSE_OPTIONS: LicenseOption[] = [
  { value: 'core', label: 'Core Desktop Application License' },
  { value: 'web', label: 'Web User License' },
  { value: 'mobile', label: 'Mobile User License' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function VSAASConfigurator({
  cloudProduct,
  onPremiseProduct,
  aiProduct,
  selectedVariantId
}: VSAASConfiguratorProps) {
  const router = useRouter();
  const { addItem: addToCart } = useCartStore();
  
  // ----------------------------------------
  // STATE: Deployment Type
  // ----------------------------------------
  const [deploymentType, setDeploymentType] = useState<'cloud' | 'onPremise' | 'ai'>(() => {
    if (selectedVariantId) {
      const cloudVariant = cloudProduct?.variants?.find((v) => v.id === selectedVariantId);
      if (cloudVariant) return 'cloud';
      const onPremiseVariant = onPremiseProduct?.variants?.find((v) => v.id === selectedVariantId);
      if (onPremiseVariant) return 'onPremise';
      const aiVariant = aiProduct?.variants?.find((v) => v.id === selectedVariantId);
      if (aiVariant) return 'ai';
    }
    return 'cloud';
  });

  const currentProduct = deploymentType === 'cloud' ? cloudProduct : 
                        deploymentType === 'onPremise' ? onPremiseProduct : aiProduct;
  const variants = currentProduct?.variants || [];
  const addons = currentProduct?.addons || [];

  // ----------------------------------------
  // STATE: Configuration (Single Source of Truth)
  // ----------------------------------------
  const [cameraCount, setCameraCount] = useState(8);
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('core');
  const [licenseQuantities, setLicenseQuantities] = useState<Record<LicenseType, number>>({
    core: 0,
    web: 0,
    mobile: 0,
  });
  const [selectedStorageAddonId, setSelectedStorageAddonId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isLicenseDropdownOpen, setIsLicenseDropdownOpen] = useState(false);
  
  // Separate quantities for on-premise items (independent of cameraCount)
  const [streamOSQuantity, setStreamOSQuantity] = useState(0);
  const [aiBoxQuantity, setAiBoxQuantity] = useState(0);
  const [aiLicenseQuantity, setAiLicenseQuantity] = useState(0);
  
  // ----------------------------------------
  // STATE: AI Features Selection (with quantity)
  // ----------------------------------------
  const [selectedAIFeatures, setSelectedAIFeatures] = useState<Record<string, number>>({});

  // Toggle AI feature selection (start with quantity 1)
  const toggleAIFeature = (featureName: string) => {
    setSelectedAIFeatures(prev => {
      if (prev[featureName]) {
        // If already selected, deselect it
        const newState = { ...prev };
        delete newState[featureName];
        return newState;
      } else {
        // If not selected, add with quantity 1
        return { ...prev, [featureName]: 1 };
      }
    });
  };

  // Increase/decrease AI feature quantity
  const updateAIFeatureQuantity = (featureName: string, delta: number) => {
    setSelectedAIFeatures(prev => {
      const currentQty = prev[featureName] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const newState = { ...prev };
        delete newState[featureName];
        return newState;
      }
      return { ...prev, [featureName]: newQty };
    });
  };

  // Calculate AI features total
  const aiFeaturesTotal = AIFEATURES.reduce((total, category) => {
    return total + category.features.reduce((catTotal, feature) => {
      const qty = selectedAIFeatures[feature.name] || 0;
      const monthlyPrice = feature.price;
      let featurePriceForCycle = monthlyPrice;
      switch (billingCycle) {
        case 'monthly': featurePriceForCycle = monthlyPrice; break;
        case 'quarterly': featurePriceForCycle = monthlyPrice * 3 * 0.94; break;
        case 'semiAnnual': featurePriceForCycle = monthlyPrice * 6 * 0.90; break;
        case 'yearly': featurePriceForCycle = monthlyPrice * 12 * 0.80; break;
      }
      return catTotal + (featurePriceForCycle * qty);
    }, 0);
  }, 0);

  // ----------------------------------------
  // FIND RELEVANT VARIANTS & ADDONS
  // ----------------------------------------
  
  const cloudGatewayVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('cloud gateway') ||
    v.name?.toLowerCase().includes('gateway link')
  ), [variants]);

  const connectCloudVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('connect cloud')
  ), [variants]);

  const streamOSVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('stream os')
  ), [variants]);

  const aiBoxVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('ai-box') ||
    v.name?.toLowerCase().includes('ai box')
  ), [variants]);

  const aiLicenseVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('ai license')
  ), [variants]);

  const cyberPackStreamVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('cyber') && v.name?.toLowerCase().includes('stream')
  ), [variants]);

  const cyberPackAIVariant = useMemo(() => variants.find((v) =>
    v.name?.toLowerCase().includes('cyber') && (v.name?.toLowerCase().includes('ai') || v.name?.toLowerCase().includes('ai-box'))
  ), [variants]);

  const storageAddons = useMemo(() => addons.filter((a) =>
    a.name?.toLowerCase().includes('storage') ||
    a.group?.toLowerCase().includes('storage')
  ), [addons]);

  const selectedStorageAddon = useMemo(() => 
    storageAddons.find(a => a.id === selectedStorageAddonId) || null
  , [storageAddons, selectedStorageAddonId]);

  // ----------------------------------------
  // PRICING LOGIC: Single Source of Truth
  // ----------------------------------------
  
  const getPriceForCycle = (variant: Variant | undefined | null, cycle: BillingCycle): number => {
    if (!variant) return 0;
    const prices = variant.recurringPricesObj;
    
    // Get the base monthly price (either from recurringPrices or fallback to variant.price)
    const baseMonthlyPrice = (prices?.monthly ?? variant.price) || 0;
    
    // Calculate prices for each billing cycle
    let monthlyPrice = baseMonthlyPrice;
    let quarterlyPrice = baseMonthlyPrice * 3 * 0.94; // 6% discount
    let semiAnnualPrice = baseMonthlyPrice * 6 * 0.90; // 10% discount
    let yearlyPrice = baseMonthlyPrice * 12 * 0.80; // 20% discount
    
    // If database has specific prices, use those (they already include discounts)
    if (prices && prices.quarterly !== null) quarterlyPrice = prices.quarterly;
    if (prices && prices.semiAnnual !== null) semiAnnualPrice = prices.semiAnnual;
    if (prices && prices.yearly !== null) yearlyPrice = prices.yearly;
    
    switch (cycle) {
      case 'monthly': return monthlyPrice;
      case 'quarterly': return quarterlyPrice;
      case 'semiAnnual': return semiAnnualPrice;
      case 'yearly': return yearlyPrice;
      default: return baseMonthlyPrice;
    }
  };

  // Special handling for addons that may have recurring price data
  const getAddonPriceForCycle = (addon: Addon | null, cycle: BillingCycle): number => {
    if (!addon) return 0;
    
    // First check if addon has recurring price data directly
    if (addon.recurringPricesObj) {
      const prices = addon.recurringPricesObj;
      const monthlyPrice = prices.monthly ?? addon.price;
      const quarterlyPrice = prices.quarterly ?? monthlyPrice * 3;
      const semiAnnualPrice = prices.semiAnnual ?? monthlyPrice * 6;
      const yearlyPrice = prices.yearly ?? monthlyPrice * 12;
      
      switch (cycle) {
        case 'monthly': return monthlyPrice;
        case 'quarterly': return quarterlyPrice;
        case 'semiAnnual': return semiAnnualPrice;
        case 'yearly': return yearlyPrice;
        default: return addon.price;
      }
    }
    
    // Fall back to options-based recurring prices
    if (addon.options && typeof addon.options === 'object') {
      const opts = addon.options as any;
      if (opts.recurringPricesObj) {
        const prices = opts.recurringPricesObj;
        const monthlyPrice = prices.monthly ?? addon.price;
        const quarterlyPrice = prices.quarterly ?? monthlyPrice * 3;
        const semiAnnualPrice = prices.semiAnnual ?? monthlyPrice * 6;
        const yearlyPrice = prices.yearly ?? monthlyPrice * 12;
        
        switch (cycle) {
          case 'monthly': return monthlyPrice;
          case 'quarterly': return quarterlyPrice;
          case 'semiAnnual': return semiAnnualPrice;
          case 'yearly': return yearlyPrice;
          default: return addon.price;
        }
      }
    }
    
    // Fall back to regular price with discount
    const monthlyPrice = addon.price || 0;
    switch (cycle) {
      case 'monthly': return monthlyPrice;
      case 'quarterly': return monthlyPrice * 3 * 0.94; // 6% discount
      case 'semiAnnual': return monthlyPrice * 6 * 0.90; // 10% discount
      case 'yearly': return monthlyPrice * 12 * 0.80; // 20% discount
      default: return addon.price;
    }
  };

  const getDiscountMultiplier = (cycle: BillingCycle): number => {
    const option = BILLING_OPTIONS.find(o => o.value === cycle);
    return option ? (1 - option.discount / 100) : 1;
  };

  // Get billing suffix for display
  const getBillingSuffix = (): string => {
    switch (billingCycle) {
      case 'monthly': return '/month';
      case 'quarterly': return '/quarter';
      case 'semiAnnual': return '/6 months';
      case 'yearly': return '/year';
      default: return '/month';
    }
  };

  // Per-unit prices based on selected billing cycle
  const licensePricePerCamera = getPriceForCycle(connectCloudVariant ?? null, billingCycle);
  const gatewayPricePerUnit = getPriceForCycle(cloudGatewayVariant ?? null, billingCycle);
  const storagePricePerCamera = selectedStorageAddon ? getAddonPriceForCycle(selectedStorageAddon, billingCycle) : 0;
  const streamOSPricePerCamera = getPriceForCycle(streamOSVariant ?? null, billingCycle);
  const aiBoxPricePerUnit = getPriceForCycle(aiBoxVariant ?? null, billingCycle);
  const aiLicensePricePerUnit = getPriceForCycle(aiLicenseVariant ?? null, billingCycle);
  const cyberPackStreamPrice = getPriceForCycle(cyberPackStreamVariant ?? null, billingCycle);
  const cyberPackAIPrice = getPriceForCycle(cyberPackAIVariant ?? null, billingCycle);

  // DERIVED quantities
  const hardwareQuantity = Math.max(1, Math.ceil(cameraCount / 8));
  const storageQuantity = cameraCount;

  // LICENSE: Sum all license types (users can select multiple)
  const licenseQuantity = (licenseQuantities.core || 0) + (licenseQuantities.web || 0) + (licenseQuantities.mobile || 0);

  // DERIVED totals (single source of truth)
  // Base Connect Cloud license is per camera
  const baseLicenseTotal = connectCloudVariant ? licensePricePerCamera * cameraCount : 0;
  // Additional license types (Core, Web, Mobile) are per user
  const additionalLicenseTotal = licensePricePerCamera * licenseQuantity;
  const licenseTotal = baseLicenseTotal + additionalLicenseTotal;
  const gatewayTotal = gatewayPricePerUnit * hardwareQuantity;
  const storageTotal = storagePricePerCamera * storageQuantity;
  
  // On-premise specific totals
  const streamOSTotal = deploymentType === 'onPremise' ? streamOSPricePerCamera * streamOSQuantity : 0;
  const aiBoxTotal = deploymentType === 'onPremise' ? aiBoxPricePerUnit * aiBoxQuantity : 0;
  const aiLicenseTotal = deploymentType === 'onPremise' ? aiLicensePricePerUnit * aiLicenseQuantity : 0;
  
  const subtotal = licenseTotal + gatewayTotal + storageTotal + aiFeaturesTotal + streamOSTotal + aiBoxTotal + aiLicenseTotal;
  // Prices already include billing cycle discount, so no additional multiplier needed
  // Add setup fee to total for cloud and on-premise deployments
  const setupFeeForTotal = (() => {
    if (deploymentType === 'cloud') {
      const baseSetupFee = 9999;
      switch (billingCycle) {
        case 'monthly': return baseSetupFee;
        case 'quarterly': return Math.round(baseSetupFee * 1.5);
        case 'semiAnnual': return Math.round(baseSetupFee * 2);
        case 'yearly': return Math.round(baseSetupFee * 3);
        default: return baseSetupFee;
      }
    } else if (deploymentType === 'onPremise') {
      return 46000;
    }
    return 0;
  })();
  const total = subtotal + setupFeeForTotal;

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------
  
  const handleCameraCountChange = (newCount: number) => {
    setCameraCount(Math.max(1, Math.min(96, newCount)));
  };

  const handleLicenseChange = (license: LicenseType) => {
    setSelectedLicense(license);
  };

  const handleLicenseQuantityChange = (license: LicenseType, newQty: number) => {
    setLicenseQuantities(prev => ({
      ...prev,
      [license]: Math.max(0, newQty),
    }));
  };

  const handleStorageChange = (addonId: string | null) => {
    setSelectedStorageAddonId(addonId);
  };

  // Close license dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.license-dropdown-container')) {
        setIsLicenseDropdownOpen(false);
      }
    };
    
    if (isLicenseDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isLicenseDropdownOpen]);

  const handleAddToCart = () => {
    if (!currentProduct) return;

    // Setup fee for cloud deployment - varies by billing cycle
    const getSetupFeeForCycle = (cycle: BillingCycle): number => {
      const baseSetupFee = 9999;
      switch (cycle) {
        case 'monthly': return baseSetupFee;
        case 'quarterly': return Math.round(baseSetupFee * 1.5); // 14,999
        case 'semiAnnual': return Math.round(baseSetupFee * 2); // 19,998
        case 'yearly': return Math.round(baseSetupFee * 3); // 29,997
        default: return baseSetupFee;
      }
    };
    
    const setupFee = deploymentType === 'cloud' ? getSetupFeeForCycle(billingCycle) : 0;
    
    // For on-premise, use separate quantities; for cloud, use cameraCount
    const effectiveStreamOSQty = deploymentType === 'onPremise' ? streamOSQuantity : cameraCount;
    const effectiveAiBoxQty = deploymentType === 'onPremise' ? aiBoxQuantity : Math.ceil(cameraCount / 16);
    const effectiveAiLicenseQty = deploymentType === 'onPremise' ? aiLicenseQuantity : Math.ceil(cameraCount / 16);

    if (connectCloudVariant) {
      // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
      // Base Connect Cloud license is per camera
      const connectCloudItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: connectCloudVariant.name || currentProduct.name },
        variant: { id: connectCloudVariant.id, name: connectCloudVariant.name },
        quantity: cameraCount,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: licensePricePerCamera,
        totalPrice: baseLicenseTotal,
        deploymentType: deploymentType,
        recurringAmount: licensePricePerCamera,
        recurringData: {
          enabled: true,
          billingCycle: billingCycle.toUpperCase() as any,
          setupFee: 0, // Setup fee is handled separately at order level
          pricePerCycle: licensePricePerCamera,
          baseProductPrice: 0,
          totalForPeriod: baseLicenseTotal,
          savingsPercentage: 0,
          monthlyEquivalent: licensePricePerCamera,
        },
      };
      addToCart(connectCloudItem as any);
    }

    if (cloudGatewayVariant && deploymentType === 'cloud') {
      // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
      const gatewayItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: cloudGatewayVariant.name || currentProduct.name },
        variant: { id: cloudGatewayVariant.id, name: cloudGatewayVariant.name },
        quantity: hardwareQuantity,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: gatewayPricePerUnit,
        totalPrice: gatewayTotal,
        deploymentType: deploymentType,
        recurringAmount: gatewayPricePerUnit,
        recurringData: {
          enabled: true,
          billingCycle: billingCycle.toUpperCase() as any,
          setupFee: 0, // Setup fee is handled separately at order level
          pricePerCycle: gatewayPricePerUnit,
          baseProductPrice: 0,
          totalForPeriod: gatewayTotal,
          savingsPercentage: 0,
          monthlyEquivalent: gatewayPricePerUnit,
        },
      };
      addToCart(gatewayItem as any);
    }

    if (selectedStorageAddon) {
      // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
      const storageItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: selectedStorageAddon.name || currentProduct.name },
        variant: { id: null, name: null },
        quantity: storageQuantity,
        selectedAddons: [selectedStorageAddon],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: storagePricePerCamera,
        totalPrice: storageTotal,
        deploymentType: deploymentType,
        recurringAmount: storagePricePerCamera,
        recurringData: {
          enabled: true,
          billingCycle: billingCycle.toUpperCase() as any,
          setupFee: 0, // Setup fee is handled separately at order level
          pricePerCycle: storagePricePerCamera,
          baseProductPrice: 0,
          totalForPeriod: storageTotal,
          savingsPercentage: 0,
          monthlyEquivalent: storagePricePerCamera,
        },
      };
      addToCart(storageItem as any);
    }

    // Add Stream OS to cart (for on-premise)
    if (deploymentType === 'onPremise' && streamOSVariant && effectiveStreamOSQty > 0) {
      const streamOSItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: streamOSVariant.name || currentProduct.name },
        variant: { id: streamOSVariant.id, name: streamOSVariant.name },
        quantity: effectiveStreamOSQty,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: streamOSPricePerCamera,
        totalPrice: streamOSPricePerCamera * effectiveStreamOSQty,
        deploymentType: deploymentType,
        recurringAmount: streamOSPricePerCamera,
        recurringData: {
          enabled: true,
          billingCycle: billingCycle.toUpperCase() as any,
          setupFee: 0,
          pricePerCycle: streamOSPricePerCamera,
          baseProductPrice: 0,
          totalForPeriod: streamOSPricePerCamera * effectiveStreamOSQty,
          savingsPercentage: 0,
          monthlyEquivalent: streamOSPricePerCamera,
        },
      };
      addToCart(streamOSItem as any);
    }

    // Add AI-Box to cart (for on-premise)
    if (deploymentType === 'onPremise' && aiBoxVariant && effectiveAiBoxQty > 0) {
      const aiBoxItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: aiBoxVariant.name || currentProduct.name },
        variant: { id: aiBoxVariant.id, name: aiBoxVariant.name },
        quantity: effectiveAiBoxQty,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: aiBoxPricePerUnit,
        totalPrice: aiBoxPricePerUnit * effectiveAiBoxQty,
        deploymentType: deploymentType,
        recurringAmount: aiBoxPricePerUnit,
        recurringData: {
          enabled: true,
          billingCycle: billingCycle.toUpperCase() as any,
          setupFee: 0,
          pricePerCycle: aiBoxPricePerUnit,
          baseProductPrice: 0,
          totalForPeriod: aiBoxPricePerUnit * effectiveAiBoxQty,
          savingsPercentage: 0,
          monthlyEquivalent: aiBoxPricePerUnit,
        },
      };
      addToCart(aiBoxItem as any);
    }

    // Add AI Licenses to cart (for on-premise)
    if (deploymentType === 'onPremise' && aiLicenseVariant && effectiveAiLicenseQty > 0) {
      const aiLicenseItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: aiLicenseVariant.name || currentProduct.name },
        variant: { id: aiLicenseVariant.id, name: aiLicenseVariant.name },
        quantity: effectiveAiLicenseQty,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: aiLicensePricePerUnit,
        totalPrice: aiLicensePricePerUnit * effectiveAiLicenseQty,
        deploymentType: deploymentType,
        recurringAmount: aiLicensePricePerUnit,
        recurringData: {
          enabled: true,
          billingCycle: billingCycle.toUpperCase() as any,
          setupFee: 0,
          pricePerCycle: aiLicensePricePerUnit,
          baseProductPrice: 0,
          totalForPeriod: aiLicensePricePerUnit * effectiveAiLicenseQty,
          savingsPercentage: 0,
          monthlyEquivalent: aiLicensePricePerUnit,
        },
      };
      addToCart(aiLicenseItem as any);
    }

    // Add AI features to cart
    if (deploymentType === 'ai' && aiFeaturesTotal > 0) {
      // Create separate cart items for each selected AI feature with their quantities
      AIFEATURES.forEach(category => {
        category.features.forEach(feature => {
          const qty = selectedAIFeatures[feature.name] || 0;
          if (qty > 0) {
            // Note: Don't include 'id' field - let cart store generate consistent ID based on product/variant/config
            const aiFeatureItem = {
              product: { id: currentProduct.id, slug: currentProduct.slug, name: feature.name },
              variant: { id: null, name: null },
              quantity: qty,
              selectedAddons: [{
                name: feature.name,
                price: feature.price,
                // Add other properties that might be expected
              } as any],
              billingCycle: billingCycle.toUpperCase(),
              isRecurring: true,
              unitPrice: feature.price,
              totalPrice: feature.price * qty,
              deploymentType: deploymentType,
              recurringAmount: feature.price,
            };
            addToCart(aiFeatureItem as any);
          }
        });
      });
    }

    // Add setup fee as a separate one-time item (only charged once)
    if (setupFee > 0) {
      const setupFeeItem = {
        product: { id: currentProduct.id, slug: currentProduct.slug, name: 'Setup Fee' },
        variant: { id: null, name: null },
        quantity: 1,
        selectedAddons: [],
        billingCycle: 'ONE_TIME',
        isRecurring: false,
        unitPrice: setupFee,
        totalPrice: setupFee,
        deploymentType: deploymentType,
        baseProductPrice: setupFee,
        productPrice: setupFee,
      };
      addToCart(setupFeeItem as any);
    }

    router.push('/cart');
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  if (!cloudProduct && !onPremiseProduct && !aiProduct) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">VSAAS products not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Deployment Type Selector */}
      {(cloudProduct || onPremiseProduct || aiProduct) && (
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {cloudProduct && (
              <button
                onClick={() => setDeploymentType('cloud')}
                className={`p-4 rounded-lg border transition-all text-left ${
                  deploymentType === 'cloud'
                    ? 'border-[#DC2626] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`font-semibold text-base ${deploymentType === 'cloud' ? 'text-[#111827]' : 'text-gray-900'}`}>
                    VSaaS on Cloud
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Cloud-based video surveillance system
                  </div>
                </div>
              </button>
            )}
            
            {onPremiseProduct && (
              <button
                onClick={() => setDeploymentType('onPremise')}
                className={`p-4 rounded-lg border transition-all text-left ${
                  deploymentType === 'onPremise'
                    ? 'border-[#DC2626] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`font-semibold text-base ${deploymentType === 'onPremise' ? 'text-[#111827]' : 'text-gray-900'}`}>
                    VSaaS On-Premise
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Self-hosted video surveillance system
                  </div>
                </div>
              </button>
            )}
            
            {aiProduct && (
              <button
                onClick={() => setDeploymentType('ai')}
                className={`p-4 rounded-lg border transition-all text-left ${
                  deploymentType === 'ai'
                    ? 'border-[#DC2626] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`font-semibold text-base ${deploymentType === 'ai' ? 'text-[#111827]' : 'text-gray-900'}`}>
                    VSaaS AI Solutions
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    AI-powered video analytics
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Layout: 70% Left / 30% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* LEFT SIDE (70%): Configuration */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ======================================== */}
          {/* SECTION 1: HARDWARE - Cloud Gateway */}
          {/* ======================================== */}
          {cloudGatewayVariant && deploymentType === 'cloud' && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Cloud Gateway Link Device
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    Capex
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                    One Time
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  {/* Left: Info & Features */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Network Link Device</h4>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      {hardwareQuantity} hardware (supports up to {cameraCount} cameras)
                    </p>
                    
                    {/* Feature Bullets */}
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Supports up to 8 Cameras
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Secure cloud tunnel
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        8/16 channel connectivity
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        3 year warranty
                      </li>
                    </ul>
                  </div>
                  
                  {/* Right: Quantity & Price */}
                  <div className="flex items-center gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => handleCameraCountChange(cameraCount - 8)}
                        disabled={cameraCount <= 8}
                        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-900 text-sm">
                        {hardwareQuantity}
                      </span>
                      <button
                        onClick={() => handleCameraCountChange(cameraCount + 8)}
                        disabled={cameraCount >= 96}
                        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Unit Price */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-xs text-gray-500">
                        {formatPrice(gatewayPricePerUnit)}/month
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(gatewayTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* SECTION 2: LICENSES - Connect Cloud */}
          {/* ======================================== */}
          {connectCloudVariant && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Licences to be Procured
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    per camera
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Connect Cloud – Platform Fee (Base License)</h4>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      {cameraCount} cameras
                    </p>
                    
                    {/* Feature Bullets */}
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Cloud VMS with Live & Playback
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        3 Days Cloud Backup (8 fps, SD-640*480P, H.265)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Admin Panel for device/user management
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        1x Core - Desktop application
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        5x Web View access
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        5x Mobile App access (Android & iOS)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Device Health Check
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Reports & Dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Logs & Audit Trail
                      </li>
                    </ul>
                  </div>
                  
                  {/* Right: Quantity & Price */}
                  <div className="flex items-center gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => handleCameraCountChange(cameraCount - 1)}
                        disabled={cameraCount <= 1}
                        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-900 text-sm">
                        {cameraCount}
                      </span>
                      <button
                        onClick={() => handleCameraCountChange(cameraCount + 1)}
                        disabled={cameraCount >= 96}
                        className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Unit Price */}
                    <div className="text-right min-w-[120px]">
                      <div className="text-xs text-gray-500">
                        {formatPrice(licensePricePerCamera)}{getBillingSuffix()}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(baseLicenseTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* SECTION 2: PLATFORM ADD-ONS - LICENSES */}
          {/* ======================================== */}
          {deploymentType === 'cloud' && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    PLATFORM Add-ons
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    Per User
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5">
                {/* Custom Dropdown with Checkboxes and Quantity Inside */}
                <div className="relative license-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LICENSES
                  </label>
                  <div className="border border-gray-200 rounded-lg bg-white">
                    {/* Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsLicenseDropdownOpen(!isLicenseDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-gray-900 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm">
                        {Object.values(licenseQuantities).filter(q => q > 0).length > 0 
                          ? `${Object.values(licenseQuantities).filter(q => q > 0).length} license(s) selected`
                          : 'Select licenses'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLicenseDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Content */}
                    {isLicenseDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
                        {LICENSE_OPTIONS.map((option) => (
                          <div 
                            key={option.value}
                            className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={licenseQuantities[option.value] > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleLicenseQuantityChange(option.value, 1);
                                  } else {
                                    handleLicenseQuantityChange(option.value, 0);
                                  }
                                }}
                                className="w-4 h-4 text-[#DC2626] border-gray-300 rounded focus:ring-[#DC2626]"
                              />
                              <span className="text-sm font-medium text-gray-900">{option.label}</span>
                            </div>
                            
                            {/* Quantity Controls Inside Dropdown */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 rounded border border-gray-200 bg-white p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleLicenseQuantityChange(option.value, Math.max(0, licenseQuantities[option.value] - 1))}
                                  disabled={licenseQuantities[option.value] <= 0}
                                  className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-semibold text-gray-900 text-sm">
                                  {licenseQuantities[option.value]}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleLicenseQuantityChange(option.value, licenseQuantities[option.value] + 1)}
                                  className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                                {formatPrice(licensePricePerCamera * licenseQuantities[option.value])}{getBillingSuffix()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selected Summary Below Dropdown */}
                {Object.values(licenseQuantities).some(q => q > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-2">Selected:</div>
                    <div className="flex flex-wrap gap-2">
                      {LICENSE_OPTIONS.map((option) => (
                        licenseQuantities[option.value] > 0 && (
                          <span 
                            key={option.value}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                          >
                            <span className="font-medium">{option.label}</span>
                            <span className="text-gray-500">×{licenseQuantities[option.value]}</span>
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* SECTION 3: CLOUD STORAGE */}
          {/* ======================================== */}
          {storageAddons.length > 0 && deploymentType === 'cloud' && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Cloud Storage
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    per camera
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  {/* Left: Storage Selection */}
                  <div className="flex-1 max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Storage Plan
                    </label>
                    <div className="relative">
                      <select
                        value={selectedStorageAddonId || ''}
                        onChange={(e) => handleStorageChange(e.target.value || null)}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                      >
                        <option value="">None</option>
                        {storageAddons.map((addon) => (
                          <option key={addon.id} value={addon.id}>
                            {addon.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Right: Price with Formula */}
                  <div className="flex items-center gap-6">
                    {/* Formula Display */}
                    {selectedStorageAddon && (
                      <div className="text-sm text-gray-500">
                        {formatPrice(storagePricePerCamera)} × {cameraCount} cameras{getBillingSuffix()}
                      </div>
                    )}
                    
                    {/* Total Price */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedStorageAddon ? formatPrice(storageTotal) : '—'}<span className="text-sm font-normal text-gray-500">{getBillingSuffix()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* SECTION 4: ONE TIME SETUP & IMPLEMENTATION */}
          {/* ======================================== */}
          {deploymentType === 'cloud' && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    One Time Setup & Implementation Cost
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                    One Time
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Setup & Implementation</h4>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      One-time setup and implementation cost
                    </p>
                    
                    {/* Feature Bullets */}
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Professional installation and configuration
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        System integration and testing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Training and documentation
                      </li>
                    </ul>
                  </div>
                  
                  {/* Right: Price */}
                  <div className="text-right min-w-[120px]">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(deploymentType === 'cloud' ? (() => {
                        const baseSetupFee = 9999;
                        switch (billingCycle) {
                          case 'monthly': return baseSetupFee;
                          case 'quarterly': return Math.round(baseSetupFee * 1.5);
                          case 'semiAnnual': return Math.round(baseSetupFee * 2);
                          case 'yearly': return Math.round(baseSetupFee * 3);
                          default: return baseSetupFee;
                        }
                      })() : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* SECTION 5: ON-PREMISE DEVICES */}
          {/* ======================================== */}
          {deploymentType === 'onPremise' && (
            <>
              {/* Stream OS Device */}
              <div className="border border-gray-200 rounded-lg bg-white">
                {/* Section Header */}
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Stream OS
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      Capex
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                      One Time
                    </span>
                  </div>
                </div>
                
                {/* Section Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Stream OS [ 32 | 64 | 128 | 256 ]</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-3">
                        {cameraCount} cameras
                      </p>
                      
                      {/* Feature Bullets */}
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Connects up to 32/64/128/256 channels
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Cloud VMS with Live & Playback
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Admin Panel for device/user management
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          1x Core Lite - Desktop application
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          1x Core Multi - Desktop application
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          5x Web View access
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          5x Mobile App access (Android & iOS)
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Device Health Check (Cameras/NVRs/HDD/SD Card etc.)
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Reports & Dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Logs & Audit Trail
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Zygal Cyber+ Pack for 3 years included
                        </li>
                      </ul>
                    </div>
                    
                    {/* Right: Quantity & Price */}
                    <div className="flex items-center gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => setStreamOSQuantity(Math.max(0, streamOSQuantity - 1))}
                          disabled={streamOSQuantity <= 0}
                          className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 text-sm">
                          {streamOSQuantity}
                        </span>
                        <button
                          onClick={() => setStreamOSQuantity(streamOSQuantity + 1)}
                          className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Unit Price */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-xs text-gray-500">
                          {formatPrice(streamOSPricePerCamera)}{getBillingSuffix()}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(streamOSPricePerCamera * streamOSQuantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Box Device */}
              <div className="border border-gray-200 rounded-lg bg-white">
                {/* Section Header */}
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      AI-Box
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      Capex
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                      One Time
                    </span>
                  </div>
                </div>
                
                {/* Section Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">AI-Box</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-3">
                        Enables on-prem AI Analytics
                      </p>
                      
                      {/* Feature Bullets */}
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Enables on-prem AI Analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          3 year warranty
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Zygal Cyber+ Pack for 3 years included
                        </li>
                      </ul>
                    </div>
                    
                    {/* Right: Quantity & Price */}
                    <div className="flex items-center gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => setAiBoxQuantity(Math.max(0, aiBoxQuantity - 1))}
                          disabled={aiBoxQuantity <= 0}
                          className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 text-sm">
                          {aiBoxQuantity}
                        </span>
                        <button
                          onClick={() => setAiBoxQuantity(aiBoxQuantity + 1)}
                          className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Unit Price */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-xs text-gray-500">
                          {formatPrice(aiBoxPricePerUnit)}{getBillingSuffix()}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(aiBoxPricePerUnit * aiBoxQuantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Licenses */}
              <div className="border border-gray-200 rounded-lg bg-white">
                {/* Section Header */}
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      AI Licenses
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      Capex
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                      One Time
                    </span>
                  </div>
                </div>
                
                {/* Section Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">AI Licenses for on-prem AI-Box</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-3">
                        License which can be used to enable any AI alerts/analytics
                      </p>
                      
                      {/* Feature Bullets */}
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          AI Licenses for on-prem AI-Box
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          License which can be used to enable any AI alerts/analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Refer to the list of AI Analytics for per channel credit utilization
                        </li>
                      </ul>
                    </div>
                    
                    {/* Right: Quantity & Price */}
                    <div className="flex items-center gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => setAiLicenseQuantity(Math.max(0, aiLicenseQuantity - 1))}
                          disabled={aiLicenseQuantity <= 0}
                          className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 text-sm">
                          {aiLicenseQuantity}
                        </span>
                        <button
                          onClick={() => setAiLicenseQuantity(aiLicenseQuantity + 1)}
                          className="w-8 h-8 rounded bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Unit Price */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-xs text-gray-500">
                          {formatPrice(aiLicensePricePerUnit)}{getBillingSuffix()}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(aiLicensePricePerUnit * aiLicenseQuantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annual Maintenance Cost */}
              <div className="border border-gray-200 rounded-lg bg-white">
                {/* Section Header */}
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Annual Maintenance Cost [ AMC ] After 3 Years
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      Annually
                    </span>
                  </div>
                </div>
                
                {/* Section Content */}
                <div className="p-5">
                  <div className="space-y-4">
                    {/* Cyber + Pack (Stream OS) */}
                    <div className="flex items-start justify-between">
                      {/* Left: Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Cyber + Pack (Stream OS)</h4>
                        <p className="text-sm text-gray-500 mt-1 mb-3">
                          1 year Cyber Security Pack for Stream
                        </p>
                        
                        {/* Feature Bullets */}
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Latest features/ cyber security updates OTA
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Secure Mobile and Web access
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            End-to-end data protection and encryption support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            TOTP, SSO support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Secure VPN/ P2P support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Organizational firewall compatibility support
                          </li>
                        </ul>
                      </div>
                      
                      {/* Right: Price */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-xs text-gray-500">
                          {formatPrice(644)}/year
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(644 * cameraCount)}
                        </div>
                      </div>
                    </div>

                    {/* Cyber + Pack (AI-Box & AI License) */}
                    <div className="flex items-start justify-between pt-4 border-t border-gray-100">
                      {/* Left: Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Cyber + Pack (AI-Box & AI License)</h4>
                        <p className="text-sm text-gray-500 mt-1 mb-3">
                          1 year Cyber Security Pack for AI-Box
                        </p>
                        
                        {/* Feature Bullets */}
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Latest Upgrades of AI Analytics
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Access to new AI Analytics
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Latest features/ cyber security updates OTA
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Secure Mobile and Web access
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            End-to-end data protection and encryption support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            TOTP, SSO support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Secure VPN/ P2P support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Organizational firewall compatibility support
                          </li>
                        </ul>
                      </div>
                      
                      {/* Right: Price */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-xs text-gray-500">
                          {formatPrice(73600)}/year
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(73600 * Math.ceil(cameraCount / 16))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* One Time Setup & Implementation Cost */}
              <div className="border border-gray-200 rounded-lg bg-white">
                {/* Section Header */}
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      One Time Setup & Implementation Cost
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                      One Time
                    </span>
                  </div>
                </div>
                
                {/* Section Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Setup & Implementation</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-3">
                        One-time setup and implementation cost
                      </p>
                      
                      {/* Feature Bullets */}
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Professional installation and configuration
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          System integration and testing
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Training and documentation
                        </li>
                      </ul>
                    </div>
                    
                    {/* Right: Price */}
                    <div className="text-right min-w-[120px]">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(46000)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ======================================== */}
          {/* SECTION: AI FEATURES */}
          {/* ======================================== */}
          {deploymentType === 'ai' && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    AI Features
                  </h3>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    Per Camera
                  </span>
                </div>
              </div>
              
              {/* Section Content */}
              <div className="p-5 space-y-6">
                {AIFEATURES.map((category) => (
                  <div key={category.category}>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">{category.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.features.map((feature) => {
                        const isSelected = (selectedAIFeatures[feature.name] || 0) > 0;
                        const qty = selectedAIFeatures[feature.name] || 0;
                        const monthlyPrice = feature.price;
                        let featurePriceForCycle = monthlyPrice;
                        switch (billingCycle) {
                          case 'monthly': featurePriceForCycle = monthlyPrice; break;
                          case 'quarterly': featurePriceForCycle = monthlyPrice * 3 * 0.94; break;
                          case 'semiAnnual': featurePriceForCycle = monthlyPrice * 6 * 0.90; break;
                          case 'yearly': featurePriceForCycle = monthlyPrice * 12 * 0.80; break;
                        }
                        return (
                          <div
                            key={feature.name}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-[#DC2626] bg-red-50/50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {/* Simple Checkbox */}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => toggleAIFeature(feature.name)}
                                  className="sr-only peer"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[#DC2626] border-[#DC2626]'
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </label>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900 block">{feature.name}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Quantity Controls */}
                              <div className={`flex items-center gap-0 rounded border overflow-hidden ${
                                isSelected ? 'border-[#DC2626]' : 'border-gray-200'
                              }`}>
                                <button
                                  type="button"
                                  onClick={() => updateAIFeatureQuantity(feature.name, -1)}
                                  disabled={!isSelected}
                                  className={`w-7 h-7 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className={`w-8 text-center text-sm font-medium ${
                                  isSelected ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateAIFeatureQuantity(feature.name, 1)}
                                  disabled={!isSelected}
                                  className={`w-7 h-7 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Price */}
                              <div className="text-right min-w-[80px]">
                                <div className="text-sm font-semibold text-gray-900">
                                  {qty > 0 ? formatPrice(featurePriceForCycle * qty) : formatPrice(featurePriceForCycle)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {getBillingSuffix()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Selected AI Features Summary */}
                {aiFeaturesTotal > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {Object.keys(selectedAIFeatures).length} AI Features Selected
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Applied to {cameraCount} camera{cameraCount > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(aiFeaturesTotal)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getBillingSuffix()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>

        {/* RIGHT SIDE (30%): Order Summary */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <Card className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {/* Summary Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                </div>
                
                {/* Billing Cycle Selection */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Billing Cycle</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {BILLING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBillingCycle(option.value)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          billingCycle === option.value
                            ? 'border-[#DC2626] bg-red-50'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        {option.discount > 0 && (
                          <div className="text-xs text-gray-500 font-medium">
                            Save {option.discount}%
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setup Fee */}
                {(deploymentType === 'cloud' || deploymentType === 'onPremise') && (
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Setup Fee</div>
                        <div className="text-xs text-gray-500 mt-0.5">One-time implementation cost</div>
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {formatPrice((() => {
                          if (deploymentType === 'cloud') {
                            const baseSetupFee = 9999;
                            switch (billingCycle) {
                              case 'monthly': return baseSetupFee;
                              case 'quarterly': return Math.round(baseSetupFee * 1.5);
                              case 'semiAnnual': return Math.round(baseSetupFee * 2);
                              case 'yearly': return Math.round(baseSetupFee * 3);
                              default: return baseSetupFee;
                            }
                          } else {
                            // On-premise setup fee
                            return 46000;
                          }
                        })())}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Items */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Add {deploymentType === 'cloud' ? 'VSaaS on Cloud' : deploymentType === 'onPremise' ? 'VSaaS On-Premise' : 'VSaaS AI Solutions'}
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Hardware - Cloud Gateway */}
                    {cloudGatewayVariant && deploymentType === 'cloud' && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hardware</div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Cloud Gateway</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(gatewayTotal)}{getBillingSuffix()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Stream OS - On-Premise Only */}
                    {deploymentType === 'onPremise' && streamOSVariant && streamOSQuantity > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stream OS</div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Stream OS</div>
                            <div className="text-xs text-gray-500 mt-0.5">{streamOSQuantity} unit(s)</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(streamOSPricePerCamera * streamOSQuantity)}{getBillingSuffix()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI-Box - On-Premise Only */}
                    {deploymentType === 'onPremise' && aiBoxVariant && aiBoxQuantity > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI-Box</div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">AI-Box</div>
                            <div className="text-xs text-gray-500 mt-0.5">{aiBoxQuantity} unit(s)</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(aiBoxPricePerUnit * aiBoxQuantity)}{getBillingSuffix()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Licenses - On-Premise Only */}
                    {deploymentType === 'onPremise' && aiLicenseVariant && aiLicenseQuantity > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Licenses</div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">AI Licenses</div>
                            <div className="text-xs text-gray-500 mt-0.5">{aiLicenseQuantity} unit(s)</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(aiLicensePricePerUnit * aiLicenseQuantity)}{getBillingSuffix()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Licenses */}
                    {connectCloudVariant && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Licenses</div>
                        {/* Base Connect Cloud License */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Connect Cloud – Platform Fee (Base License)</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(licensePricePerCamera * cameraCount)}{getBillingSuffix()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 pl-0">
                          {formatPrice(licensePricePerCamera)}/camera × {cameraCount} cameras
                        </div>
                        {/* Additional License Types */}
                        {licenseQuantities.core > 0 && (
                          <div className="flex justify-between items-start pl-4 mt-2">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Core Desktop License</div>
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {formatPrice(licensePricePerCamera * licenseQuantities.core)}{getBillingSuffix()}
                            </div>
                          </div>
                        )}
                        {licenseQuantities.web > 0 && (
                          <div className="flex justify-between items-start pl-4 mt-2">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Web User License</div>
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {formatPrice(licensePricePerCamera * licenseQuantities.web)}{getBillingSuffix()}
                            </div>
                          </div>
                        )}
                        {licenseQuantities.mobile > 0 && (
                          <div className="flex justify-between items-start pl-4 mt-2">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Mobile User License</div>
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {formatPrice(licensePricePerCamera * licenseQuantities.mobile)}{getBillingSuffix()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Cloud Storage */}
                    {selectedStorageAddon && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Storage</div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Cloud Storage</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(storageTotal)}{getBillingSuffix()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cyber + Pack (Stream OS) - On-Premise Only */}
                    {deploymentType === 'onPremise' && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Annual Maintenance</div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Cyber + Pack (Stream OS)</div>
                            <div className="text-xs text-gray-500 mt-0.5">1 year Cyber Security Pack for Stream</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(644 * streamOSQuantity)}/year
                          </div>
                        </div>
                        <div className="flex justify-between items-start mt-2">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Cyber + Pack (AI-Box & AI License)</div>
                            <div className="text-xs text-gray-500 mt-0.5">1 year Cyber Security Pack for AI-Box</div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {formatPrice(73600 * aiBoxQuantity)}/year
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Features */}
                    {deploymentType === 'ai' && aiFeaturesTotal > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Features</div>
                        <div className="space-y-2">
                          {AIFEATURES.map((category) => (
                            category.features
                              .filter((feature) => selectedAIFeatures[feature.name])
                              .map((feature) => {
                                const qty = selectedAIFeatures[feature.name] || 0;
                                const monthlyPrice = feature.price;
                                let featurePriceForCycle = monthlyPrice;
                                switch (billingCycle) {
                                  case 'monthly': featurePriceForCycle = monthlyPrice; break;
                                  case 'quarterly': featurePriceForCycle = monthlyPrice * 3 * 0.94; break;
                                  case 'semiAnnual': featurePriceForCycle = monthlyPrice * 6 * 0.90; break;
                                  case 'yearly': featurePriceForCycle = monthlyPrice * 12 * 0.80; break;
                                }
                                return (
                                  <div key={feature.name} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                    <div className="font-medium text-gray-800 text-sm">{feature.name}</div>
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {formatPrice(featurePriceForCycle * qty)}{getBillingSuffix()}
                                    </div>
                                  </div>
                                );
                              })
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-lg p-3 -mx-1">
                          <div className="font-semibold text-gray-900 text-sm">AI Features Total</div>
                          <div className="font-bold text-gray-900 text-base">
                            {formatPrice(aiFeaturesTotal)}{getBillingSuffix()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="px-6 py-4 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(total)}{getBillingSuffix()}
                      </div>
                    </div>
                  </div>
                  
                  {billingCycle !== 'monthly' && (
                    <div className="mt-2 text-xs text-gray-500 font-medium">
                      Equivalent to {formatPrice(total)} billed {billingCycle.replace('SemiAnnual', 'semi-annually').replace('yearly', 'annually')}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="px-6 py-4">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-12 text-base font-semibold bg-[#DC2626] hover:bg-[#B91C1C] transition-colors rounded-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

export default VSAASConfigurator;
