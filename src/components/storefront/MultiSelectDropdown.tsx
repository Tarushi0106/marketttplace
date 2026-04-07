s'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Minus, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface SelectedOption {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit?: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onSelectionChange: (selected: SelectedOption[]) => void;
  formatPrice: (price: number) => string;
  showQuantity?: boolean;
  defaultUnit?: string;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedIds,
  onSelectionChange,
  formatPrice,
  showQuantity = true,
  defaultUnit = 'per camera',
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  
  // Internal state to track quantities - initialized from selectedIds
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Sync internal state when selectedIds changes from parent
  useEffect(() => {
    // Set default qty=1 for all selected IDs that don't have a quantity yet
    const newQuantities = { ...selectedQuantities };
    let changed = false;
    
    selectedIds.forEach(id => {
      if (!newQuantities[id]) {
        newQuantities[id] = 1;
        changed = true;
      }
    });
    
    // Remove quantities for IDs that are no longer selected
    Object.keys(newQuantities).forEach(id => {
      if (!selectedIds.includes(id)) {
        delete newQuantities[id];
        changed = true;
      }
    });
    
    if (changed) {
      setSelectedQuantities(newQuantities);
    }
  }, [selectedIds]);

  // Build selectedOptions from selectedIds + quantities
  const selectedOptions: SelectedOption[] = selectedIds.map(id => {
    const option = options.find(o => o.id === id);
    return {
      id,
      name: option?.name || '',
      price: option?.price || 0,
      qty: selectedQuantities[id] || 1,
      unit: defaultUnit
    };
  });

  // Calculate total price: sum(option.price * option.qty)
  const totalPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price * opt.qty), 0);

  // Toggle selection - when checked, add with qty=1; when unchecked, remove
  const handleToggle = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId);
    
    if (isSelected) {
      // Remove from selection - also remove from quantities
      const newIds = selectedIds.filter(id => id !== optionId);
      const newQuantities = { ...selectedQuantities };
      delete newQuantities[optionId];
      setSelectedQuantities(newQuantities);
      
      // Build and notify parent
      const newSelection = newIds.map(id => ({
        id,
        name: options.find(o => o.id === id)?.name || '',
        price: options.find(o => o.id === id)?.price || 0,
        qty: newQuantities[id] || 1
      }));
      onSelectionChange(newSelection);
    } else {
      // Add to selection with default qty=1
      const newIds = [...selectedIds, optionId];
      setSelectedQuantities(prev => ({ ...prev, [optionId]: 1 }));
      
      // Build and notify parent
      const newSelection = newIds.map(id => ({
        id,
        name: options.find(o => o.id === id)?.name || '',
        price: options.find(o => o.id === id)?.price || 0,
        qty: selectedQuantities[id] || 1
      }));
      onSelectionChange(newSelection);
    }
  };

  // Increase quantity for specific option - IMMUTABLE update
  const increaseQty = (optionId: string) => {
    setSelectedQuantities(prev => {
      const newQty = (prev[optionId] || 1) + 1;
      const updated = { ...prev, [optionId]: newQty };
      
      // Notify parent of change
      const newSelection = selectedIds.map(id => ({
        id,
        name: options.find(o => o.id === id)?.name || '',
        price: options.find(o => o.id === id)?.price || 0,
        qty: updated[id] || 1
      }));
      onSelectionChange(newSelection);
      
      return updated;
    });
  };

  // Decrease quantity for specific option (min 1) - IMMUTABLE update
  const decreaseQty = (optionId: string) => {
    setSelectedQuantities(prev => {
      const currentQty = prev[optionId] || 1;
      if (currentQty <= 1) return prev;
      
      const newQty = currentQty - 1;
      const updated = { ...prev, [optionId]: newQty };
      
      // Notify parent of change
      const newSelection = selectedIds.map(id => ({
        id,
        name: options.find(o => o.id === id)?.name || '',
        price: options.find(o => o.id === id)?.price || 0,
        qty: updated[id] || 1
      }));
      onSelectionChange(newSelection);
      
      return updated;
    });
  };

  // Remove option entirely
  const removeOption = (optionId: string) => {
    const newIds = selectedIds.filter(id => id !== optionId);
    const newQuantities = { ...selectedQuantities };
    delete newQuantities[optionId];
    setSelectedQuantities(newQuantities);
    
    const newSelection = newIds.map(id => ({
      id,
      name: options.find(o => o.id === id)?.name || '',
      price: options.find(o => o.id === id)?.price || 0,
      qty: newQuantities[id] || 1
    }));
    onSelectionChange(newSelection);
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedQuantities({});
    onSelectionChange([]);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#C62828]/20 w-full min-w-[200px] justify-between">
            <span className={selectedIds.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
              {selectedIds.length === 0 
                ? `Select ${label}` 
                : `${selectedIds.length} selected`}
            </span>
            <div className="flex items-center gap-2">
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-[420px]"
          sideOffset={5}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Options list - compact with smaller height */}
          <div className="p-1 max-h-[180px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              const qty = selectedQuantities[option.id] || 1;
              
              return (
                <div
                  key={option.id}
                  className={`rounded mb-0.5 ${isSelected ? 'bg-gray-50' : ''}`}
                >
                  {/* Dropdown item row - 4 column grid: Name | Unit | Qty | Price */}
                  <button
                    type="button"
                    onClick={() => handleToggle(option.id)}
                    className={`w-full grid grid-cols-[3fr_1fr_1fr_1fr] gap-1 items-center px-2 py-1.5 cursor-pointer outline-none transition-all rounded ${
                      isSelected ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {/* Column 1: Name with checkbox */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected ? 'bg-[#C62828] border-[#C62828]' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`font-medium text-xs ${isSelected ? 'text-[#C62828]' : 'text-gray-900'}`}>
                        {option.name}
                      </span>
                    </div>
                    
                    {/* Column 2: Unit */}
                    <div className="text-center">
                      <span className="text-[10px] text-gray-400">{defaultUnit}</span>
                    </div>
                    
                    {/* Center: Quantity (if selected and showQuantity is true) */}
                    <div className="flex justify-center">
                      {isSelected && showQuantity ? (
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseQty(option.id);
                            }}
                            disabled={qty <= 1}
                            className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-4 text-center text-xs font-medium">{qty}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              increaseQty(option.id);
                            }}
                            className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </div>
                    
                    {/* Right: Price */}
                    <div className="text-right">
                      <span className={`font-semibold text-xs ${isSelected ? 'text-[#C62828]' : 'text-gray-900'}`}>
                        {isSelected ? formatPrice(option.price * qty) : formatPrice(option.price)}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Items Summary - compact */}
          {selectedOptions.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Selected</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] text-[#C62828] hover:underline"
                >
                  Clear
                </button>
              </div>
              {/* Selected items as compact rows */}
              <div className="space-y-0.5 max-h-[80px] overflow-y-auto">
                {selectedOptions.map((option) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-1 items-center px-1 py-0.5 bg-white rounded text-xs"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <span className="truncate text-gray-700 text-[10px]">{option.name}</span>
                    </div>
                    
                    {/* Unit */}
                    <div className="text-center text-gray-400 text-[10px]">
                      {option.unit}
                    </div>
                    
                    {/* Qty */}
                    <div className="text-center text-gray-400 text-[10px]">
                      {option.qty}
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <span className="font-medium text-gray-900 text-[10px]">
                        {formatPrice(option.price * option.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-600">Total</span>
                <span className="text-xs font-bold text-[#C62828]">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
