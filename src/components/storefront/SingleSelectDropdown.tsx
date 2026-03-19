'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface SingleSelectDropdownProps {
  label: string;
  options: Option[];
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
  formatPrice: (price: number) => string;
}

export default function SingleSelectDropdown({
  label,
  options,
  selectedId,
  onSelectionChange,
  formatPrice,
}: SingleSelectDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.id === selectedId);

  const handleSelect = (id: string) => {
    // If clicking the already selected option, deselect it
    if (id === selectedId) {
      onSelectionChange(null);
    } else {
      onSelectionChange(id);
    }
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#C62828]/20 w-full min-w-[200px] justify-between">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.name : `Select ${label}`}
          </span>
          <div className="flex items-center gap-2">
            {selectedOption && (
              <span className="text-[#C62828] font-medium">
                +{formatPrice(selectedOption.price)}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-[300px]"
          sideOffset={5}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-1 max-h-[300px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer outline-none transition-all ${
                    isSelected 
                      ? 'bg-[#C62828]/10 text-[#C62828]' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio circle indicator */}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#C62828] bg-[#C62828]' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
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
              );
            })}
          </div>
          
          {/* Clear option */}
          {selectedId && (
            <div className="border-t border-gray-100 p-1">
              <button
                onClick={() => {
                  onSelectionChange(null);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X className="w-4 h-4" />
                Clear selection
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
