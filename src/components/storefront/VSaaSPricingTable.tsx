"use client";

import { useState, useMemo } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface PricingItem {
  id: string;
  name: string;
  description?: string | null;
  unit: string;
  unitPrice: number;
  minQuantity?: number;
  maxQuantity?: number;
  isRequired?: boolean;
  defaultQuantity?: number;
}

interface PricingSection {
  title: string;
  unitLabel?: string;
  items: PricingItem[];
  subsections?: {
    title: string;
    description?: string | null;
    items: PricingItem[];
  }[];
}

interface VSaaSPricingTableProps {
  sections: PricingSection[];
  onQuantityChange?: (itemId: string, quantity: number) => void;
  showTotal?: boolean;
  className?: string;
}

export function VSaaSPricingTable({
  sections,
  onQuantityChange,
  showTotal = true,
  className = ""
}: VSaaSPricingTableProps) {
  // Track quantities for each item
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    sections.forEach(section => {
      section.items.forEach(item => {
        initial[item.id] = item.defaultQuantity || item.minQuantity || 0;
      });
      section.subsections?.forEach(sub => {
        sub.items.forEach(item => {
          initial[item.id] = item.defaultQuantity || item.minQuantity || 0;
        });
      });
    });
    return initial;
  });

  // Calculate totals
  const totals = useMemo(() => {
    let hardwareTotal = 0;
    let licensesTotal = 0;

    sections.forEach((section, sectionIndex) => {
      section.items.forEach(item => {
        const qty = quantities[item.id] || 0;
        const itemTotal = item.unitPrice * qty;
        if (sectionIndex === 0) {
          hardwareTotal += itemTotal;
        } else {
          licensesTotal += itemTotal;
        }
      });
      section.subsections?.forEach(sub => {
        sub.items.forEach(item => {
          const qty = quantities[item.id] || 0;
          const itemTotal = item.unitPrice * qty;
          licensesTotal += itemTotal;
        });
      });
    });

    return { hardwareTotal, licensesTotal, grandTotal: hardwareTotal + licensesTotal };
  }, [sections, quantities]);

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities(prev => {
      const currentQty = prev[itemId] || 0;
      const item = sections
        .flatMap(s => [...s.items, ...(s.subsections?.flatMap(sub => sub.items) || [])])
        .find(i => i.id === itemId);
      
      if (!item) return prev;
      
      const min = item.minQuantity || 0;
      const max = item.maxQuantity || 999;
      const newQty = Math.max(min, Math.min(max, currentQty + delta));
      
      onQuantityChange?.(itemId, newQty);
      return { ...prev, [itemId]: newQty };
    });
  };

  // Render quantity selector
  const renderQuantitySelector = (item: PricingItem) => {
    const qty = quantities[item.id] || 0;
    const min = item.minQuantity || 0;
    const max = item.maxQuantity || 999;
    const canDecrease = qty > min;
    const canIncrease = qty < max;

    return (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => handleQuantityChange(item.id, -1)}
          disabled={!canDecrease}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all text-sm ${
            canDecrease
              ? "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              : "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center font-semibold text-gray-900 text-sm">{qty}</span>
        <button
          onClick={() => handleQuantityChange(item.id, 1)}
          disabled={!canIncrease}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all text-sm ${
            canIncrease
              ? "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              : "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // Render item row
  const renderItemRow = (item: PricingItem, showBorder = true) => {
    const qty = quantities[item.id] || 0;
    const totalPrice = item.unitPrice * qty;

    return (
      <div 
        className={`grid grid-cols-12 gap-2 items-center py-3 px-4 ${showBorder ? 'border-b border-gray-100' : ''}`}
        key={item.id}
      >
        {/* Description - 5 columns */}
        <div className="col-span-5">
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.description && (
            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
          )}
        </div>
        
        {/* Unit - 2 columns, centered */}
        <div className="col-span-2 text-center">
          <span className="text-sm text-gray-600">{item.unit}</span>
        </div>
        
        {/* Quantity - 2 columns, centered */}
        <div className="col-span-2 flex justify-center">
          {renderQuantitySelector(item)}
        </div>
        
        {/* Price - 3 columns, right aligned */}
        <div className="col-span-3 text-right">
          <span className="font-semibold text-gray-900">
            {qty > 0 ? formatPrice(totalPrice) : '—'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 py-2 px-4 bg-gray-50 border-b-2 border-gray-200 rounded-t-lg">
        <div className="col-span-5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</span>
        </div>
        <div className="col-span-3 text-right">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</span>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <div 
          key={section.title} 
          className={`${sectionIndex === sections.length - 1 ? 'rounded-b-lg' : ''} border border-t-0 border-gray-200 bg-white`}
        >
          {/* Section Title */}
          <div className="py-3 px-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
              {section.unitLabel && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {section.unitLabel}
                </span>
              )}
            </div>
          </div>

          {/* Section Items */}
          {section.items.map((item, itemIndex) => 
            renderItemRow(item, itemIndex < section.items.length - 1 || !!section.subsections)
          )}

          {/* Subsections */}
          {section.subsections?.map((subsection) => (
            <div key={subsection.title} className="border-t border-gray-200">
              {/* Subsection Title */}
              <div className="py-2 px-4 bg-blue-50/50 border-b border-gray-100">
                <h4 className="font-medium text-gray-800 text-sm">{subsection.title}</h4>
                {subsection.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {Array.isArray(subsection.description) ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {subsection.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{subsection.description}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Subsection Items */}
              {subsection.items.map((item, itemIndex) => 
                renderItemRow(item, itemIndex < subsection.items.length - 1)
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Totals Section */}
      {showTotal && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Hardware Total</span>
              <span className="font-semibold text-gray-900">{formatPrice(totals.hardwareTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Licences Total</span>
              <span className="font-semibold text-gray-900">{formatPrice(totals.licensesTotal)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Grand Total</span>
              <span className="text-lg font-bold text-red-600">{formatPrice(totals.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo component with sample data for VSaaS
export function VSaaSPricingDemo() {
  const sections: PricingSection[] = [
    {
      title: "Hardware",
      items: [
        {
          id: "cloud-gateway",
          name: "Cloud Gateway Link Device",
          description: "1 Hardware supports 8 Cameras • Creates secured network tunnel with Cloud • Connects 8/16 channels in local network • 3 year warranty",
          unit: "Capex One Time",
          unitPrice: 8500,
          minQuantity: 1,
          maxQuantity: 10,
          defaultQuantity: 1,
          isRequired: true
        }
      ]
    },
    {
      title: "Licences to be Procured",
      unitLabel: "Per camera",
      items: [],
      subsections: [
        {
          title: "Connect Cloud (Platform Fee - Base License)",
          description: "Cloud VMS with Live & Playback • 3 Days Cloud Backup (8 fps, SD 640×480P, H.265) • Admin Panel for device/user management • 1x Core Desktop application • 5x Web View access • 5x Mobile App access (Android & iOS) • Device Health Check (Cameras/NVRs/HDD/SD Card etc.) • Reports & Dashboard • Logs & Audit Trail",
          items: [
            {
              id: "connect-cloud",
              name: "Connect Cloud",
              unit: "Per camera",
              unitPrice: 1500,
              minQuantity: 2,
              maxQuantity: 100,
              defaultQuantity: 2,
              isRequired: true
            }
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">VSaaS Pricing Configuration</h2>
      <VSaaSPricingTable 
        sections={sections}
        onQuantityChange={(itemId, quantity) => console.log(`${itemId}: ${quantity}`)}
      />
    </div>
  );
}

export default VSaaSPricingTable;