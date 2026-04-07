'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Types based on Prisma schema
interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  minQuantity: number;
  maxQuantity: number | null;
  quantityStep: number;
  dependencyType: string | null;
  dependencyValue: number | null;
  dependencyProductId: string | null;
}

interface QuantityState {
  productId: string;
  quantity: number;
}

interface UseProductQuantityReturn {
  // State
  quantities: Map<string, number>;
  
  // Calculations
  calculatePrice: (product: Product) => number;
  calculateTotalPrice: () => number;
  getRequiredQuantity: (productId: string) => number;
  
  // Actions
  setQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  canIncrement: (productId: string) => boolean;
  canDecrement: (productId: string) => boolean;
  
  // Validation messages
  getValidationMessage: (product: Product) => string | null;
  
  // Reset
  reset: () => void;
}

/**
 * Hook for managing product quantities with validation and dependency logic
 * 
 * Features:
 * - Enforce minQuantity
 * - Enforce maxQuantity (optional)
 * - Support quantityStep
 * - Dependency calculation (e.g., cameras -> hardware)
 * - Price calculation
 */
export function useProductQuantity(
  products: Product[],
  initialQuantities: QuantityState[] = []
): UseProductQuantityReturn {
  
  // Initialize quantities from products' minQuantity or initial values
  const [quantities, setQuantitiesState] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    
    // Set initial quantities
    initialQuantities.forEach(({ productId, quantity }) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        map.set(productId, Math.max(product.minQuantity, quantity));
      }
    });
    
    // Set default quantities for products not in initialQuantities
    products.forEach(product => {
      if (!map.has(product.id)) {
        map.set(product.id, product.minQuantity);
      }
    });
    
    return map;
  });

  // Get quantity for a specific product
  const getQuantity = useCallback((productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 1;
    return quantities.get(productId) ?? product.minQuantity;
  }, [quantities, products]);

  // Set quantity with validation
  const setQuantity = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Enforce minimum
    let newQty = Math.max(product.minQuantity, quantity);
    
    // Enforce maximum (if set)
    if (product.maxQuantity !== null) {
      newQty = Math.min(product.maxQuantity, newQty);
    }

    // Round to step
    if (product.quantityStep > 1) {
      newQty = Math.round(newQty / product.quantityStep) * product.quantityStep;
    }

    setQuantitiesState(prev => {
      const next = new Map(prev);
      next.set(productId, newQty);
      return next;
    });

    // Handle dependency: if this product affects another
    handleDependency(productId, newQty);
  }, [products]);

  // Handle dependency logic
  const handleDependency = useCallback((changedProductId: string, newQty: number) => {
    const changedProduct = products.find(p => p.id === changedProductId);
    if (!changedProduct?.dependencyType || !changedProduct?.dependencyValue) return;

    // Find products that depend on this one
    const dependentProducts = products.filter(p => 
      p.dependencyProductId === changedProductId
    );

    dependentProducts.forEach(depProduct => {
      if (depProduct.dependencyType === 'camera_to_hardware') {
        // Calculate required hardware: ceil(cameras / value)
        const required = Math.ceil(newQty / (changedProduct.dependencyValue || 8));
        
        // Only auto-increase, don't auto-decrease
        const currentQty = quantities.get(depProduct.id) ?? depProduct.minQuantity;
        if (required > currentQty) {
          setQuantitiesState(prev => {
            const next = new Map(prev);
            next.set(depProduct.id, required);
            return next;
          });
        }
      }
    });
  }, [products, quantities]);

  // Increment quantity
  const incrementQuantity = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const currentQty = getQuantity(productId);
    const newQty = currentQty + product.quantityStep;
    
    if (product.maxQuantity === null || newQty <= product.maxQuantity) {
      setQuantity(productId, newQty);
    }
  }, [products, getQuantity, setQuantity]);

  // Decrement quantity
  const decrementQuantity = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const currentQty = getQuantity(productId);
    const newQty = currentQty - product.quantityStep;
    
    if (newQty >= product.minQuantity) {
      setQuantity(productId, newQty);
    }
  }, [products, getQuantity, setQuantity]);

  // Check if can increment
  const canIncrement = useCallback((productId: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    
    const currentQty = getQuantity(productId);
    return product.maxQuantity === null || currentQty < product.maxQuantity;
  }, [products, getQuantity]);

  // Check if can decrement
  const canDecrement = useCallback((productId: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    
    const currentQty = getQuantity(productId);
    return currentQty > product.minQuantity;
  }, [products, getQuantity]);

  // Calculate price for a single product
  const calculatePrice = useCallback((product: Product): number => {
    const qty = getQuantity(product.id);
    return Number(product.basePrice) * qty;
  }, [getQuantity]);

  // Calculate total price for all products
  const calculateTotalPrice = useCallback((): number => {
    return products.reduce((total, product) => {
      return total + calculatePrice(product);
    }, 0);
  }, [products, calculatePrice]);

  // Get required quantity for a product (based on dependency)
  const getRequiredQuantity = useCallback((productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.dependencyType) return 0;

    // Find the product this depends on
    if (product.dependencyProductId) {
      const parentQty = getQuantity(product.dependencyProductId);
      if (product.dependencyType === 'camera_to_hardware') {
        return Math.ceil(parentQty / (product.dependencyValue || 8));
      }
    }

    return 0;
  }, [products, getQuantity]);

  // Get validation message for a product
  const getValidationMessage = useCallback((product: Product): string | null => {
    const qty = getQuantity(product.id);
    const messages: string[] = [];

    // Check minimum
    if (qty < product.minQuantity) {
      messages.push(`Minimum ${product.minQuantity} required`);
    }

    // Check maximum
    if (product.maxQuantity !== null && qty > product.maxQuantity) {
      messages.push(`Maximum ${product.maxQuantity} allowed`);
    }

    // Dependency message
    if (product.dependencyType === 'camera_to_hardware' && product.dependencyValue) {
      const required = getRequiredQuantity(product.id);
      if (required > 0) {
        messages.push(`${product.dependencyValue} cameras require 1 device`);
      }
    }

    return messages.length > 0 ? messages.join('. ') : null;
  }, [getQuantity, getRequiredQuantity]);

  // Reset all quantities to minimum
  const reset = useCallback(() => {
    setQuantitiesState(() => {
      const map = new Map<string, number>();
      products.forEach(product => {
        map.set(product.id, product.minQuantity);
      });
      return map;
    });
  }, [products]);

  // Auto-sync dependency on quantity change
  useEffect(() => {
    products.forEach(product => {
      if (product.dependencyProductId) {
        handleDependency(product.id, getQuantity(product.id));
      }
    });
  }, [quantities, products, handleDependency, getQuantity]);

  return {
    quantities,
    calculatePrice,
    calculateTotalPrice,
    getRequiredQuantity,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    canIncrement,
    canDecrement,
    getValidationMessage,
    reset,
  };
}

/**
 * Quantity Control Component
 * Reusable UI for quantity selection with validation
 */
interface QuantityControlProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
  formatPrice: (price: number) => string;
  validationMessage?: string | null;
}

export function QuantityControl({
  product,
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
  formatPrice,
  validationMessage,
}: QuantityControlProps) {
  const unitPrice = Number(product.basePrice);
  const totalPrice = unitPrice * quantity;

  return (
    <div className="space-y-2">
      {/* Product Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-medium text-gray-900">{product.name}</span>
          <div className="text-sm text-gray-500">
            {formatPrice(unitPrice)} / unit
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-[#C62828]">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrement}
            disabled={!canDecrement}
            className={`w-10 h-10 rounded-full flex items-center justify-center border text-lg font-medium transition-all ${
              canDecrement
                ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            -
          </button>
          <span className="w-12 text-center font-semibold text-lg">
            {quantity}
          </span>
          <button
            onClick={onIncrement}
            disabled={!canIncrement}
            className={`w-10 h-10 rounded-full flex items-center justify-center border text-lg font-medium transition-all ${
              canIncrement
                ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            +
          </button>
        </div>

        {/* Quantity Step Info */}
        {product.quantityStep > 1 && (
          <span className="text-xs text-gray-400">
            Step: {product.quantityStep}
          </span>
        )}
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
          {validationMessage}
        </div>
      )}

      {/* Min/Max Info */}
      <div className="text-xs text-gray-400 flex justify-between">
        <span>Min: {product.minQuantity}</span>
        {product.maxQuantity && <span>Max: {product.maxQuantity}</span>}
        {product.dependencyType === 'camera_to_hardware' && product.dependencyValue && (
          <span>1 device per {product.dependencyValue} cameras</span>
        )}
      </div>
    </div>
  );
}

export default useProductQuantity;
