/**
 * Advanced CreepJS Protection
 * Comprehensive protection to achieve high trust scores and minimize lies
 */

export class AdvancedCreepJSProtection {

  static getAdvancedCreepJSProtection(): string {
    return `
      // Advanced CreepJS Protection
      (function() {
        'use strict';
        
        const consistentData = window.__fingerprintConsistency || {};
        
        // 1. Error Stack Trace Cleaning (CreepJS checks for automation patterns in errors)
        const originalError = Error;
        Error = function(...args) {
          const error = new originalError(...args);
          
          // Clean the stack trace to remove automation signatures
          if (error.stack) {
            error.stack = error.stack
              .replace(/chrome-extension:\\/\\/.*/g, '')
              .replace(/moz-extension:\\/\\/.*/g, '')
              .replace(/webkit-masked-url:\\/\\/.*/g, '')
              .replace(/eval at.*?\\n/g, '')
              .replace(/puppeteer/gi, '')
              .replace(/playwright/gi, '')
              .replace(/selenium/gi, '')
              .replace(/webdriver/gi, '')
              .replace(/headless/gi, '');
          }
          
          return error;
        };
        Error.prototype = originalError.prototype;
        Object.setPrototypeOf(Error, originalError);
        
        // 2. Console API Normalization (CreepJS detects modified console)
        if (typeof console !== 'undefined') {
          const originalConsole = { ...console };
          
          // Ensure console methods have correct toString
          ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            if (console[method] && console[method].toString) {
              Object.defineProperty(console[method], 'toString', {
                value: function() {
                  return 'function ' + method + '() { [native code] }';
                },
                configurable: true
              });
            }
          });
        }
        
        // 3. Function.prototype.toString Consistency
        const originalToString = Function.prototype.toString;
        Function.prototype.toString = function() {
          const funcStr = originalToString.call(this);
          
          // Remove any automation-related patterns
          if (this.name && this.name.includes('automation')) {
            return 'function ' + this.name.replace(/automation/gi, '') + '() { [native code] }';
          }
          
          // Ensure native functions look native
          if (funcStr.includes('[native code]')) {
            return funcStr;
          }
          
          // For overridden functions, make them look native
          if (this._isOverridden) {
            return 'function ' + (this.name || 'anonymous') + '() { [native code] }';
          }
          
          return funcStr;
        };
        
        // 4. Enhanced Navigator Consistency
        if (typeof navigator !== 'undefined') {
          const consistentNavigator = {
            userAgent: consistentData.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            platform: consistentData.platform || 'Win32',
            hardwareConcurrency: consistentData.hardwareConcurrency || 8,
            deviceMemory: consistentData.deviceMemory || 8,
            languages: consistentData.languages || ['en-US', 'en'],
            language: consistentData.language || 'en-US',
            cookieEnabled: true,
            doNotTrack: null,
            maxTouchPoints: consistentData.maxTouchPoints || 0,
            vendor: 'Google Inc.',
            product: 'Gecko',
            productSub: '20030107',
            vendorSub: '',
            buildID: undefined,
            oscpu: undefined
          };
          
          // Apply all navigator properties with proper descriptors
          Object.keys(consistentNavigator).forEach(key => {
            Object.defineProperty(navigator, key, {
              get: () => consistentNavigator[key],
              configurable: true,
              enumerable: true
            });
          });
        }
        
        // 5. Performance API Consistency (CreepJS analyzes performance metrics)
        if (typeof performance !== 'undefined') {
          // Override performance.now for consistent timing
          const originalNow = performance.now;
          let baseTime = originalNow.call(performance);
          let lastTime = baseTime;
          
          performance.now = function() {
            const realTime = originalNow.call(this);
            const elapsed = realTime - baseTime;
            
            // Add consistent micro-variations to avoid detection
            const seed = consistentData.canvasFingerprint?.charCodeAt(0) || 123;
            const variation = Math.sin(elapsed / 1000 + seed) * 0.1;
            
            lastTime = baseTime + elapsed + variation;
            return lastTime;
          };
          performance.now._isOverridden = true;
          
          // Consistent memory reporting
          if (performance.memory) {
            const baseMemory = {
              totalJSHeapSize: (consistentData.deviceMemory || 8) * 256 * 1024 * 1024,
              usedJSHeapSize: 0,
              jsHeapSizeLimit: 0
            };
            
            baseMemory.usedJSHeapSize = baseMemory.totalJSHeapSize * 0.4;
            baseMemory.jsHeapSizeLimit = baseMemory.totalJSHeapSize * 1.5;
            
            Object.defineProperty(performance, 'memory', {
              get: () => ({
                totalJSHeapSize: Math.floor(baseMemory.totalJSHeapSize + Math.random() * 1024 * 1024),
                usedJSHeapSize: Math.floor(baseMemory.usedJSHeapSize + Math.random() * 512 * 1024),
                jsHeapSizeLimit: baseMemory.jsHeapSizeLimit
              }),
              configurable: true
            });
          }
        }
        
        // 6. WebGL Parameter Consistency (High-priority for CreepJS)
        if (typeof WebGLRenderingContext !== 'undefined') {
          const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
          WebGLRenderingContext.prototype.getParameter = function(parameter) {
            // Return consistent values for all WebGL parameters
            const consistentParams = {
              [this.VERSION]: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
              [this.VENDOR]: 'WebKit',
              [this.RENDERER]: 'WebKit WebGL',
              [this.SHADING_LANGUAGE_VERSION]: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',
              [0x9245]: 'Intel Inc.', // UNMASKED_VENDOR_WEBGL
              [0x9246]: 'Intel(R) HD Graphics 620', // UNMASKED_RENDERER_WEBGL
              [this.MAX_TEXTURE_SIZE]: 16384,
              [this.MAX_VERTEX_ATTRIBS]: 16,
              [this.MAX_TEXTURE_IMAGE_UNITS]: 16,
              [this.MAX_COMBINED_TEXTURE_IMAGE_UNITS]: 32,
              [this.MAX_VERTEX_TEXTURE_IMAGE_UNITS]: 16,
              [this.MAX_RENDERBUFFER_SIZE]: 16384,
              [this.MAX_VIEWPORT_DIMS]: new Int32Array([16384, 16384]),
              [this.ALIASED_LINE_WIDTH_RANGE]: new Float32Array([1, 1]),
              [this.ALIASED_POINT_SIZE_RANGE]: new Float32Array([1, 1024])
            };
            
            if (consistentParams.hasOwnProperty(parameter)) {
              return consistentParams[parameter];
            }
            
            return originalGetParameter.call(this, parameter);
          };
          WebGLRenderingContext.prototype.getParameter._isOverridden = true;
        }
        
        // 7. Canvas Fingerprint Stability (Reduce lies about canvas tampering)
        if (typeof HTMLCanvasElement !== 'undefined') {
          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
          
          const canvasFingerprint = consistentData.canvasFingerprint || 'stable_canvas_' + (Date.now() % 100000);
          
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            if (this.width === 300 && this.height === 150) {
              // Return a consistent but realistic fingerprint
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = 300;
              tempCanvas.height = 150;
              const ctx = tempCanvas.getContext('2d');
              
              // Draw consistent pattern
              ctx.fillStyle = '#f5f5f5';
              ctx.fillRect(0, 0, 300, 150);
              ctx.fillStyle = '#333333';
              ctx.font = '11px Arial';
              ctx.fillText('Canvas fingerprint test: ' + canvasFingerprint, 2, 20);
              ctx.fillText('Browser: Chrome/120.0.0.0', 2, 35);
              ctx.fillStyle = '#666666';
              ctx.fillRect(10, 50, 250, 1);
              
              return tempCanvas.toDataURL(...args);
            }
            return originalToDataURL.apply(this, args);
          };
          HTMLCanvasElement.prototype.toDataURL._isOverridden = true;
          
          CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
            const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
            
            // Apply minimal, consistent noise
            const seed = canvasFingerprint.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            let random = seed;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              if (i % 800 === 0) { // Very sparse noise
                random = (random * 1103515245 + 12345) % (2**31);
                const noise = (random % 2) - 1;
                imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
              }
            }
            
            return imageData;
          };
          CanvasRenderingContext2D.prototype.getImageData._isOverridden = true;
        }
        
        // 8. Audio Context Fingerprint Consistency
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
          const OriginalAudioContext = AudioContext || webkitAudioContext;
          const audioFingerprint = consistentData.audioFingerprint || 'audio_' + (Date.now() % 100000);
          
          function WrappedAudioContext(...args) {
            const context = new OriginalAudioContext(...args);
            
            // Override createAnalyser for consistent audio fingerprinting
            const originalCreateAnalyser = context.createAnalyser;
            context.createAnalyser = function() {
              const analyser = originalCreateAnalyser.call(this);
              const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
              
              analyser.getFloatFrequencyData = function(array) {
                originalGetFloatFrequencyData.call(this, array);
                
                // Apply consistent audio noise based on fingerprint
                const seed = audioFingerprint.charCodeAt(0) || 65;
                let random = seed;
                
                for (let i = 0; i < array.length; i++) {
                  random = (random * 1103515245 + 12345) % (2**31);
                  array[i] += (random / (2**31)) * 0.00001;
                }
              };
              
              return analyser;
            };
            
            return context;
          }
          
          WrappedAudioContext.prototype = OriginalAudioContext.prototype;
          Object.setPrototypeOf(WrappedAudioContext, OriginalAudioContext);
          
          if (typeof AudioContext !== 'undefined') {
            AudioContext = WrappedAudioContext;
            AudioContext._isOverridden = true;
          }
          if (typeof webkitAudioContext !== 'undefined') {
            webkitAudioContext = WrappedAudioContext;
            webkitAudioContext._isOverridden = true;
          }
        }
        
        // 9. Font Metrics Consistency (CreepJS checks font rendering)
        if (typeof CanvasRenderingContext2D !== 'undefined') {
          const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
          CanvasRenderingContext2D.prototype.measureText = function(text) {
            const metrics = originalMeasureText.call(this, text);
            
            // Consistent font metrics to avoid font-based fingerprinting
            const baseWidth = text.length * 7.2; // Average character width
            const fontMetrics = {
              width: baseWidth + (text.charCodeAt(0) % 3) - 1,
              actualBoundingBoxLeft: 0,
              actualBoundingBoxRight: baseWidth,
              actualBoundingBoxAscent: 11,
              actualBoundingBoxDescent: 3,
              fontBoundingBoxAscent: 14,
              fontBoundingBoxDescent: 4,
              alphabeticBaseline: 0,
              emHeightAscent: 11,
              emHeightDescent: 3,
              hangingBaseline: 9,
              ideographicBaseline: -3
            };
            
            return fontMetrics;
          };
          CanvasRenderingContext2D.prototype.measureText._isOverridden = true;
        }
        
        // 10. Date/Time Consistency (Timezone-related lies)
        if (typeof Date !== 'undefined') {
          const targetTimezone = consistentData.timezone || 'America/New_York';
          const timezoneOffset = -300; // EST
          
          const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
          Date.prototype.getTimezoneOffset = function() {
            return timezoneOffset;
          };
          Date.prototype.getTimezoneOffset._isOverridden = true;
        }
        
        // 11. Rect/BoundingClient Consistency
        if (typeof Element !== 'undefined') {
          const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
          Element.prototype.getBoundingClientRect = function() {
            const rect = originalGetBoundingClientRect.call(this);
            
            // For elements that might be used in fingerprinting, return consistent values
            if (this.style && this.style.position === 'absolute' && this.style.visibility === 'hidden') {
              return {
                x: 0,
                y: 0,
                width: 100,
                height: 20,
                top: 0,
                right: 100,
                bottom: 20,
                left: 0
              };
            }
            
            return rect;
          };
        }
        
        // 12. DocumentElement Properties Consistency
        if (typeof document !== 'undefined' && document.documentElement) {
          const consistent = {
            clientWidth: consistentData.availWidth || 1920,
            clientHeight: consistentData.availHeight || 1040,
            scrollWidth: consistentData.availWidth || 1920,
            scrollHeight: consistentData.availHeight || 1040,
            offsetWidth: consistentData.availWidth || 1920,
            offsetHeight: consistentData.availHeight || 1040
          };
          
          Object.keys(consistent).forEach(prop => {
            Object.defineProperty(document.documentElement, prop, {
              get: () => consistent[prop],
              configurable: true
            });
          });
        }
      })();
    `;
  }
}