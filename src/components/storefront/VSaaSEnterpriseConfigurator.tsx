"use client";

import { useState, useMemo } from "react";
import { Check, Minus, Plus, ShoppingCart, Box, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

// Types for VSaaS Enterprise Configurator
interface EnterpriseHardwareConfig {
  name: string;
  description: string;
  features: string[];
  unit: string;
  unitPrice: number;
  defaultQuantity?: number;
}

interface EnterpriseLicenseConfig {
  name: string;
  subtitle?: string;
  features: string[];
  unit: string;
  unitPrice: number;
  defaultQuantity?: number;
}

interface EnterpriseAddonConfig {
  id: string;
  name: string;
  description?: string;
  features: string[];
  unit: string;
  unitPrice: number;
  defaultQuantity?: number;
}

interface VSaaSEnterpriseConfiguratorProps {
  hardware?: EnterpriseHardwareConfig;
  license?: EnterpriseLicenseConfig;
  addons?: EnterpriseAddonConfig[];
  onAddToCart?: (config: {
    hardware: { name: string; quantity: number; price: number; total: number };
    license: { name: string; quantity: number; price: number; total: number };
    addons: Array<{ id: string; name: string; quantity: number; price: number; total: number }>;
    grandTotal: number;
  }) => void;
}

// Main Enterprise Configurator Component
export function VSaaSEnterpriseConfigurator({
  hardware = {
    name: "Cloud Gateway Link Device",
    description: "1 Hardware supports 8 Cameras • Creates secured network tunnel with Cloud • Connects 8/16 channels in local network • 3 year warranty",
    features: [
      "Supports 8 Cameras",
      "Secure cloud tunnel",
      "8/16 channel connectivity",
      "3 year warranty"
    ],
    unit: "Capex • One Time",
    unitPrice: 8500,
    defaultQuantity: 1
  },
  license = {
    name: "Connect Cloud",
    subtitle: "(Platform Fee - Base License)",
    features: [
      "Cloud VMS with Live & Playback",
      "3 Days Cloud Backup (8fps, SD 640×480P, H.265)",
      "Admin Panel for device/user management",
      "1x Core Desktop application",
      "5x Web View access",
      "5x Mobile App access (Android & iOS)",
      "Device Health Check (Cameras/NVRs/HDD/SD Card etc.)",
      "Reports & Dashboard",
      "Logs & Audit Trail"
    ],
    unit: "Per camera",
    unitPrice: 1500,
    defaultQuantity: 8
  },
  addons = [],
  onAddToCart
}: VSaaSEnterpriseConfiguratorProps) {
  // State for quantities
  const [hardwareQty, setHardwareQty] = useState(hardware.defaultQuantity || 1);
  const [licenseQty, setLicenseQty] = useState(license.defaultQuantity || 8);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    addons?.forEach(addon => {
      initial[addon.id] = addon.defaultQuantity || 0;
    });
    return initial;
  });
  
  // Track expanded addons
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});

  // Calculate totals
  const totals = useMemo(() => {
    const hardwareTotal = hardware.unitPrice * hardwareQty;
    const licenseTotal = license.unitPrice * licenseQty;
    let addonsTotal = 0;
    
    addons?.forEach(addon => {
      addonsTotal += addon.unitPrice * (addonQuantities[addon.id] || 0);
    });

    // Platform Add-ons
    const platformAddonsTotal = 
      (addonQuantities['coreDesktop'] || 0) * 6578 +
      (addonQuantities['webUser'] || 0) * 69 +
      (addonQuantities['mobileUser'] || 0) * 69;

    // Cloud Storage
    let cloudStorageTotal = 0;
    const cloudStorageType = addonQuantities['cloudStorageType'];
    if (cloudStorageType && typeof cloudStorageType === 'string' && cloudStorageType !== 'none') {
      cloudStorageTotal = 
        cloudStorageType === '4days' ? 138 * licenseQty :
        cloudStorageType === '27days' ? 391 * licenseQty :
        cloudStorageType === '87days' ? 920 * licenseQty :
        cloudStorageType === '177days' ? 1702 * licenseQty :
        cloudStorageType === '362days' ? 3312 * licenseQty : 0;
    }

    return {
      hardware: hardwareTotal,
      license: licenseTotal,
      addons: addonsTotal,
      platformAddons: platformAddonsTotal,
      cloudStorage: cloudStorageTotal,
      grandTotal: hardwareTotal + licenseTotal + addonsTotal + platformAddonsTotal + cloudStorageTotal
    };
  }, [hardware, license, hardwareQty, licenseQty, addonQuantities, addons]);

  // Handlers
  const handleHardwareChange = (delta: number) => {
    setHardwareQty(prev => {
      const newQty = Math.max(1, Math.min(10, prev + delta));
      // When hardware changes, update license to be hardware * 8
      setLicenseQty(newQty * 8);
      return newQty;
    });
  };

  const handleLicenseChange = (delta: number) => {
    setLicenseQty(prev => {
      const newQty = Math.max(1, Math.min(100, prev + delta));
      // When license changes, auto-adjust hardware based on license
      const requiredHardware = Math.ceil(newQty / 8);
      setHardwareQty(Math.min(10, Math.max(1, requiredHardware)));
      return newQty;
    });
  };

  const handleAddonQuantityChange = (addonId: string, delta: number) => {
    setAddonQuantities(prev => ({
      ...prev,
      [addonId]: Math.max(0, Math.min(10, (prev[addonId] || 0) + delta))
    }));
  };

  const toggleAddonExpanded = (addonId: string) => {
    setExpandedAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };

  const handleAddToCart = () => {
    const config = {
      hardware: { 
        name: hardware.name, 
        quantity: hardwareQty, 
        price: hardware.unitPrice,
        total: totals.hardware 
      },
      license: { 
        name: license.name, 
        quantity: licenseQty, 
        price: license.unitPrice,
        total: totals.license 
      },
      addons: addons
        .filter(a => (addonQuantities[a.id] || 0) > 0)
        .map(a => ({ 
          id: a.id,
          name: a.name, 
          quantity: addonQuantities[a.id], 
          price: a.unitPrice,
          total: a.unitPrice * addonQuantities[a.id]
        })),
      grandTotal: totals.grandTotal
    };
    onAddToCart?.(config);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SECTION - 70% - Document Style Layout */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* SECTION 1: HARDWARE */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Section Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-2.5">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Hardware</h3>
            </div>
            
            {/* Hardware Spec Block */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title & Tag */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded bg-red-50 flex items-center justify-center">
                      <Box className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">{hardware.name}</h4>
                  </div>
                  
                  {/* Tag */}
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {hardware.unit}
                    </span>
                  </div>
                  
                  {/* Features */}
                  <ul className="mt-2 space-y-1">
                    {hardware.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Price & Quantity on Right */}
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500 mb-1">Unit Price</div>
                  <div className="text-base font-semibold text-gray-900 mb-2">
                    {formatPrice(hardware.unitPrice)}
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => handleHardwareChange(-1)}
                      disabled={hardwareQty <= 1}
                      className="w-7 h-7 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-semibold text-gray-900 text-sm">{hardwareQty}</span>
                    <button
                      onClick={() => handleHardwareChange(1)}
                      disabled={hardwareQty >= 10}
                      className="w-7 h-7 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Line Total */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Hardware Total</span>
                <span className="text-base font-bold text-gray-900">{formatPrice(totals.hardware)}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: LICENSES */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Section Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-2.5">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Licenses to be Procured</h3>
            </div>
            
            {/* License Spec Block - Primary (highlighted) */}
            <div className="p-5 bg-blue-50/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title & Tag */}
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">{license.name}</h4>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">{license.subtitle}</span>
                  </div>
                  
                  {/* Tag */}
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {license.unit}
                    </span>
                  </div>
                  
                  {/* Features */}
                  <ul className="mt-2 space-y-1">
                    {license.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Price & Quantity on Right */}
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500 mb-1">Per Camera</div>
                  <div className="text-base font-semibold text-gray-900 mb-2">
                    {formatPrice(license.unitPrice)}
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1.5 rounded-lg p-1">
                    <button
                      onClick={() => handleLicenseChange(-1)}
                      disabled={licenseQty <= 1}
                      className="w-7 h-7 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-semibold text-gray-900 text-sm">{licenseQty}</span>
                    <button
                      onClick={() => handleLicenseChange(1)}
                      disabled={licenseQty >= 100}
                      className="w-7 h-7 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Line Total */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500">License Total</span>
                <span className="text-base font-bold text-gray-900">{formatPrice(totals.license)}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: OPTIONAL ADD-ONS */}
          {addons && addons.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Section Header */}
              <div className="bg-gray-100 border-b border-gray-200 px-5 py-2.5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Optional Add-ons</h3>
              </div>
              
              {/* Addons List */}
              <div className="divide-y divide-gray-100">
                {addons.map((addon) => {
                  const isExpanded = expandedAddons[addon.id] || false;
                  const qty = addonQuantities[addon.id] || 0;
                  const isSelected = qty > 0;
                  const addonTotal = addon.unitPrice * qty;
                  
                  return (
                    <div key={addon.id} className={`p-4 ${isSelected ? 'bg-green-50/50' : ''}`}>
                      {/* Addon Header */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                            onClick={() => handleAddonQuantityChange(addon.id, isSelected ? -qty : 1)}
                            style={{
                              backgroundColor: isSelected ? '#22c55e' : 'white',
                              borderColor: isSelected ? '#22c55e' : '#d1d5db'
                            }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">{addon.name}</h5>
                            {addon.description && (
                              <p className="text-xs text-gray-500">{addon.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          {/* Unit Price */}
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Unit</div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(addon.unitPrice)}
                            </div>
                          </div>
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                            <button
                              onClick={() => handleAddonQuantityChange(addon.id, -1)}
                              disabled={qty <= 0}
                              className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-2 h-2" />
                            </button>
                            <span className="w-5 text-center font-medium text-gray-900 text-xs">{qty}</span>
                            <button
                              onClick={() => handleAddonQuantityChange(addon.id, 1)}
                              disabled={qty >= 10}
                              className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-2 h-2" />
                            </button>
                          </div>
                          
                          {/* Line Total */}
                          <div className="text-right w-20">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {qty > 0 ? formatPrice(addonTotal) : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expandable Features */}
                      {isExpanded && addon.features && addon.features.length > 0 && (
                        <div className="mt-3 ml-8 pl-2 border-l-2 border-gray-200">
                          <ul className="space-y-1">
                            {addon.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SECTION - 30% - Sticky Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-4">
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-5 py-2.5">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Summary</h3>
              </div>
              
              <div className="p-5">
                <div className="space-y-3">
                  {/* Hardware */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hardware.name}</span>
                    <span className="font-medium text-gray-900">{formatPrice(totals.hardware)}</span>
                  </div>
                  
                  {/* License breakdown */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {license.name}
                    </span>
                    <span className="font-medium text-gray-900">{formatPrice(totals.license)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 pl-2">
                    <span>{formatPrice(license.unitPrice)} × {licenseQty} cameras</span>
                  </div>
                  
                  {/* Addons breakdown */}
                  {addons?.map(addon => {
                    const qty = addonQuantities[addon.id] || 0;
                    if (qty === 0) return null;
                    return (
                      <div key={addon.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{addon.name} × {qty}</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(addon.unitPrice * qty)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-3"></div>
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(totals.hardware + totals.license + totals.addons)}
                    </span>
                  </div>
                  
                  {/* Grand Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">Grand Total</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(totals.grandTotal)}
                    </span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full mt-5 h-11 text-sm font-semibold bg-gradient-to-r from-[#C62828] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#8B1D1D] shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                
                {/* Help Text */}
                <p className="text-xs text-gray-400 text-center mt-3">
                  Secure checkout • Instant access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo Component with sample data
export function VSaaSEnterpriseConfiguratorDemo() {
  const sampleAddons: EnterpriseAddonConfig[] = [
    {
      id: "cloud-storage-7",
      name: "Cloud Storage - 7 Days",
      description: "Additional cloud storage for recordings",
      features: ["7 days retention", "HD quality", "Automatic rollover"],
      unit: "Per camera/mo",
      unitPrice: 500,
      defaultQuantity: 0
    },
    {
      id: "cloud-storage-30",
      name: "Cloud Storage - 30 Days",
      description: "Extended cloud storage for recordings",
      features: ["30 days retention", "HD quality", "Automatic rollover"],
      unit: "Per camera/mo",
      unitPrice: 1500,
      defaultQuantity: 0
    },
    {
      id: "ai-analytics",
      name: "AI Analytics Add-on",
      description: "Advanced AI-powered analytics",
      features: ["People counting", "Vehicle detection", "Heatmaps", "Intrusion detection"],
      unit: "Per camera/mo",
      unitPrice: 750,
      defaultQuantity: 0
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your VSaaS Solution</h2>
        <p className="text-sm text-gray-500 mb-6">Select your hardware and license options</p>
        
        <VSaaSEnterpriseConfigurator 
          addons={sampleAddons}
          onAddToCart={(config) => console.log("Add to cart:", config)}
        />
      </div>
    </div>
  );
}

export default VSaaSEnterpriseConfigurator;