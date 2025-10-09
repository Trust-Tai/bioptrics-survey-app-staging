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
        if (typeof url === 'string') {
          let newUrl = url;
          let shouldRedirect = false;
          
          // Handle various localhost patterns
          if (url.includes('localhost/__meteor__/dynamic-import')) {
            newUrl = url.replace('http://localhost/__meteor__/dynamic-import', currentOrigin + '/__meteor__/dynamic-import');
            shouldRedirect = true;
          } else if (url.includes('127.0.0.1/__meteor__/dynamic-import')) {
            newUrl = url.replace('http://127.0.0.1/__meteor__/dynamic-import', currentOrigin + '/__meteor__/dynamic-import');
            shouldRedirect = true;
          } else if (url.includes('/__meteor__/dynamic-import') && !url.startsWith(currentOrigin)) {
            // Handle any other dynamic import URLs that don't match current origin
            const dynamicImportPath = url.substring(url.indexOf('/__meteor__/dynamic-import'));
            newUrl = currentOrigin + dynamicImportPath;
            shouldRedirect = true;
          }
          
          if (shouldRedirect) {
            console.log(`[dynamicImportFix] Redirecting fetch from ${url} to ${newUrl}`);
            return originalFetch.call(this, newUrl, options);
          }
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
            
            // If we get a fetch error, try to retry with corrected URL
            if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
              console.log(`[dynamicImportFix] Attempting retry for ${moduleId} with corrected URL...`);
              
              // Try to construct the correct URL manually
              const correctedUrl = `${currentOrigin}/__meteor__/dynamic-import/${moduleId}`;
              console.log(`[dynamicImportFix] Retry URL: ${correctedUrl}`);
              
              return fetch(correctedUrl)
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                  }
                  return response.text();
                })
                .then(code => {
                  // Execute the module code
                  const module = { exports: {} };
                  const func = new Function('module', 'exports', 'require', code);
                  func(module, module.exports, require);
                  return module.exports;
                })
                .catch(retryError => {
                  console.error(`[dynamicImportFix] Retry also failed for ${moduleId}:`, retryError);
                  console.error('[dynamicImportFix] Current origin:', currentOrigin);
                  console.error('[dynamicImportFix] Current DYNAMIC_IMPORT_ROOT:', window.__meteor_runtime_config__.DYNAMIC_IMPORT_ROOT);
                  throw retryError;
                });
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

    // 5. Patch React.lazy to handle dynamic import failures
    if (window.React && window.React.lazy) {
      const originalLazy = window.React.lazy;
      
      window.React.lazy = function(importFunction) {
        return originalLazy(() => {
          return importFunction().catch(error => {
            console.error('[dynamicImportFix] React.lazy import failed:', error);
            
            if (error.message && error.message.includes('Failed to fetch')) {
              console.log('[dynamicImportFix] Attempting to retry React.lazy import...');
              
              // Wait a bit and retry
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  importFunction()
                    .then(resolve)
                    .catch(retryError => {
                      console.error('[dynamicImportFix] React.lazy retry failed:', retryError);
                      reject(retryError);
                    });
                }, 1000);
              });
            }
            
            throw error;
          });
        });
      };
      
      console.log('[dynamicImportFix] Successfully patched React.lazy');
    }

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
    
    // Apply React.lazy fix after a delay to ensure React is loaded
    setTimeout(() => {
      if (window.React && window.React.lazy && !window.React.lazy._patched) {
        const originalLazy = window.React.lazy;
        
        window.React.lazy = function(importFunction) {
          return originalLazy(() => {
            return importFunction().catch(error => {
              console.error('[dynamicImportFix] React.lazy import failed (delayed patch):', error);
              
              if (error.message && error.message.includes('Failed to fetch')) {
                console.log('[dynamicImportFix] Attempting to retry React.lazy import (delayed patch)...');
                
                // Wait a bit and retry
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    importFunction()
                      .then(resolve)
                      .catch(retryError => {
                        console.error('[dynamicImportFix] React.lazy retry failed (delayed patch):', retryError);
                        reject(retryError);
                      });
                  }, 1000);
                });
              }
              
              throw error;
            });
          });
        };
        
        window.React.lazy._patched = true;
        console.log('[dynamicImportFix] Successfully applied delayed React.lazy patch');
      }
    }, 2000);
    
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
