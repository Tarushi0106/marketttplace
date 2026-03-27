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
    core: 1,
    web: 0,
    mobile: 0,
  });
  const [selectedStorageAddonId, setSelectedStorageAddonId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isLicenseDropdownOpen, setIsLicenseDropdownOpen] = useState(false);

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

  // DERIVED quantities
  const hardwareQuantity = Math.ceil(cameraCount / 8);
  const storageQuantity = cameraCount;

  // LICENSE: Sum all license types (users can select multiple)
  const licenseQuantity = (licenseQuantities.core || 0) + (licenseQuantities.web || 0) + (licenseQuantities.mobile || 0);

  // DERIVED totals (single source of truth)
  const licenseTotal = licensePricePerCamera * licenseQuantity;
  const gatewayTotal = gatewayPricePerUnit * hardwareQuantity;
  const storageTotal = storagePricePerCamera * storageQuantity;
  
  const subtotal = licenseTotal + gatewayTotal + storageTotal;
  // Prices already include billing cycle discount, so no additional multiplier needed
  const total = subtotal;

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

    if (connectCloudVariant) {
      const connectCloudItem = {
        id: `${currentProduct.id}-${connectCloudVariant.id}-${Date.now()}-license`,
        product: { id: currentProduct.id, slug: currentProduct.slug, name: currentProduct.name },
        quantity: licenseQuantity,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: licensePricePerCamera,
        totalPrice: licenseTotal,
        variantId: connectCloudVariant.id,
      };
      addToCart(connectCloudItem as any);
    }

    if (cloudGatewayVariant && deploymentType === 'cloud') {
      const gatewayItem = {
        id: `${currentProduct.id}-${cloudGatewayVariant.id}-${Date.now()}-gateway`,
        product: { id: currentProduct.id, slug: currentProduct.slug, name: currentProduct.name },
        quantity: hardwareQuantity,
        selectedAddons: [],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: gatewayPricePerUnit,
        totalPrice: gatewayTotal,
        variantId: cloudGatewayVariant.id,
      };
      addToCart(gatewayItem as any);
    }

    if (selectedStorageAddon) {
      const storageItem = {
        id: `${currentProduct.id}-${selectedStorageAddon.id}-${Date.now()}-storage`,
        product: { id: currentProduct.id, slug: currentProduct.slug, name: currentProduct.name },
        quantity: storageQuantity,
        selectedAddons: [selectedStorageAddon],
        billingCycle: billingCycle.toUpperCase(),
        isRecurring: true,
        unitPrice: storagePricePerCamera,
        totalPrice: storageTotal,
        variantId: null,
      };
      addToCart(storageItem as any);
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
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  deploymentType === 'cloud'
                    ? 'border-[#C62828] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`font-bold text-lg ${deploymentType === 'cloud' ? 'text-[#C62828]' : 'text-gray-900'}`}>
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
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  deploymentType === 'onPremise'
                    ? 'border-[#C62828] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`font-bold text-lg ${deploymentType === 'onPremise' ? 'text-[#C62828]' : 'text-gray-900'}`}>
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
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  deploymentType === 'ai'
                    ? 'border-[#C62828] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`font-bold text-lg ${deploymentType === 'ai' ? 'text-[#C62828]' : 'text-gray-900'}`}>
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
                        {formatPrice(gatewayPricePerUnit)}/unit
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(gatewayTotal)}<span className="text-sm font-normal text-gray-500">{getBillingSuffix()}</span>
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
                        {formatPrice(licensePricePerCamera)}/camera
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(licenseTotal)}
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
                              className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                            />
                            <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          </div>
                          
                          {/* Quantity Controls Inside Dropdown */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
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
                        className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
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
          {/* SECTION 4: ON-PREMISE HARDWARE */}
          {/* ======================================== */}
          {deploymentType === 'onPremise' && (
            <div className="border border-gray-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Hardware (NVR)
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
                  <div>
                    <h4 className="font-semibold text-gray-900">NVR/Hardware Unit</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {cameraCount > 8 
                        ? `2 NVRs required for ${cameraCount} cameras` 
                        : `1 NVR (supports up to 8 cameras)`}
                    </p>
                    
                    {/* Feature Bullets */}
                    <ul className="space-y-1 text-sm text-gray-600 mt-3">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Supports 8/16 Cameras
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Local storage included
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        3 year warranty
                      </li>
                    </ul>
                  </div>
                  
                  {/* Right: Quantity */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {hardwareQuantity} unit{hardwareQuantity > 1 ? 's' : ''}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-calculated
                      </p>
                    </div>
                  </div>
                </div>
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
                        className={`p-2 rounded-lg border-2 text-center transition-all ${
                          billingCycle === option.value
                            ? 'border-[#C62828] bg-red-50'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        {option.discount > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            Save {option.discount}%
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

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
                    
                    {/* Licenses */}
                    {connectCloudVariant && licenseQuantity > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Licenses</div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 text-sm">Cloud Connect – Platform Fee</div>
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                              Recommended
                            </span>
                          </div>
                        </div>
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
                  </div>
                </div>

                {/* Total */}
                <div className="px-6 py-4 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#C62828]">
                        {formatPrice(total)}{getBillingSuffix()}
                      </div>
                      <div className="text-xs text-gray-500">
                        /{billingCycle === 'monthly' ? 'mo' : billingCycle === 'quarterly' ? 'quarter' : 'year'}
                      </div>
                    </div>
                  </div>
                  
                  {billingCycle !== 'monthly' && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      Equivalent to {formatPrice(total)} billed {billingCycle.replace('SemiAnnual', 'semi-annually').replace('yearly', 'annually')}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="px-6 py-4">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#C62828] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#8B1D1D] shadow-lg shadow-red-100 hover:shadow-xl transition-all duration-300 rounded-xl"
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
