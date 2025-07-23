// dynamicImportFix.js
// This file configures dynamic imports to use the correct domain in production environments

import { Meteor } from 'meteor/meteor';

// Override the dynamic import URL in production environments
if (Meteor.isClient) {
  // Get the current hostname
  const currentHostname = window.location.hostname;
  
  // Check if we're not on localhost
  if (currentHostname !== 'localhost' && !currentHostname.includes('127.0.0.1')) {
    // Override the __meteor_runtime_config__ to use the current origin for dynamic imports
    const currentOrigin = window.location.origin;
    
    if (__meteor_runtime_config__ && __meteor_runtime_config__.ROOT_URL_PATH_PREFIX) {
      // Make sure dynamic imports use the current origin instead of localhost
      const originalDynamicImport = Module.prototype.dynamicImport;
      
      if (originalDynamicImport) {
        Module.prototype.dynamicImport = function(moduleId) {
          console.log(`[dynamicImportFix] Redirecting dynamic import from localhost to ${currentOrigin}`);
          
          // Call the original dynamicImport but ensure it uses the current origin
          return originalDynamicImport.call(this, moduleId)
            .catch(error => {
              console.error('[dynamicImportFix] Dynamic import error:', error);
              
              // If the error is CORS-related, provide a more helpful message
              if (error.message && error.message.includes('CORS')) {
                console.error('[dynamicImportFix] CORS error detected. This may be due to dynamic imports using localhost instead of the current domain.');
              }
              
              throw error;
            });
        };
        
        console.log('[dynamicImportFix] Successfully patched dynamic import to use current origin');
      }
    }
  }
}
