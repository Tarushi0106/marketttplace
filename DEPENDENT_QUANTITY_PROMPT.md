# AI Prompt: Implement Dependent Quantity Logic for VSAAS

## Context
We have a VSAAS (Video Surveillance as a Service) product configurator that needs dependent quantity logic between two variants:
- **Connect Cloud** (cameras) - Platform fee variant
- **Cloud Gateway** (hardware) - Hardware device variant

## Current State
The database already has:
- Connect Cloud variant: minQuantity = 2, price = 248.4
- Cloud Gateway variant: minQuantity = 1, price = 5796

## Requirements
1. Connect Cloud must always have minimum quantity of 2 (when user selects this variant)
2. Cloud Gateway must always have minimum quantity of 1 (when user selects this variant)
3. **Auto-calculation rule**: If Connect Cloud quantity > 8, Cloud Gateway quantity must automatically become 2 (because 8 cameras require 1 hardware unit)

## Implementation Guidance

The logic should be added to the VSAASConfigurator component in `src/components/storefront/VSAASConfigurator.tsx`. Here's the approach:

### Option 1: Use existing useDependentQuantities hook
The hook already exists at `src/components/storefront/useDependentQuantities.tsx` with the exact logic needed:
- `minCameras = 2` (default)
- `minGateways = 1` (default)
- `camerasPerGateway = 8` (default)
- Auto-calculates: `requiredGateways = Math.ceil(cameras / camerasPerGateway)`

### Option 2: Add inline logic
Add state management for both quantities and use useEffect to auto-update when threshold is crossed.

### Key Points
- The configurator should show both Connect Cloud and Cloud Gateway selection together
- When user increases Connect Cloud quantity past 8, automatically increase Cloud Gateway to 2
- Display a message explaining the dependency: "8 cameras require 1 Cloud Gateway"

## Files to Modify
1. `src/components/storefront/VSAASConfigurator.tsx` - Main configurator
2. Or create a new component that manages both selections with the dependency

## Example Logic
```typescript
// When connectCloudQuantity > 8, set gatewayQuantity to 2
const requiredGateways = Math.ceil(connectCloudQuantity / 8);
if (requiredGateways > gatewayQuantity) {
  setGatewayQuantity(requiredGateways);
}
```
