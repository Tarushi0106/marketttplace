'use client';

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
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onSelectionChange: (selected: SelectedOption[]) => void;
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
      qty: selectedQuantities[id] || 1
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
        <button className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#C62828]/20 w-full min-w-[250px] justify-between">
          <span className={selectedIds.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
            {selectedIds.length === 0 
              ? `Select ${label}` 
              : `${selectedIds.length} selected`}
          </span>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <span className="text-[#C62828] font-medium">
                +{formatPrice(totalPrice)}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-[350px]"
          sideOffset={5}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Options list */}
          <div className="p-1 max-h-[250px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              const qty = selectedQuantities[option.id] || 1;
              
              return (
                <div
                  key={option.id}
                  className={`rounded-lg mb-1 ${isSelected ? 'bg-gray-50' : ''}`}
                >
                  {/* Checkbox row */}
                  <button
                    type="button"
                    onClick={() => handleToggle(option.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 cursor-pointer outline-none transition-all ${
                      isSelected ? 'text-[#C62828]' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#C62828] border-[#C62828]' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className={`font-medium ${isSelected ? 'text-[#C62828]' : 'text-gray-900'}`}>
                          {option.name}
                        </span>
                        {option.description && (
                          <span className="text-xs text-gray-400">{option.description}</span>
                        )}
                      </div>
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-[#C62828]' : 'text-gray-900'}`}>
                      +{formatPrice(option.price)}
                    </span>
                  </button>

                  {/* Quantity controls - shown only when selected */}
                  {isSelected && (
                    <div className="flex items-center justify-between px-3 py-2 pb-3 ml-8">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Quantity:</span>
                        <div className="flex items-center bg-white rounded-full border border-gray-200">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseQty(option.id);
                            }}
                            disabled={qty <= 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              increaseQty(option.id);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#C62828]">
                          {formatPrice(option.price * qty)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(option.id);
                          }}
                          className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Footer with total and clear */}
          {selectedIds.length > 0 && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-lg font-bold text-[#C62828]">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
                Clear all selections
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default MultiSelectDropdown;
