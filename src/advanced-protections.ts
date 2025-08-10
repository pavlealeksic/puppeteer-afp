/**
 * Advanced Fingerprinting Protection Techniques
 * Implements high-priority missing fingerprinting vectors
 */

export class AdvancedProtections {
  static getAdvancedCanvasProtection(): string {
    return `
      // Advanced Canvas Fingerprinting Protection
      if (typeof HTMLCanvasElement !== 'undefined') {
        const canvasProto = HTMLCanvasElement.prototype;
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override font rendering
        const originalFillText = contextProto.fillText;
        const originalStrokeText = contextProto.strokeText;
        const originalMeasureText = contextProto.measureText;
        
        contextProto.fillText = function(text, x, y, maxWidth) {
          // Add sub-pixel variation to text rendering
          const variation = (Math.random() - 0.5) * 0.1;
          return originalFillText.call(this, text, x + variation, y + variation, maxWidth);
        };
        
        contextProto.strokeText = function(text, x, y, maxWidth) {
          const variation = (Math.random() - 0.5) * 0.1;
          return originalStrokeText.call(this, text, x + variation, y + variation, maxWidth);
        };
        
        contextProto.measureText = function(text) {
          const metrics = originalMeasureText.call(this, text);
          // Add slight variations to text metrics
          const variation = (Math.random() - 0.5) * 0.01;
          return {
            ...metrics,
            width: metrics.width + variation,
            actualBoundingBoxLeft: metrics.actualBoundingBoxLeft + variation,
            actualBoundingBoxRight: metrics.actualBoundingBoxRight + variation
          };
        };
        
        // Override gradient and shadow operations
        const originalCreateLinearGradient = contextProto.createLinearGradient;
        contextProto.createLinearGradient = function(x0, y0, x1, y1) {
          const variation = (Math.random() - 0.5) * 0.001;
          return originalCreateLinearGradient.call(this, 
            x0 + variation, y0 + variation, 
            x1 + variation, y1 + variation);
        };
        
        // Override composite operations
        const originalSetProperty = Object.getOwnPropertyDescriptor(
          contextProto, 'globalCompositeOperation'
        );
        if (originalSetProperty) {
          Object.defineProperty(contextProto, 'globalCompositeOperation', {
            get: originalSetProperty.get,
            set: function(value) {
              // Normalize composite operation variations
              const normalizedOps = {
                'source-over': 'source-over',
                'source-atop': 'source-over', // Slight normalization
                'destination-over': 'source-over'
              };
              return originalSetProperty.set.call(this, normalizedOps[value] || value);
            }
          });
        }
      }
    `;
  }

  static getAdvancedWebGLProtection(): string {
    return `
      // Advanced WebGL Fingerprinting Protection
      if (typeof WebGLRenderingContext !== 'undefined') {
        const webglProto = WebGLRenderingContext.prototype;
        
        // Override shader compilation
        const originalCreateShader = webglProto.createShader;
        webglProto.createShader = function(type) {
          const shader = originalCreateShader.call(this, type);
          // Track shader creation for normalization
          if (shader) {
            shader._afpCreated = true;
          }
          return shader;
        };
        
        const originalShaderSource = webglProto.shaderSource;
        webglProto.shaderSource = function(shader, source) {
          // Normalize shader source for consistency
          let normalizedSource = source;
          if (shader._afpCreated) {
            normalizedSource = source
              .replace(/precision\s+highp/g, 'precision mediump')
              .replace(/gl_FragDepth/g, 'gl_FragCoord.z');
          }
          return originalShaderSource.call(this, shader, normalizedSource);
        };
        
        // Override extension queries
        const originalGetExtension = webglProto.getExtension;
        webglProto.getExtension = function(name) {
          // Normalize extension availability
          const commonExtensions = [
            'ANGLE_instanced_arrays',
            'EXT_blend_minmax',
            'EXT_color_buffer_half_float',
            'EXT_frag_depth',
            'EXT_shader_texture_lod',
            'OES_element_index_uint',
            'OES_standard_derivatives',
            'OES_texture_float',
            'OES_texture_half_float',
            'WEBGL_color_buffer_float',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_depth_texture',
            'WEBGL_draw_buffers',
            'WEBGL_lose_context'
          ];
          
          if (commonExtensions.includes(name)) {
            return originalGetExtension.call(this, name);
          }
          return null; // Block uncommon extensions
        };
        
        // Override getSupportedExtensions
        const originalGetSupportedExtensions = webglProto.getSupportedExtensions;
        webglProto.getSupportedExtensions = function() {
          const extensions = originalGetSupportedExtensions.call(this);
          // Return only common extensions
          return extensions?.filter(ext => [
            'ANGLE_instanced_arrays',
            'EXT_blend_minmax',
            'OES_element_index_uint',
            'OES_standard_derivatives',
            'OES_texture_float',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_depth_texture',
            'WEBGL_lose_context'
          ].includes(ext)) || [];
        };
        
        // Override floating point precision
        const originalGetShaderPrecisionFormat = webglProto.getShaderPrecisionFormat;
        webglProto.getShaderPrecisionFormat = function(shadertype, precisiontype) {
          const format = originalGetShaderPrecisionFormat.call(this, shadertype, precisiontype);
          if (format) {
            // Normalize precision to common values
            return {
              rangeMin: Math.min(format.rangeMin, 127),
              rangeMax: Math.min(format.rangeMax, 127),
              precision: Math.min(format.precision, 23)
            };
          }
          return format;
        };
      }
    `;
  }

  static getPerformanceAPIProtection(): string {
    return `
      // Performance API Fingerprinting Protection
      if (typeof performance !== 'undefined') {
        // Override Performance Observer
        if (typeof PerformanceObserver !== 'undefined') {
          const originalObserver = PerformanceObserver;
          const observedTypes = new Set();
          
          PerformanceObserver = function(callback) {
            const normalizedCallback = function(list) {
              const entries = list.getEntries().map(entry => ({
                ...entry,
                // Normalize timing values
                startTime: Math.round(entry.startTime * 10) / 10,
                duration: Math.round(entry.duration * 10) / 10
              }));
              return callback({ getEntries: () => entries });
            };
            return new originalObserver(normalizedCallback);
          };
          
          PerformanceObserver.supportedEntryTypes = [
            'navigation', 'resource', 'measure', 'mark'
          ]; // Limit exposed types
        }
        
        // Override navigation timing
        if (performance.navigation) {
          Object.defineProperty(performance.navigation, 'type', {
            get: () => 0, // Always return 'navigate'
            configurable: true
          });
        }
        
        // Override timing properties
        if (performance.timing) {
          const originalTiming = performance.timing;
          const normalizedTiming = {};
          
          Object.getOwnPropertyNames(originalTiming).forEach(prop => {
            if (typeof originalTiming[prop] === 'number') {
              Object.defineProperty(normalizedTiming, prop, {
                get: () => {
                  const value = originalTiming[prop];
                  // Add consistent jitter to timing values
                  return value ? Math.round(value / 10) * 10 : value;
                },
                configurable: true
              });
            }
          });
          
          Object.defineProperty(performance, 'timing', {
            get: () => normalizedTiming,
            configurable: true
          });
        }
        
        // Override memory info
        if (performance.memory) {
          Object.defineProperty(performance, 'memory', {
            get: () => ({
              usedJSHeapSize: 16777216, // 16MB
              totalJSHeapSize: 33554432, // 32MB  
              jsHeapSizeLimit: 2147483648 // 2GB
            }),
            configurable: true
          });
        }
      }
    `;
  }

  static getFontFingerprintingProtection(): string {
    return `
      // Font Fingerprinting Protection
      if (typeof document !== 'undefined') {
        // Override font detection methods
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
          const element = originalCreateElement.call(this, tagName);
          
          if (tagName.toLowerCase() === 'span' || tagName.toLowerCase() === 'div') {
            // Override offset measurements for font detection
            const originalOffsetWidth = Object.getOwnPropertyDescriptor(
              HTMLElement.prototype, 'offsetWidth'
            );
            const originalOffsetHeight = Object.getOwnPropertyDescriptor(
              HTMLElement.prototype, 'offsetHeight'
            );
            
            if (originalOffsetWidth) {
              Object.defineProperty(element, 'offsetWidth', {
                get: function() {
                  const width = originalOffsetWidth.get.call(this);
                  // Add consistent noise to prevent font detection
                  const fontFamily = this.style.fontFamily;
                  if (fontFamily) {
                    const hash = fontFamily.split('').reduce((a, b) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0);
                    return width + (hash % 3) - 1; // -1 to +1 variation
                  }
                  return width;
                },
                configurable: true
              });
            }
            
            if (originalOffsetHeight) {
              Object.defineProperty(element, 'offsetHeight', {
                get: function() {
                  const height = originalOffsetHeight.get.call(this);
                  const fontFamily = this.style.fontFamily;
                  if (fontFamily) {
                    const hash = fontFamily.split('').reduce((a, b) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0);
                    return height + (hash % 3) - 1;
                  }
                  return height;
                },
                configurable: true
              });
            }
          }
          
          return element;
        };
        
        // Override CSS font loading
        if (typeof FontFace !== 'undefined') {
          const originalFontFace = FontFace;
          FontFace = function(family, source, descriptors) {
            // Normalize font loading behavior
            const normalizedDescriptors = {
              ...descriptors,
              display: 'swap' // Consistent font display
            };
            return new originalFontFace(family, source, normalizedDescriptors);
          };
          
          Object.setPrototypeOf(FontFace, originalFontFace);
          FontFace.prototype = originalFontFace.prototype;
        }
      }
    `;
  }

  static getStorageFingerprintingProtection(): string {
    return `
      // Storage Fingerprinting Protection
      if (typeof Storage !== 'undefined') {
        // Override localStorage quota detection
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
          try {
            return originalSetItem.call(this, key, value);
          } catch (e) {
            // Normalize quota exceeded errors
            if (e.name === 'QuotaExceededError') {
              const error = new Error('Storage quota exceeded');
              error.name = 'QuotaExceededError';
              throw error;
            }
            throw e;
          }
        };
        
        // Override storage estimation
        if (navigator.storage && navigator.storage.estimate) {
          const originalEstimate = navigator.storage.estimate;
          navigator.storage.estimate = async function() {
            const estimate = await originalEstimate.call(this);
            // Return normalized storage estimates
            return {
              quota: 1073741824, // 1GB
              usage: Math.min(estimate.usage || 0, 536870912), // Max 512MB
              usageDetails: {
                indexedDB: Math.min(estimate.usageDetails?.indexedDB || 0, 268435456),
                caches: Math.min(estimate.usageDetails?.caches || 0, 268435456)
              }
            };
          };
        }
      }
      
      // IndexedDB fingerprinting protection
      if (typeof indexedDB !== 'undefined') {
        const originalOpen = indexedDB.open;
        indexedDB.open = function(name, version) {
          const request = originalOpen.call(this, name, version);
          
          // Override success handler to normalize DB characteristics
          const originalOnSuccess = request.onsuccess;
          request.onsuccess = function(event) {
            const db = event.target.result;
            if (db) {
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
      }
    `;
  }

  static getBehavioralProtection(): string {
    return `
      // Behavioral Fingerprinting Protection
      if (typeof document !== 'undefined') {
        // Mouse movement normalization
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'mousemove' && typeof listener === 'function') {
            const normalizedListener = function(event) {
              // Add slight randomization to mouse coordinates
              const variation = () => (Math.random() - 0.5) * 2;
              
              Object.defineProperty(event, 'clientX', {
                get: () => Math.round(event.clientX + variation()),
                configurable: true
              });
              
              Object.defineProperty(event, 'clientY', {
                get: () => Math.round(event.clientY + variation()),
                configurable: true
              });
              
              return listener.call(this, event);
            };
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          // Keyboard timing normalization
          if ((type === 'keydown' || type === 'keyup') && typeof listener === 'function') {
            const normalizedListener = function(event) {
              // Normalize timing between keystrokes
              const now = performance.now();
              const normalizedTime = Math.round(now / 50) * 50; // Round to 50ms intervals
              
              Object.defineProperty(event, 'timeStamp', {
                get: () => normalizedTime,
                configurable: true
              });
              
              return listener.call(this, event);
            };
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Scroll behavior normalization
        const originalScrollTo = window.scrollTo;
        window.scrollTo = function(x, y) {
          // Normalize scroll behavior
          const options = typeof x === 'object' ? x : { left: x, top: y };
          return originalScrollTo.call(this, {
            ...options,
            behavior: 'auto' // Consistent scroll behavior
          });
        };
      }
    `;
  }

  static getMobileProtection(): string {
    return `
      // Mobile-specific Fingerprinting Protection
      if (typeof window !== 'undefined') {
        // Touch event normalization
        if ('ontouchstart' in window) {
          const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
          
          touchEvents.forEach(eventType => {
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
              if (type === eventType && typeof listener === 'function') {
                const normalizedListener = function(event) {
                  // Normalize touch coordinates
                  if (event.touches) {
                    Array.from(event.touches).forEach(touch => {
                      const variation = () => (Math.random() - 0.5) * 1;
                      Object.defineProperty(touch, 'clientX', {
                        get: () => Math.round(touch.clientX + variation()),
                        configurable: true
                      });
                      Object.defineProperty(touch, 'clientY', {
                        get: () => Math.round(touch.clientY + variation()),
                        configurable: true
                      });
                    });
                  }
                  return listener.call(this, event);
                };
                return originalAddEventListener.call(this, type, normalizedListener, options);
              }
              return originalAddEventListener.call(this, type, listener, options);
            };
          });
        }
        
        // Device orientation protection
        if (typeof DeviceOrientationEvent !== 'undefined') {
          const originalAddEventListener = window.addEventListener;
          window.addEventListener = function(type, listener, options) {
            if (type === 'deviceorientation' && typeof listener === 'function') {
              const normalizedListener = function(event) {
                // Normalize orientation values
                Object.defineProperty(event, 'alpha', {
                  get: () => event.alpha ? Math.round(event.alpha / 5) * 5 : null,
                  configurable: true
                });
                Object.defineProperty(event, 'beta', {
                  get: () => event.beta ? Math.round(event.beta / 5) * 5 : null,
                  configurable: true
                });
                Object.defineProperty(event, 'gamma', {
                  get: () => event.gamma ? Math.round(event.gamma / 5) * 5 : null,
                  configurable: true
                });
                return listener.call(this, event);
              };
              return originalAddEventListener.call(this, type, normalizedListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
          };
        }
        
        // Mobile media query protection
        if (typeof matchMedia !== 'undefined') {
          const originalMatchMedia = window.matchMedia;
          window.matchMedia = function(query) {
            const result = originalMatchMedia.call(this, query);
            
            // Normalize mobile-specific media queries
            if (query.includes('pointer: coarse')) {
              Object.defineProperty(result, 'matches', {
                get: () => 'ontouchstart' in window,
                configurable: true
              });
            }
            
            return result;
          };
        }
      }
    `;
  }

  static getAllAdvancedProtections(): string {
    return `
      ${this.getAdvancedCanvasProtection()}
      ${this.getAdvancedWebGLProtection()}
      ${this.getPerformanceAPIProtection()}
      ${this.getFontFingerprintingProtection()}
      ${this.getStorageFingerprintingProtection()}
      ${this.getBehavioralProtection()}
      ${this.getMobileProtection()}
    `;
  }
}