/**
 * CreepJS Lies Detection Evasion
 * Reduces inconsistencies that CreepJS flags as "lies" 
 */

export class CreepJSEvasion {

  // Consistent User Agent and Platform
  static getUserAgentConsistency(): string {
    return `
      // User Agent and Platform Consistency
      if (typeof navigator !== 'undefined') {
        const consistentData = window.__fingerprintConsistency || {};
        
        // Ensure user agent matches platform 
        const platform = consistentData.platform || navigator.platform;
        let userAgent = consistentData.userAgent;
        
        if (!userAgent) {
          // Generate consistent user agent based on platform
          if (platform.includes('Win')) {
            userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
          } else if (platform.includes('Mac')) {
            userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';  
          } else {
            userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
          }
        }
        
        // Apply consistent values
        Object.defineProperty(navigator, 'userAgent', {
          get: () => userAgent,
          configurable: true
        });
        
        Object.defineProperty(navigator, 'appVersion', {
          get: () => userAgent.substring(userAgent.indexOf('/') + 1),
          configurable: true
        });
        
        // Ensure platform consistency
        Object.defineProperty(navigator, 'platform', {
          get: () => platform,
          configurable: true
        });
        
        // Consistent vendor
        Object.defineProperty(navigator, 'vendor', {
          get: () => 'Google Inc.',
          configurable: true
        });
        
        // Consistent product  
        Object.defineProperty(navigator, 'product', {
          get: () => 'Gecko',
          configurable: true
        });
      }
    `;
  }

  // Screen Resolution Consistency
  static getScreenConsistency(): string {
    return `
      // Screen Resolution Consistency
      if (typeof screen !== 'undefined' && typeof window !== 'undefined') {
        const consistentData = window.__fingerprintConsistency || {};
        
        // Ensure all screen/window dimensions are consistent
        const screenWidth = consistentData.screenWidth || 1920;
        const screenHeight = consistentData.screenHeight || 1080;
        const availWidth = consistentData.availWidth || screenWidth;
        const availHeight = consistentData.availHeight || (screenHeight - 40);
        const devicePixelRatio = consistentData.devicePixelRatio || 1;
        
        // Apply to screen
        Object.defineProperties(screen, {
          width: { get: () => screenWidth, configurable: true },
          height: { get: () => screenHeight, configurable: true },
          availWidth: { get: () => availWidth, configurable: true },
          availHeight: { get: () => availHeight, configurable: true },
          colorDepth: { get: () => 24, configurable: true },
          pixelDepth: { get: () => 24, configurable: true }
        });
        
        // Apply to window - MUST match screen values
        Object.defineProperties(window, {
          innerWidth: { get: () => availWidth, configurable: true },
          innerHeight: { get: () => availHeight, configurable: true },
          outerWidth: { get: () => screenWidth, configurable: true },
          outerHeight: { get: () => screenHeight, configurable: true },
          devicePixelRatio: { get: () => devicePixelRatio, configurable: true },
          screenX: { get: () => 0, configurable: true },
          screenY: { get: () => 0, configurable: true }
        });
      }
    `;
  }

  // Hardware Consistency
  static getHardwareConsistency(): string {
    return `
      // Hardware Consistency
      if (typeof navigator !== 'undefined') {
        const consistentData = window.__fingerprintConsistency || {};
        
        const hardwareConcurrency = consistentData.hardwareConcurrency || 8;
        const deviceMemory = consistentData.deviceMemory || 8;
        
        // Ensure hardware values make logical sense together
        Object.defineProperties(navigator, {
          hardwareConcurrency: { 
            get: () => hardwareConcurrency, 
            configurable: true 
          },
          deviceMemory: { 
            get: () => deviceMemory, 
            configurable: true 
          }
        });
        
        // Performance memory should correlate with deviceMemory
        if (typeof performance !== 'undefined' && performance.memory) {
          const baseHeapSize = deviceMemory * 256 * 1024 * 1024; // 256MB per GB
          const usedHeap = baseHeapSize * 0.7; // 70% used
          const totalHeap = baseHeapSize * 0.8; // 80% allocated
          
          Object.defineProperty(performance, 'memory', {
            get: () => ({
              totalJSHeapSize: Math.floor(totalHeap),
              usedJSHeapSize: Math.floor(usedHeap),
              jsHeapSizeLimit: Math.floor(baseHeapSize * 2)
            }),
            configurable: true
          });
        }
      }
    `;
  }

  // WebGL Consistency
  static getWebGLConsistency(): string {
    return `
      // WebGL Consistency
      if (typeof HTMLCanvasElement !== 'undefined') {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        
        HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
          const context = originalGetContext.apply(this, [contextType, ...args]);
          
          if (contextType === 'webgl' || contextType === 'experimental-webgl') {
            if (context) {
              const consistentData = window.__fingerprintConsistency || {};
              
              // Override getParameter for consistency
              const originalGetParameter = context.getParameter;
              context.getParameter = function(parameter) {
                switch (parameter) {
                  case this.VENDOR:
                    return consistentData.webglVendor || 'WebKit';
                  case this.RENDERER:  
                    return consistentData.webglRenderer || 'WebKit WebGL';
                  case this.VERSION:
                    return consistentData.webglVersion || 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
                  case this.SHADING_LANGUAGE_VERSION:
                    return 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)';
                  case this.MAX_TEXTURE_SIZE:
                    return 16384; // Consistent value
                  case this.MAX_VERTEX_ATTRIBS:
                    return 16; // Consistent value
                  case this.MAX_TEXTURE_IMAGE_UNITS:
                    return 16; // Consistent value
                  case this.MAX_RENDERBUFFER_SIZE:
                    return 16384; // Consistent value
                  case this.MAX_VIEWPORT_DIMS:
                    return new Int32Array([16384, 16384]); // Consistent value
                  default:
                    return originalGetParameter.call(this, parameter);
                }
              };
              
              // Override getSupportedExtensions for consistency
              const originalGetSupportedExtensions = context.getSupportedExtensions;
              context.getSupportedExtensions = function() {
                // Return consistent, realistic extension list
                return [
                  'ANGLE_instanced_arrays',
                  'EXT_blend_minmax',
                  'EXT_color_buffer_half_float',
                  'EXT_disjoint_timer_query',
                  'EXT_float_blend',
                  'EXT_frag_depth',
                  'EXT_shader_texture_lod',
                  'EXT_texture_compression_bptc',
                  'EXT_texture_compression_rgtc',
                  'EXT_texture_filter_anisotropic',
                  'EXT_sRGB',
                  'KHR_parallel_shader_compile',
                  'OES_element_index_uint',
                  'OES_fbo_render_mipmap',
                  'OES_standard_derivatives',
                  'OES_texture_float',
                  'OES_texture_float_linear',
                  'OES_texture_half_float',
                  'OES_texture_half_float_linear',
                  'OES_vertex_array_object',
                  'WEBGL_color_buffer_float',
                  'WEBGL_compressed_texture_s3tc',
                  'WEBGL_compressed_texture_s3tc_srgb',
                  'WEBGL_debug_renderer_info',
                  'WEBGL_debug_shaders',
                  'WEBGL_depth_texture',
                  'WEBGL_draw_buffers',
                  'WEBGL_lose_context'
                ];
              };
            }
          }
          
          return context;
        };
      }
    `;
  }

  // Audio Context Consistency
  static getAudioConsistency(): string {
    return `
      // Audio Context Consistency
      if (typeof AudioContext !== 'undefined') {
        const OriginalAudioContext = AudioContext;
        
        AudioContext = function(...args) {
          const context = new OriginalAudioContext(...args);
          const consistentData = window.__fingerprintConsistency || {};
          
          // Override properties for consistency
          Object.defineProperties(context, {
            sampleRate: {
              get: () => consistentData.audioContext?.sampleRate || 44100,
              configurable: true
            },
            baseLatency: {
              get: () => consistentData.audioContext?.baseLatency || 0.01,
              configurable: true
            }
          });
          
          // Override destination for consistency
          if (context.destination) {
            Object.defineProperty(context.destination, 'maxChannelCount', {
              get: () => consistentData.audioContext?.maxChannelCount || 2,
              configurable: true
            });
          }
          
          return context;
        };
        
        // Preserve prototype
        AudioContext.prototype = OriginalAudioContext.prototype;
        Object.setPrototypeOf(AudioContext, OriginalAudioContext);
      }
    `;
  }

  // Canvas Fingerprint Consistency
  static getCanvasConsistency(): string {
    return `
      // Canvas Fingerprint Consistency
      if (typeof HTMLCanvasElement !== 'undefined') {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
          const result = originalToDataURL.apply(this, args);
          const consistentData = window.__fingerprintConsistency || {};
          
          // If we have a consistent canvas fingerprint, use it
          if (consistentData.canvasFingerprint && this.width === 300 && this.height === 150) {
            // This is likely a fingerprinting canvas
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            
            // Draw consistent pattern
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 300, 150);
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.fillText('Consistent canvas fingerprint: ' + consistentData.canvasFingerprint, 2, 20);
            
            return originalToDataURL.apply(canvas, args);
          }
          
          return result;
        };
        
        // Override getImageData for consistency
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
          const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
          
          // Apply very subtle, consistent noise to avoid detection
          const consistentData = window.__fingerprintConsistency || {};
          if (consistentData.canvasFingerprint) {
            const seed = parseInt(consistentData.canvasFingerprint.substring(0, 6), 16) || 123456;
            let random = seed;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              // Simple LCG for consistent randomness
              random = (random * 1103515245 + 12345) % (2**31);
              const noise = (random % 3) - 1; // -1, 0, or 1
              
              // Apply very subtle noise only to non-alpha channels
              if (i % 400 === 0) { // Only every 100th pixel
                imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
                imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));  
                imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
              }
            }
          }
          
          return imageData;
        };
      }
    `;
  }

  // Language and Locale Consistency
  static getLocaleConsistency(): string {
    return `
      // Language and Locale Consistency
      if (typeof navigator !== 'undefined') {
        const consistentData = window.__fingerprintConsistency || {};
        const languages = consistentData.languages || ['en-US', 'en'];
        const timezone = consistentData.timezone || 'America/New_York';
        
        // Ensure Date methods use consistent timezone
        const originalToLocaleString = Date.prototype.toLocaleString;
        Date.prototype.toLocaleString = function(locales, options) {
          return originalToLocaleString.call(this, languages[0], {
            ...options,
            timeZone: timezone
          });
        };
        
        const originalToLocaleDateString = Date.prototype.toLocaleDateString;
        Date.prototype.toLocaleDateString = function(locales, options) {
          return originalToLocaleDateString.call(this, languages[0], options);
        };
        
        const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
        Date.prototype.toLocaleTimeString = function(locales, options) {
          return originalToLocaleTimeString.call(this, languages[0], options);
        };
        
        // Override Intl.DateTimeFormat for consistency
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
          const OriginalDateTimeFormat = Intl.DateTimeFormat;
          Intl.DateTimeFormat = function(locales, options) {
            return new OriginalDateTimeFormat(languages[0], {
              ...options,
              timeZone: timezone
            });
          };
          Object.setPrototypeOf(Intl.DateTimeFormat, OriginalDateTimeFormat);
          Intl.DateTimeFormat.prototype = OriginalDateTimeFormat.prototype;
        }
      }
    `;
  }

  // Performance Timing Consistency
  static getPerformanceConsistency(): string {
    return `
      // Performance Timing Consistency  
      if (typeof performance !== 'undefined') {
        // Override performance.now for consistency
        const originalNow = performance.now;
        const startTime = originalNow.call(performance);
        
        performance.now = function() {
          const realTime = originalNow.call(this);
          const elapsedTime = realTime - startTime;
          
          // Add consistent, small variations instead of random
          const consistentData = window.__fingerprintConsistency || {};
          const seed = parseInt(consistentData.canvasFingerprint?.substring(0, 4) || '1234', 16);
          const variation = ((seed + Math.floor(elapsedTime / 1000)) % 100) / 10000; // 0-0.01ms variation
          
          return realTime + variation;
        };
        
        // Normalize timing properties if available
        if (performance.timing) {
          const consistentData = window.__fingerprintConsistency || {};
          const performanceTiming = consistentData.performanceTiming || {};
          
          const timingProxy = new Proxy(performance.timing, {
            get: function(target, prop) {
              if (performanceTiming[prop]) {
                return performanceTiming[prop];
              }
              return target[prop];
            }
          });
          
          Object.defineProperty(performance, 'timing', {
            get: () => timingProxy,
            configurable: true
          });
        }
      }
    `;
  }

  // Get all CreepJS lie reduction techniques
  static getAllCreepJSEvasion(): string {
    return `
      ${this.getUserAgentConsistency()}
      ${this.getScreenConsistency()}
      ${this.getHardwareConsistency()}
      ${this.getWebGLConsistency()}
      ${this.getAudioConsistency()}
      ${this.getCanvasConsistency()}
      ${this.getLocaleConsistency()}
      ${this.getPerformanceConsistency()}
    `;
  }
}