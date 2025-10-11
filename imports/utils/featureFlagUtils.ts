/**
 * Utility functions for working with feature flags
 */
import FEATURE_FLAGS from '../config/featureFlags';

/**
 * Toggle a feature flag on or off
 * 
 * @param flagName - The name of the flag to toggle
 * @param value - Optional value to set the flag to. If not provided, the flag will be toggled.
 * @returns The new value of the flag
 */
export const toggleFeatureFlag = (flagName: keyof typeof FEATURE_FLAGS, value?: boolean): boolean => {
  // If we're in development mode, allow toggling feature flags
  if (process.env.NODE_ENV === 'development') {
    // If a value is provided, set the flag to that value
    if (value !== undefined) {
      (FEATURE_FLAGS as any)[flagName] = value;
    } else {
      // Otherwise, toggle the current value
      (FEATURE_FLAGS as any)[flagName] = !(FEATURE_FLAGS as any)[flagName];
    }
    
    // Log the change
    console.log(`Feature flag "${flagName}" is now ${(FEATURE_FLAGS as any)[flagName] ? 'enabled' : 'disabled'}`);
    
    // Return the new value
    return (FEATURE_FLAGS as any)[flagName];
  }
  
  // In production, don't allow toggling
  console.warn('Feature flags cannot be toggled in production');
  return (FEATURE_FLAGS as any)[flagName];
};

/**
 * Check if a feature flag is enabled
 * 
 * @param flagName - The name of the flag to check
 * @returns True if the flag is enabled, false otherwise
 */
export const isFeatureEnabled = (flagName: keyof typeof FEATURE_FLAGS): boolean => {
  return !!(FEATURE_FLAGS as any)[flagName];
};

export default {
  toggleFeatureFlag,
  isFeatureEnabled,
};
