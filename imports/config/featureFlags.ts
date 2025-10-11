/**
 * Feature flags configuration
 * 
 * This file contains feature flags that control the visibility and behavior
 * of various features throughout the application.
 * 
 * To disable a feature, set its value to false.
 * To enable a feature, set its value to true.
 */

export const FEATURE_FLAGS = {
  // Controls whether the All Questions page is visible
  // When false, a 404 page will be shown instead
  SHOW_ALL_QUESTIONS: false,
  
  // Add other feature flags here as needed
};

export default FEATURE_FLAGS;
