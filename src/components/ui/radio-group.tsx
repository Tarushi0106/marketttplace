"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("grid gap-2", className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function RadioGroupItem({ value, id, disabled, className, children }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context.value === value;

  return (
    <label
      className={cn(
        "flex items-center space-x-2 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="radio"
        value={value}
        id={id}
        checked={isChecked}
        disabled={disabled}
        onChange={() => context.onValueChange?.(value)}
        className="w-4 h-4 text-[#1E2260] border-gray-300 focus:ring-[#1E2260]"
      />
      {children && <span className="sr-only">{children}</span>}
      {children && <span className="text-sm">{children}</span>}
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
