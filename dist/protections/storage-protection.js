"use strict";
/**
 * Storage Quota Fingerprinting Protection
 * Provides comprehensive protection against storage-based fingerprinting techniques
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageProtection = void 0;
class StorageProtection {
    static getLocalStorageProtection() {
        const quotas = JSON.stringify(StorageProtection.normalizedQuotas);
        return `
      // LocalStorage Quota Fingerprinting Protection
      if (typeof Storage !== 'undefined' && typeof localStorage !== 'undefined') {
        const quotas = ${quotas};
        let simulatedUsage = 0;
        
        // Override setItem to simulate quota limits
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
          const storage = this;
          const newSize = (key + value).length * 2; // Rough UTF-16 byte estimation
          
          // Check if adding this item would exceed normalized quota
          if (simulatedUsage + newSize > quotas.localStorage) {
            const error = new Error('Failed to execute setItem on Storage: Setting the value of ' + 
              key + ' exceeded the quota.');
            error.name = 'QuotaExceededError';
            error.code = 22;
            throw error;
          }
          
          try {
            const result = originalSetItem.call(this, key, value);
            simulatedUsage += newSize;
            return result;
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              // Normalize quota exceeded errors
              const normalizedError = new Error('Failed to execute setItem on Storage: Setting the value of ' + 
                key + ' exceeded the quota.');
              normalizedError.name = 'QuotaExceededError';
              normalizedError.code = 22;
              throw normalizedError;
            }
            throw error;
          }
        };
        
        // Override removeItem to update usage tracking
        const originalRemoveItem = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function(key) {
          const existingValue = this.getItem(key);
          if (existingValue) {
            const removedSize = (key + existingValue).length * 2;
            simulatedUsage = Math.max(0, simulatedUsage - removedSize);
          }
          return originalRemoveItem.call(this, key);
        };
        
        // Override clear to reset usage tracking
        const originalClear = Storage.prototype.clear;
        Storage.prototype.clear = function() {
          simulatedUsage = 0;
          return originalClear.call(this);
        };
        
        // Add method to check available space
        if (!Storage.prototype.getRemainingSpace) {
          Storage.prototype.getRemainingSpace = function() {
            return Math.max(0, quotas.localStorage - simulatedUsage);
          };
        }
      }
    `;
    }
    static getIndexedDBProtection() {
        const quotas = JSON.stringify(StorageProtection.normalizedQuotas);
        return `
      // IndexedDB Quota Fingerprinting Protection
      if (typeof indexedDB !== 'undefined') {
        const quotas = ${quotas};
        let simulatedDBUsage = 0;
        
        // Override indexedDB.open to normalize database characteristics
        const originalOpen = indexedDB.open;
        indexedDB.open = function(name, version) {
          const request = originalOpen.call(this, name, version);
          
          // Normalize success handler to mask database characteristics
          const originalOnSuccess = request.onsuccess;
          request.onsuccess = function(event) {
            const db = event.target.result;
            
            if (db) {
              // Override database methods to enforce quota limits
              const originalTransaction = db.transaction;
              db.transaction = function(storeNames, mode) {
                const transaction = originalTransaction.call(this, storeNames, mode);
                
                // Override objectStore to add quota checking
                const originalObjectStore = transaction.objectStore;
                transaction.objectStore = function(name) {
                  const store = originalObjectStore.call(this, name);
                  
                  // Override add/put methods for quota enforcement
                  const originalAdd = store.add;
                  const originalPut = store.put;
                  
                  store.add = function(value, key) {
                    const estimatedSize = JSON.stringify(value).length + 
                      (key ? JSON.stringify(key).length : 0);
                    
                    if (simulatedDBUsage + estimatedSize > quotas.indexedDB) {
                      const request = { 
                        error: { name: 'QuotaExceededError', message: 'The quota has been exceeded.' },
                        onerror: null,
                        onsuccess: null
                      };
                      setTimeout(() => {
                        if (request.onerror) {
                          request.onerror({ target: request });
                        }
                      }, 0);
                      return request;
                    }
                    
                    const request = originalAdd.call(this, value, key);
                    const originalOnSuccess = request.onsuccess;
                    request.onsuccess = function(event) {
                      simulatedDBUsage += estimatedSize;
                      if (originalOnSuccess) {
                        originalOnSuccess.call(this, event);
                      }
                    };
                    
                    return request;
                  };
                  
                  store.put = function(value, key) {
                    const estimatedSize = JSON.stringify(value).length + 
                      (key ? JSON.stringify(key).length : 0);
                    
                    if (simulatedDBUsage + estimatedSize > quotas.indexedDB) {
                      const request = { 
                        error: { name: 'QuotaExceededError', message: 'The quota has been exceeded.' },
                        onerror: null,
                        onsuccess: null
                      };
                      setTimeout(() => {
                        if (request.onerror) {
                          request.onerror({ target: request });
                        }
                      }, 0);
                      return request;
                    }
                    
                    const request = originalPut.call(this, value, key);
                    const originalOnSuccess = request.onsuccess;
                    request.onsuccess = function(event) {
                      simulatedDBUsage += estimatedSize;
                      if (originalOnSuccess) {
                        originalOnSuccess.call(this, event);
                      }
                    };
                    
                    return request;
                  };
                  
                  return store;
                };
                
                return transaction;
              };
              
              // Normalize version to prevent fingerprinting
              Object.defineProperty(db, 'version', {
                get: () => version || 1,
                configurable: true
              });
            }
            
            if (originalOnSuccess) {
              return originalOnSuccess.call(this, event);
            }
          };
          
          return request;
        };
        
        // Override deleteDatabase to normalize behavior
        const originalDeleteDatabase = indexedDB.deleteDatabase;
        indexedDB.deleteDatabase = function(name) {
          simulatedDBUsage = 0; // Reset usage when database is deleted
          return originalDeleteDatabase.call(this, name);
        };
      }
    `;
    }
    static getStorageEstimateProtection() {
        const quotas = JSON.stringify(StorageProtection.normalizedQuotas);
        return `
      // Storage Estimate API Protection
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const quotas = ${quotas};
        
        const originalEstimate = navigator.storage.estimate;
        navigator.storage.estimate = async function() {
          try {
            const realEstimate = await originalEstimate.call(this);
            
            // Return normalized storage estimates
            return {
              quota: quotas.total,
              usage: Math.min(realEstimate.usage || 0, quotas.total * 0.8), // Max 80% usage
              usageDetails: {
                indexedDB: Math.min(realEstimate.usageDetails?.indexedDB || 0, quotas.indexedDB),
                caches: Math.min(realEstimate.usageDetails?.caches || 0, quotas.cache),
                serviceWorkerRegistrations: Math.min(realEstimate.usageDetails?.serviceWorkerRegistrations || 0, 1024 * 1024)
              }
            };
          } catch (error) {
            // Return fallback normalized estimate
            return {
              quota: quotas.total,
              usage: quotas.total * 0.1, // 10% usage fallback
              usageDetails: {
                indexedDB: quotas.indexedDB * 0.1,
                caches: quotas.cache * 0.1,
                serviceWorkerRegistrations: 0
              }
            };
          }
        };
        
        // Override persist method to normalize persistent storage behavior
        if (navigator.storage.persist) {
          const originalPersist = navigator.storage.persist;
          navigator.storage.persist = async function() {
            try {
              const result = await originalPersist.call(this);
              // Always return false for consistency (don't reveal persistent storage capability)
              return false;
            } catch (error) {
              return false;
            }
          };
        }
        
        // Override persisted method
        if (navigator.storage.persisted) {
          const originalPersisted = navigator.storage.persisted;
          navigator.storage.persisted = async function() {
            try {
              await originalPersisted.call(this);
              // Always return false for consistency
              return false;
            } catch (error) {
              return false;
            }
          };
        }
      }
    `;
    }
    static getCacheStorageProtection() {
        const quotas = JSON.stringify(StorageProtection.normalizedQuotas);
        return `
      // Cache Storage Quota Protection
      if (typeof caches !== 'undefined') {
        const quotas = ${quotas};
        let simulatedCacheUsage = 0;
        
        // Override caches.open to add quota enforcement
        const originalOpen = caches.open;
        caches.open = async function(cacheName) {
          const cache = await originalOpen.call(this, cacheName);
          
          // Override cache.put to enforce quotas
          const originalPut = cache.put;
          cache.put = async function(request, response) {
            // Estimate response size
            const responseClone = response.clone();
            const responseText = await responseClone.text();
            const estimatedSize = responseText.length + (request.url ? request.url.length : 0);
            
            if (simulatedCacheUsage + estimatedSize > quotas.cache) {
              throw new DOMException('Quota exceeded', 'QuotaExceededError');
            }
            
            const result = await originalPut.call(this, request, response);
            simulatedCacheUsage += estimatedSize;
            return result;
          };
          
          // Override cache.add and addAll
          const originalAdd = cache.add;
          cache.add = async function(request) {
            const estimatedSize = request.url ? request.url.length : 1024; // Conservative estimate
            
            if (simulatedCacheUsage + estimatedSize > quotas.cache) {
              throw new DOMException('Quota exceeded', 'QuotaExceededError');
            }
            
            const result = await originalAdd.call(this, request);
            simulatedCacheUsage += estimatedSize;
            return result;
          };
          
          const originalAddAll = cache.addAll;
          cache.addAll = async function(requests) {
            const estimatedSize = requests.reduce((total, req) => 
              total + (req.url ? req.url.length : 1024), 0);
            
            if (simulatedCacheUsage + estimatedSize > quotas.cache) {
              throw new DOMException('Quota exceeded', 'QuotaExceededError');
            }
            
            const result = await originalAddAll.call(this, requests);
            simulatedCacheUsage += estimatedSize;
            return result;
          };
          
          // Override cache.delete to update usage tracking
          const originalDelete = cache.delete;
          cache.delete = async function(request, options) {
            const result = await originalDelete.call(this, request, options);
            if (result) {
              // Rough estimation of freed space
              const freedSize = request.url ? request.url.length : 1024;
              simulatedCacheUsage = Math.max(0, simulatedCacheUsage - freedSize);
            }
            return result;
          };
          
          return cache;
        };
        
        // Override caches.delete to reset usage tracking
        const originalDelete = caches.delete;
        caches.delete = async function(cacheName) {
          const result = await originalDelete.call(this, cacheName);
          if (result) {
            simulatedCacheUsage = Math.max(0, simulatedCacheUsage * 0.8); // Estimate cache removal
          }
          return result;
        };
      }
    `;
    }
    static getWebSQLProtection() {
        return `
      // WebSQL Quota Protection (Legacy)
      if (typeof openDatabase !== 'undefined') {
        const originalOpenDatabase = openDatabase;
        
        openDatabase = function(name, version, displayName, estimatedSize, creationCallback) {
          // Normalize database size limits
          const normalizedSize = Math.min(estimatedSize, 5 * 1024 * 1024); // Max 5MB
          
          try {
            return originalOpenDatabase.call(this, name, version, displayName, normalizedSize, creationCallback);
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              // Normalize quota error
              const normalizedError = new Error('Database quota exceeded');
              normalizedError.name = 'QuotaExceededError';
              normalizedError.code = 22;
              throw normalizedError;
            }
            throw error;
          }
        };
      }
    `;
    }
    static getAllStorageProtections() {
        return `
      ${this.getLocalStorageProtection()}
      ${this.getIndexedDBProtection()}
      ${this.getStorageEstimateProtection()}
      ${this.getCacheStorageProtection()}
      ${this.getWebSQLProtection()}
    `;
    }
}
exports.StorageProtection = StorageProtection;
StorageProtection.normalizedQuotas = {
    localStorage: 10 * 1024 * 1024, // 10MB
    sessionStorage: 10 * 1024 * 1024, // 10MB
    indexedDB: 50 * 1024 * 1024, // 50MB
    webSQL: 5 * 1024 * 1024, // 5MB (legacy)
    cache: 50 * 1024 * 1024, // 50MB
    total: 100 * 1024 * 1024 // 100MB total
};
//# sourceMappingURL=storage-protection.js.map