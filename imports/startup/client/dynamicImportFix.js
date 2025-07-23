// dynamicImportFix.js
// This file configures dynamic imports to use the correct domain in production environments

import { Meteor } from 'meteor/meteor';

// Function to apply the dynamic import fix
function applyDynamicImportFix() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Get the current hostname and origin
  const currentHostname = window.location.hostname;
  const currentOrigin = window.location.origin;
  
  // Only apply fix in production/staging (non-localhost) environments
  if (currentHostname === 'localhost' || currentHostname.includes('127.0.0.1')) {
    console.log('[dynamicImportFix] Running on localhost, no fixes needed');
    return;
  }

  console.log(`[dynamicImportFix] Running on ${currentHostname}, applying dynamic import fix...`);
  
  try {
    // 1. Patch the Meteor runtime configuration
    if (window.__meteor_runtime_config__) {
      // Update ROOT_URL
      const originalRootUrl = window.__meteor_runtime_config__.ROOT_URL;
      window.__meteor_runtime_config__.ROOT_URL = currentOrigin;
      console.log(`[dynamicImportFix] Updated ROOT_URL from ${originalRootUrl} to ${currentOrigin}`);
      
      // Update DYNAMIC_IMPORT_ROOT
      window.__meteor_runtime_config__.DYNAMIC_IMPORT_ROOT = currentOrigin + '/__meteor__/dynamic-import/';
      console.log(`[dynamicImportFix] Set DYNAMIC_IMPORT_ROOT to ${window.__meteor_runtime_config__.DYNAMIC_IMPORT_ROOT}`);
    }

    // 2. Patch the global fetch function to intercept dynamic import requests
    if (window.fetch) {
      const originalFetch = window.fetch;
      
      window.fetch = function(url, options) {
        // Check if this is a dynamic import request
        if (typeof url === 'string' && url.includes('localhost/__meteor__/dynamic-import')) {
          // Replace localhost with the current origin
          const newUrl = url.replace('http://localhost/__meteor__/dynamic-import', currentOrigin + '/__meteor__/dynamic-import');
          console.log(`[dynamicImportFix] Redirecting fetch from ${url} to ${newUrl}`);
          return originalFetch.call(this, newUrl, options);
        }
        
        // Otherwise, proceed with the original fetch
        return originalFetch.apply(this, arguments);
      };
      
      console.log('[dynamicImportFix] Successfully patched window.fetch');
    }
    
    // 3. Patch Module.prototype.dynamicImport if available
    if (window.Module && window.Module.prototype.dynamicImport) {
      const originalDynamicImport = window.Module.prototype.dynamicImport;
      
      window.Module.prototype.dynamicImport = function(moduleId) {
        console.log(`[dynamicImportFix] Intercepting dynamic import for: ${moduleId}`);
        return originalDynamicImport.call(this, moduleId)
          .catch(error => {
            console.error(`[dynamicImportFix] Error importing ${moduleId}:`, error);
            // If we still get CORS errors, provide helpful debug info
            if (error.message && error.message.includes('CORS')) {
              console.error('[dynamicImportFix] CORS error detected. Check network tab for request details.');
              console.error('[dynamicImportFix] Current origin:', currentOrigin);
              console.error('[dynamicImportFix] Current DYNAMIC_IMPORT_ROOT:', window.__meteor_runtime_config__.DYNAMIC_IMPORT_ROOT);
            }
            throw error;
          });
      };
      
      console.log('[dynamicImportFix] Successfully patched Module.prototype.dynamicImport');
    }

    // 4. Define a global helper function to manually fix URLs if needed
    window.fixDynamicImportUrl = function(url) {
      if (url.includes('localhost/__meteor__/dynamic-import')) {
        return url.replace('http://localhost/__meteor__/dynamic-import', currentOrigin + '/__meteor__/dynamic-import');
      }
      return url;
    };

    console.log('[dynamicImportFix] All patches applied successfully');
  } catch (error) {
    console.error('[dynamicImportFix] Error applying fixes:', error);
  }
}

// Apply fix immediately to catch early dynamic imports
applyDynamicImportFix();

// Also apply during Meteor startup to ensure it catches all cases
if (Meteor.isClient) {
  Meteor.startup(() => {
    // Re-apply the fix to ensure it's active after all Meteor initialization
    applyDynamicImportFix();
    
    // Add a MutationObserver to detect any dynamic script insertions
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
              if (node.tagName === 'SCRIPT' && node.src && node.src.includes('localhost')) {
                console.log(`[dynamicImportFix] Detected script with localhost URL: ${node.src}`);
                const newSrc = node.src.replace('http://localhost', window.location.origin);
                console.log(`[dynamicImportFix] Updating script src to: ${newSrc}`);
                node.src = newSrc;
              }
            }
          }
        }
      });
      
      // Start observing the document with the configured parameters
      observer.observe(document, { childList: true, subtree: true });
      console.log('[dynamicImportFix] MutationObserver started to catch dynamic script insertions');
    }
  });
}
