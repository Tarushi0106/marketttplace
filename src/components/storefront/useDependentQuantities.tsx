import { useState, useEffect, useCallback } from 'react';

interface DependentQuantityConfig {
  cameraId: string;
  gatewayId: string;
  camerasPerGateway: number; // Default 8
  minCameras: number; // Default 2
  minGateways: number; // Default 1
}

interface QuantityState {
  cameras: number;
  gateways: number;
}

interface UseDependentQuantitiesReturn {
  quantities: QuantityState;
  requiredGateways: number;
  canDecreaseCameras: boolean;
  canDecreaseGateways: boolean;
  updateCameras: (qty: number) => void;
  updateGateways: (qty: number) => void;
  message: string;
}

/**
 * Hook for managing dependent quantities between products
 * Example: Cloud Cameras and Cloud Gateway
 * - Cameras min: 2, default: 2
 * - Gateways min: 1, default: 1
 * - Dependency: 1 gateway per 8 cameras (ceil)
 */
export function useDependentQuantities(
  config: DependentQuantityConfig
): UseDependentQuantitiesReturn {
  const {
    cameraId,
    gatewayId,
    camerasPerGateway = 8,
    minCameras = 2,
    minGateways = 1,
  } = config;

  // State for quantities
  const [quantities, setQuantities] = useState<QuantityState>({
    cameras: minCameras,
    gateways: minGateways,
  });

  // Calculate required gateways based on cameras
  const requiredGateways = Math.ceil(quantities.cameras / camerasPerGateway);

  // Message to show in UI
  const message = `${camerasPerGateway} camera${camerasPerGateway > 1 ? 's' : ''} require${camerasPerGateway === 1 ? 's' : ''} 1 device`;

  // Check if cameras can be decreased
  const canDecreaseCameras = quantities.cameras > minCameras;

  // Check if gateways can be decreased (not below required)
  const canDecreaseGateways = quantities.gateways > Math.max(requiredGateways, minGateways);

  // Update cameras quantity
  const updateCameras = useCallback((newQty: number) => {
    // Enforce minimum
    const clampedQty = Math.max(minCameras, newQty);
    
    setQuantities(prev => {
      const newCameras = clampedQty;
      // Auto-calculate required gateways
      const newRequiredGateways = Math.ceil(newCameras / camerasPerGateway);
      
      return {
        cameras: newCameras,
        // Only increase gateways if needed, don't decrease automatically
        gateways: Math.max(prev.gateways, newRequiredGateways),
      };
    });
  }, [minCameras, camerasPerGateway]);

  // Update gateways quantity
  const updateGateways = useCallback((newQty: number) => {
    // Enforce minimum (either required or configured min)
    const minAllowed = Math.max(requiredGateways, minGateways);
    const clampedQty = Math.max(minAllowed, newQty);
    
    setQuantities(prev => ({
      ...prev,
      gateways: clampedQty,
    }));
  }, [requiredGateways, minGateways]);

  // Sync when cameras change - ensure gateways meet requirement
  useEffect(() => {
    if (quantities.gateways < requiredGateways) {
      setQuantities(prev => ({
        ...prev,
        gateways: requiredGateways,
      }));
    }
  }, [requiredGateways, quantities.gateways]);

  return {
    quantities,
    requiredGateways,
    canDecreaseCameras,
    canDecreaseGateways,
    updateCameras,
    updateGateways,
    message,
  };
}

/**
 * Component that displays dependent quantity controls
 * Use this in your product configurator
 */
interface DependentQuantityControlsProps {
  cameraName: string;
  gatewayName: string;
  cameraPrice?: number;
  gatewayPrice?: number;
  formatPrice: (price: number) => string;
  onCameraChange: (qty: number) => void;
  onGatewayChange: (qty: number) => void;
  cameraQty: number;
  gatewayQty: number;
  canDecreaseCameras: boolean;
  canDecreaseGateways: boolean;
  requiredGateways: number;
  message: string;
}

export function DependentQuantityControls({
  cameraName,
  gatewayName,
  cameraPrice = 0,
  gatewayPrice = 0,
  formatPrice,
  onCameraChange,
  onGatewayChange,
  cameraQty,
  gatewayQty,
  canDecreaseCameras,
  canDecreaseGateways,
  requiredGateways,
  message,
}: DependentQuantityControlsProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Dependency Message */}
      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded text-center">
        {message}
      </div>

      {/* Cameras Row */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-gray-900">{cameraName}</span>
          {cameraPrice > 0 && (
            <span className="ml-2 text-[#1E2260]">+{formatPrice(cameraPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCameraChange(cameraQty - 1)}
            disabled={!canDecreaseCameras}
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              canDecreaseCameras
                ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-600'
                : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            -
          </button>
          <span className="w-8 text-center font-medium">{cameraQty}</span>
          <button
            onClick={() => onCameraChange(cameraQty + 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 text-gray-600"
          >
            +
          </button>
        </div>
      </div>

      {/* Gateways Row */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-gray-900">{gatewayName}</span>
          {gatewayPrice > 0 && (
            <span className="ml-2 text-[#1E2260]">+{formatPrice(gatewayPrice)}</span>
          )}
          {gatewayQty > requiredGateways && (
            <span className="ml-2 text-xs text-orange-600">
              (Min required: {requiredGateways})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGatewayChange(gatewayQty - 1)}
            disabled={!canDecreaseGateways}
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              canDecreaseGateways
                ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-600'
                : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            -
          </button>
          <span className="w-8 text-center font-medium">{gatewayQty}</span>
          <button
            onClick={() => onGatewayChange(gatewayQty + 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 text-gray-600"
          >
            +
          </button>
        </div>
      </div>

      {/* Warning if gateway below required */}
      {!canDecreaseGateways && gatewayQty === requiredGateways && (
        <div className="text-xs text-orange-600 text-center">
          Minimum {requiredGateways} device{requiredGateways > 1 ? 's' : ''} required for {cameraQty} camera{cameraQty > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default useDependentQuantities;
