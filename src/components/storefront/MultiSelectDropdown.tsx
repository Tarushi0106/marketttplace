"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import * as Popover from "@radix-ui/react-popover";

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  formatPrice: (price: number) => string;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedIds,
  onSelectionChange,
  formatPrice,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      // Remove from selection
      onSelectionChange(selectedIds.filter((id) => id !== optionId));
    } else {
      // Add to selection
      onSelectionChange([...selectedIds, optionId]);
    }
  };

  // Calculate total price of selected options
  const totalPrice = options
    .filter((opt) => selectedIds.includes(opt.id))
    .reduce((sum, opt) => sum + opt.price, 0);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#C62828]/20 w-full min-w-[200px]">
          <span>
            {selectedIds.length === 0
              ? `Select ${label}`
              : `${selectedIds.length} ${label} selected`}
            {selectedIds.length > 0 && ` • ${formatPrice(totalPrice)}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50 w-72 max-h-[300px] overflow-y-auto"
          sideOffset={5}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-1">
            {options.map((option) => {
              const isChecked = selectedIds.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleOption(option.id)}
                    className="data-[state=checked]:bg-[#C62828] data-[state=checked]:border-[#C62828] border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="text-sm text-gray-900 font-medium">
                      {option.name}
                    </div>
                    {option.description && (
                      <div className="text-xs text-gray-400">
                        {option.description}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(option.price)}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Selected summary at bottom */}
          {selectedIds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center px-3">
                <span className="text-sm font-medium text-gray-900">
                  Total: {formatPrice(totalPrice)}
                </span>
                <button
                  onClick={() => onSelectionChange([])}
                  className="text-xs text-[#C62828] hover:underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          <Popover.Arrow className="fill-gray-200" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ============================================
// USAGE EXAMPLE - How to integrate in your component:
// ============================================

/*

// In your component:

// 1. State for multi-select dropdown (use object to track multiple groups)
const [multiSelectedAddons, setMultiSelectedAddons] = useState<Record<string, string[]>>({});

// 2. Handle selection change for a group
const handleAddonSelectionChange = (groupName: string, selectedIds: string[]) => {
  setMultiSelectedAddons(prev => ({
    ...prev,
    [groupName]: selectedIds
  }));
  
  // Also update addonQuantities for price calculation
  setAddonQuantities(prev => {
    const updated = { ...prev };
    // Clear all items in this group first
    groupedAddons.find(([name]) => name === groupName)?.[1].forEach(item => {
      updated[item.id] = 0;
    });
    // Set selected items to quantity 1
    selectedIds.forEach(id => {
      updated[id] = 1;
    });
    return updated;
  });
};

// 3. Calculate total price (use this in your price calculation)
const calculateGroupPrice = (groupName: string) => {
  const group = groupedAddons.find(([name]) => name === groupName);
  if (!group) return 0;
  const [_, items] = group;
  const selectedIds = multiSelectedAddons[groupName] || [];
  return items
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
};

// 4. In your JSX:
{groupedAddons.map(([baseName, items]) => (
  <div key={baseName}>
    <MultiSelectDropdown
      label={baseName}
      options={items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description
      }))}
      selectedIds={multiSelectedAddons[baseName] || []}
      onSelectionChange={(ids) => handleAddonSelectionChange(baseName, ids)}
      formatPrice={formatPrice}
    />
  </div>
))}

*/
