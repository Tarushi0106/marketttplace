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

  // Parse the option name to extract title and subtitle
  // Format: "4 Days - Total 7 Days" -> title: "4 Days", subtitle: "Total 7 Days"
  const parseOptionName = (name: string) => {
    const parts = name.split(' - ');
    if (parts.length >= 2) {
      return { title: parts[0], subtitle: parts.slice(1).join(' - ') };
    }
    return { title: name, subtitle: '' };
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="mt-2 flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-[#1E2260]/20 w-full min-w-[320px] justify-between">
          <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {selectedOption ? selectedOption.name : `Select ${label}`}
          </span>
          <div className="flex items-center gap-2">
            {selectedOption && (
              <span className="text-[#1E2260] font-semibold">
                {formatPrice(selectedOption.price)}
              </span>
            )}
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-[460px] max-w-[90vw]"
          sideOffset={5}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2 max-h-[400px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.id === selectedId;
              const { title, subtitle } = parseOptionName(option.name);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-lg cursor-pointer outline-none transition-all mb-1 ${
                    isSelected 
                      ? 'bg-[#fff1f1] border-l-4 border-[#1E2260]' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-base ${isSelected ? 'text-[#1E2260]' : 'text-gray-900'}`}>
                      {title}
                    </span>
                    {subtitle && (
                      <span className="text-sm text-gray-500 mt-0.5">
                        {subtitle}
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold text-base ml-4 ${isSelected ? 'text-[#1E2260]' : 'text-gray-900'}`}>
                    {formatPrice(option.price)}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Clear option */}
          {selectedId && (
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => {
                  onSelectionChange(null);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-all font-medium"
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
