"use strict";
/**
 * Enhanced Navigator Object Protection
 * Comprehensive protection and normalization of navigator properties
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedNavigatorProtection = void 0;
class EnhancedNavigatorProtection {
    // Comprehensive Navigator Object Protection
    static getNavigatorProtection() {
        return `
      // Enhanced Navigator Object Protection
      if (typeof navigator !== 'undefined') {
        
        // Remove all automation-related properties
        const automationProperties = [
          'webdriver',
          '__driver_evaluate',
          '__webdriver_evaluate',
          '__selenium_evaluate',
          '__fxdriver_evaluate',
          '__driver_unwrapped',
          '__webdriver_unwrapped',
          '__selenium_unwrapped',
          '__fxdriver_unwrapped',
          '_phantom',
          '__phantom',
          'callPhantom',
          '_selenium',
          'webdriver-evaluate',
          'selenium-evaluate',
          'webdriverCommand',
          'webdriver-evaluate-response',
          '__webdriverFunc',
          '__webdriver_script_fn',
          '__$webdriverAsyncExecutor',
          'domAutomation',
          'domAutomationController',
          '__lastWatirAlert',
          '__lastWatirConfirm',
          '__lastWatirPrompt',
          'geb',
          '__nightmare',
          '_Selenium_IDE_Recorder'
        ];
        
        // Delete automation properties
        automationProperties.forEach(prop => {
          try {
            delete navigator[prop];
          } catch (e) {}
        });
        
        // Override webdriver property specifically
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
          configurable: true,
          enumerable: false
        });
        
        // Enhanced permissions property
        if (navigator.permissions && navigator.permissions.query) {
          const originalQuery = navigator.permissions.query;
          navigator.permissions.query = function(parameters) {
            // Normalize permission responses to avoid fingerprinting
            const normalizedPermissions = {
              'geolocation': 'prompt',
              'notifications': 'default', 
              'push': 'default',
              'midi': 'default',
              'camera': 'prompt',
              'microphone': 'prompt',
              'background-fetch': 'default',
              'background-sync': 'default',
              'bluetooth': 'default',
              'persistent-storage': 'default',
              'ambient-light-sensor': 'default',
              'accelerometer': 'default',
              'gyroscope': 'default',
              'magnetometer': 'default',
              'clipboard-read': 'default',
              'clipboard-write': 'default'
            };
            
            return originalQuery.call(this, parameters).then(result => {
              const permissionName = parameters.name || parameters;
              if (normalizedPermissions[permissionName]) {
                return {
                  ...result,
                  state: normalizedPermissions[permissionName]
                };
              }
              return result;
            });
          };
        }
        
        // Enhanced plugins property
        Object.defineProperty(navigator, 'plugins', {
          get: function() {
            // Return realistic plugin list
            const plugins = [];
            
            // Add Chrome PDF Plugin (standard)
            plugins.push({
              0: {
                type: "application/pdf",
                suffixes: "pdf",
                description: "Portable Document Format",
                enabledPlugin: plugins[0]
              },
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              length: 1,
              name: "Chrome PDF Plugin"
            });
            
            // Add Chrome PDF Viewer (standard)
            plugins.push({
              0: {
                type: "application/pdf", 
                suffixes: "pdf",
                description: "Portable Document Format",
                enabledPlugin: plugins[1]
              },
              description: "Portable Document Format",
              filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
              length: 1,
              name: "Chrome PDF Viewer"
            });
            
            plugins.length = 2;
            
            // Add array methods
            plugins.item = function(index) { return this[index] || null; };
            plugins.namedItem = function(name) { 
              for (let i = 0; i < this.length; i++) {
                if (this[i].name === name) return this[i];
              }
              return null;
            };
            plugins.refresh = function() {};
            
            return plugins;
          },
          configurable: true
        });
        
        // Enhanced mimeTypes property
        Object.defineProperty(navigator, 'mimeTypes', {
          get: function() {
            const mimeTypes = [];
            
            // Add PDF MIME type
            mimeTypes.push({
              type: "application/pdf",
              suffixes: "pdf", 
              description: "Portable Document Format",
              enabledPlugin: navigator.plugins[0]
            });
            
            mimeTypes.length = 1;
            mimeTypes['application/pdf'] = mimeTypes[0];
            
            // Add array methods
            mimeTypes.item = function(index) { return this[index] || null; };
            mimeTypes.namedItem = function(name) { return this[name] || null; };
            
            return mimeTypes;
          },
          configurable: true
        });
        
        // Override connection property for consistency
        if (navigator.connection) {
          const connection = {
            downlink: 10,
            effectiveType: '4g',
            onchange: null,
            rtt: 50,
            saveData: false,
            type: 'wifi'
          };
          
          Object.defineProperty(navigator, 'connection', {
            get: () => connection,
            configurable: true
          });
        }
        
        // Override getBattery for consistency
        if (navigator.getBattery) {
          navigator.getBattery = function() {
            return Promise.resolve({
              charging: true,
              chargingTime: 0,
              dischargingTime: Infinity,
              level: 1.0,
              addEventListener: function() {},
              removeEventListener: function() {},
              dispatchEvent: function() { return true; }
            });
          };
        }
        
        // Override getGamepads for consistency
        if (navigator.getGamepads) {
          navigator.getGamepads = function() {
            return [null, null, null, null]; // No gamepads
          };
        }
        
        // Override mediaDevices for privacy
        if (navigator.mediaDevices) {
          const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
          navigator.mediaDevices.enumerateDevices = function() {
            return Promise.resolve([
              {
                deviceId: 'default',
                groupId: 'default-group',
                kind: 'audioinput',
                label: ''
              },
              {
                deviceId: 'default',
                groupId: 'default-group', 
                kind: 'audiooutput',
                label: ''
              }
            ]);
          };
        }
        
        // Override storage properties for consistency
        if (navigator.storage && navigator.storage.estimate) {
          navigator.storage.estimate = function() {
            return Promise.resolve({
              quota: 120000000000, // 120GB
              usage: 1000000000,   // 1GB
              usageDetails: {
                indexedDB: 500000000,
                serviceWorkerRegistrations: 0,
                caches: 500000000
              }
            });
          };
        }
        
        // Override clipboard for consistency
        if (navigator.clipboard) {
          const originalRead = navigator.clipboard.read;
          const originalReadText = navigator.clipboard.readText;
          
          navigator.clipboard.read = function() {
            return Promise.reject(new DOMException('Read access denied', 'NotAllowedError'));
          };
          
          navigator.clipboard.readText = function() {
            return Promise.reject(new DOMException('Read access denied', 'NotAllowedError'));
          };
        }
        
        // Override serviceWorker for consistency  
        if (navigator.serviceWorker) {
          const originalRegister = navigator.serviceWorker.register;
          navigator.serviceWorker.register = function(scriptURL, options) {
            // Allow normal service worker registration but normalize behavior
            return originalRegister.call(this, scriptURL, options);
          };
        }
        
        // Hide vendor-specific properties
        const vendorProperties = [
          'mozGetUserMedia',
          'webkitGetUserMedia', 
          'mozRTCPeerConnection',
          'webkitRTCPeerConnection',
          'mozRTCSessionDescription',
          'webkitRTCSessionDescription',
          'mozGetBattery',
          'webkitGetBattery',
          'mozVibrate',
          'webkitVibrate',
          'mozConnection',
          'webkitConnection'
        ];
        
        vendorProperties.forEach(prop => {
          try {
            delete navigator[prop];
          } catch (e) {}
        });
        
        // Ensure consistent property descriptors
        const navigatorProps = [
          'appCodeName', 'appName', 'appVersion', 'platform', 'product',
          'userAgent', 'vendor', 'vendorSub', 'cookieEnabled', 'onLine',
          'language', 'languages', 'hardwareConcurrency', 'deviceMemory',
          'maxTouchPoints', 'pdfViewerEnabled'
        ];
        
        navigatorProps.forEach(prop => {
          const descriptor = Object.getOwnPropertyDescriptor(navigator, prop);
          if (descriptor && !descriptor.configurable) {
            try {
              Object.defineProperty(navigator, prop, {
                ...descriptor,
                configurable: true
              });
            } catch (e) {}
          }
        });
      }
    `;
    }
    // Enhanced Property Descriptor Protection
    static getPropertyDescriptorProtection() {
        return `
      // Enhanced Property Descriptor Protection
      const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      const originalDefineProperty = Object.defineProperty;
      const originalGetPrototypeOf = Object.getPrototypeOf;
      
      // Override Object.getOwnPropertyDescriptor to hide automation traces
      Object.getOwnPropertyDescriptor = function(obj, prop) {
        const descriptor = originalGetOwnPropertyDescriptor.call(this, obj, prop);
        
        // Hide automation-related property descriptors
        if (obj === navigator || obj === window) {
          const automationProps = [
            'webdriver', '__driver_evaluate', '__webdriver_evaluate',
            '__selenium_evaluate', '__fxdriver_evaluate', '_phantom',
            '__phantom', 'callPhantom', '_selenium', 'geb', '__nightmare'
          ];
          
          if (automationProps.includes(prop)) {
            return undefined; // Property doesn't exist
          }
        }
        
        // Normalize descriptor properties for consistency
        if (descriptor) {
          return {
            value: descriptor.value,
            writable: descriptor.writable !== false,
            enumerable: descriptor.enumerable !== false,
            configurable: descriptor.configurable !== false,
            get: descriptor.get,
            set: descriptor.set
          };
        }
        
        return descriptor;
      };
      
      // Override Object.getPrototypeOf to hide automation traces
      Object.getPrototypeOf = function(obj) {
        const proto = originalGetPrototypeOf.call(this, obj);
        
        // Clean prototype chain of automation markers
        if (proto && typeof proto === 'object') {
          const automationProps = [
            'webdriver', '__driver_evaluate', '__webdriver_evaluate',
            '__selenium_evaluate', '__fxdriver_evaluate'
          ];
          
          automationProps.forEach(prop => {
            try {
              delete proto[prop];
            } catch (e) {}
          });
        }
        
        return proto;
      };
      
      // Override hasOwnProperty to hide automation properties
      const originalHasOwnProperty = Object.prototype.hasOwnProperty;
      Object.prototype.hasOwnProperty = function(prop) {
        if (this === navigator || this === window) {
          const automationProps = [
            'webdriver', '__driver_evaluate', '__webdriver_evaluate',
            '__selenium_evaluate', '__fxdriver_evaluate', '_phantom',
            '__phantom', 'callPhantom', '_selenium', 'geb', '__nightmare'
          ];
          
          if (automationProps.includes(prop)) {
            return false; // Property doesn't exist
          }
        }
        
        return originalHasOwnProperty.call(this, prop);
      };
    `;
    }
    // Screen and Window Protection
    static getScreenWindowProtection() {
        return `
      // Enhanced Screen and Window Protection
      if (typeof screen !== 'undefined') {
        // Make screen properties consistent
        const consistentScreen = window.__fingerprintConsistency || {};
        
        Object.defineProperties(screen, {
          availTop: { get: () => 0, configurable: true },
          availLeft: { get: () => 0, configurable: true },
          orientation: {
            get: () => ({
              angle: 0,
              type: 'landscape-primary',
              onchange: null
            }),
            configurable: true
          }
        });
        
        // Remove vendor-specific screen properties
        const vendorScreenProps = [
          'mozOrientation', 'msOrientation', 'webkitOrientation',
          'mozLockOrientation', 'msLockOrientation', 'webkitLockOrientation'
        ];
        
        vendorScreenProps.forEach(prop => {
          try {
            delete screen[prop];
          } catch (e) {}
        });
      }
      
      if (typeof window !== 'undefined') {
        // Remove window automation properties
        const windowAutomationProps = [
          '__webdriver_evaluate', '__selenium_evaluate', '__webdriver_unwrapped',
          '__selenium_unwrapped', '__fxdriver_evaluate', '__fxdriver_unwrapped',
          'webdriver-evaluate', 'selenium-evaluate', 'webdriverCommand',
          'webdriver-evaluate-response', '__webdriverFunc', 'domAutomation',
          'domAutomationController', '__$webdriverAsyncExecutor',
          '_Selenium_IDE_Recorder', '__lastWatirAlert', '__lastWatirConfirm',
          '__lastWatirPrompt', 'geb', '__nightmare', '_phantom', '__phantom',
          'callPhantom', '_selenium', 'webdriver', 'selenium', 'phantom'
        ];
        
        windowAutomationProps.forEach(prop => {
          try {
            delete window[prop];
          } catch (e) {}
          
          // Also ensure property returns undefined
          try {
            Object.defineProperty(window, prop, {
              get: () => undefined,
              configurable: true,
              enumerable: false
            });
          } catch (e) {}
        });
        
        // Override chrome object to be more realistic
        if (window.chrome) {
          const chromeObj = {
            app: {
              isInstalled: false,
              InstallState: {
                DISABLED: 'disabled',
                INSTALLED: 'installed',
                NOT_INSTALLED: 'not_installed'
              },
              RunningState: {
                CANNOT_RUN: 'cannot_run',
                READY_TO_RUN: 'ready_to_run', 
                RUNNING: 'running'
              }
            },
            runtime: {
              OnInstalledReason: {
                CHROME_UPDATE: 'chrome_update',
                INSTALL: 'install',
                SHARED_MODULE_UPDATE: 'shared_module_update',
                UPDATE: 'update'
              },
              OnRestartRequiredReason: {
                APP_UPDATE: 'app_update',
                OS_UPDATE: 'os_update',
                PERIODIC: 'periodic'
              },
              PlatformArch: {
                ARM: 'arm',
                ARM64: 'arm64',
                MIPS: 'mips',
                MIPS64: 'mips64',
                X86_32: 'x86-32',
                X86_64: 'x86-64'
              },
              PlatformNaclArch: {
                ARM: 'arm',
                MIPS: 'mips',
                MIPS64: 'mips64',
                X86_32: 'x86-32',
                X86_64: 'x86-64'
              },
              PlatformOs: {
                ANDROID: 'android',
                CROS: 'cros',
                LINUX: 'linux',
                MAC: 'mac',
                OPENBSD: 'openbsd',
                WIN: 'win'
              },
              RequestUpdateCheckStatus: {
                NO_UPDATE: 'no_update',
                THROTTLED: 'throttled',
                UPDATE_AVAILABLE: 'update_available'
              }
            },
            csi: function() {},
            loadTimes: function() {
              return {
                commitLoadTime: 1234567890.123,
                connectionInfo: 'h2',
                finishDocumentLoadTime: 1234567890.456,
                finishLoadTime: 1234567890.789,
                firstPaintAfterLoadTime: 1234567890.999,
                firstPaintTime: 1234567890.111,
                navigationType: 'navigate',
                npnNegotiatedProtocol: 'h2',
                requestTime: 1234567890,
                startLoadTime: 1234567890.222,
                wasAlternateProtocolAvailable: false,
                wasFetchedViaSpdy: true,
                wasNpnNegotiated: true
              };
            }
          };
          
          // Remove automation-specific chrome properties
          try {
            delete window.chrome.webstore;
          } catch (e) {}
          
          Object.defineProperty(window, 'chrome', {
            get: () => chromeObj,
            configurable: true
          });
        }
      }
    `;
    }
    // Document Protection
    static getDocumentProtection() {
        return `
      // Enhanced Document Protection
      if (typeof document !== 'undefined') {
        // Override document properties that can reveal automation
        const originalHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden') ||
                              Object.getOwnPropertyDescriptor(document, 'hidden');
        
        if (originalHidden) {
          Object.defineProperty(document, 'hidden', {
            get: () => false, // Always visible
            configurable: true
          });
        }
        
        const originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState') ||
                                       Object.getOwnPropertyDescriptor(document, 'visibilityState');
        
        if (originalVisibilityState) {
          Object.defineProperty(document, 'visibilityState', {
            get: () => 'visible', // Always visible
            configurable: true
          });
        }
        
        // Remove automation-related document properties
        const docAutomationProps = [
          '__webdriver_script_fn', '__webdriver_script_func', '__webdriver_evaluate',
          '__selenium_evaluate', '__fxdriver_evaluate', '$chrome_asyncScriptInfo',
          '__$webdriverAsyncExecutor', '__lastWatirAlert', '__lastWatirConfirm',
          '__lastWatirPrompt', '_Selenium_IDE_Recorder'
        ];
        
        docAutomationProps.forEach(prop => {
          try {
            delete document[prop];
          } catch (e) {}
        });
        
        // Override documentElement properties
        if (document.documentElement) {
          // Remove automation attributes  
          const automationAttrs = ['webdriver', 'selenium', 'driver'];
          automationAttrs.forEach(attr => {
            try {
              document.documentElement.removeAttribute(attr);
            } catch (e) {}
          });
        }
      }
    `;
    }
    // Performance Protection
    static getPerformanceProtection() {
        return `
      // Enhanced Performance Protection
      if (typeof performance !== 'undefined') {
        // Override performance.now with slight randomization
        const originalNow = performance.now;
        let timeOffset = Math.random() * 10; // 0-10ms offset
        
        performance.now = function() {
          const realTime = originalNow.call(this);
          return realTime + timeOffset + (Math.random() - 0.5) * 0.1;
        };
        
        // Override timing properties
        if (performance.timing) {
          const timing = performance.timing;
          const normalizedTiming = {};
          
          for (const key in timing) {
            if (typeof timing[key] === 'number' && timing[key] > 0) {
              // Add small random variation to timing values
              normalizedTiming[key] = timing[key] + Math.floor(Math.random() * 10 - 5);
            } else {
              normalizedTiming[key] = timing[key];
            }
          }
          
          Object.defineProperty(performance, 'timing', {
            get: () => normalizedTiming,
            configurable: true
          });
        }
        
        // Override memory properties if present
        if (performance.memory) {
          const consistentMemory = {
            totalJSHeapSize: 30000000 + Math.floor(Math.random() * 5000000),
            usedJSHeapSize: 20000000 + Math.floor(Math.random() * 3000000),
            jsHeapSizeLimit: 2172649472 + Math.floor(Math.random() * 100000000)
          };
          
          Object.defineProperty(performance, 'memory', {
            get: () => consistentMemory,
            configurable: true
          });
        }
      }
    `;
    }
    // Get all enhanced navigator protections
    static getAllNavigatorProtections() {
        return `
      ${this.getNavigatorProtection()}
      ${this.getPropertyDescriptorProtection()}
      ${this.getScreenWindowProtection()}  
      ${this.getDocumentProtection()}
      ${this.getPerformanceProtection()}
    `;
    }
}
exports.EnhancedNavigatorProtection = EnhancedNavigatorProtection;
//# sourceMappingURL=enhanced-navigator-protection.js.map