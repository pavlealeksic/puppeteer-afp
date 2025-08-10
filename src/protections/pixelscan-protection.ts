/**
 * Pixelscan-specific Protection
 * Targets fingerprinting vectors specifically used by Pixelscan
 */

export class PixelscanProtection {

  // Pixelscan checks for consistent fingerprinting across multiple vectors
  static getPixelscanProtection(): string {
    return `
      // Pixelscan Protection - Consistency across all vectors
      (function() {
        'use strict';
        
        const consistentData = window.__fingerprintConsistency || {};
        
        // 1. Canvas Fingerprint Consistency 
        if (typeof HTMLCanvasElement !== 'undefined') {
          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
          
          // Ensure consistent canvas output
          const canvasFingerprint = consistentData.canvasFingerprint || 'px_canvas_' + Math.random().toString(36).substr(2, 9);
          
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            if (this.width === 300 && this.height === 150) {
              // Standard fingerprinting canvas size
              const canvas = document.createElement('canvas');
              canvas.width = 300;
              canvas.height = 150;
              const ctx = canvas.getContext('2d');
              
              // Draw consistent pattern that looks natural
              ctx.fillStyle = '#f8f9fa';
              ctx.fillRect(0, 0, 300, 150);
              ctx.fillStyle = '#495057';
              ctx.font = '12px system-ui, -apple-system, sans-serif';
              ctx.fillText('Canvas Test: ' + canvasFingerprint, 5, 25);
              ctx.fillRect(10, 40, 280, 2);
              ctx.arc(150, 100, 30, 0, 2 * Math.PI);
              ctx.stroke();
              
              return originalToDataURL.apply(canvas, args);
            }
            return originalToDataURL.apply(this, args);
          };
          
          CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
            const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
            
            // Add consistent noise to avoid detection of tampering
            const seed = parseInt(canvasFingerprint.slice(-6), 36) || 123456;
            let random = seed;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              random = (random * 1103515245 + 12345) % (2**31);
              if (i % 200 === 0) { // Every 50th pixel
                const noise = (random % 2); // 0 or 1
                imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
                imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
                imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
              }
            }
            
            return imageData;
          };
        }
        
        // 2. WebGL Fingerprint Consistency
        if (typeof WebGLRenderingContext !== 'undefined') {
          const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
          const webglVendor = consistentData.webglVendor || 'WebKit';
          const webglRenderer = consistentData.webglRenderer || 'WebKit WebGL';
          
          WebGLRenderingContext.prototype.getParameter = function(parameter) {
            switch (parameter) {
              case this.VENDOR:
                return webglVendor;
              case this.RENDERER:
                return webglRenderer;
              case this.VERSION:
                return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
              case this.SHADING_LANGUAGE_VERSION:
                return 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)';
              case this.UNMASKED_VENDOR_WEBGL:
                return webglVendor;
              case this.UNMASKED_RENDERER_WEBGL:
                return webglRenderer;
              default:
                return originalGetParameter.call(this, parameter);
            }
          };
          
          // WebGL2 context
          if (typeof WebGL2RenderingContext !== 'undefined') {
            const originalGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
            WebGL2RenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
          }
        }
        
        // 3. Audio Fingerprint Protection
        if (typeof AudioContext !== 'undefined') {
          const OriginalAudioContext = AudioContext;
          const audioSampleRate = consistentData.audioContext?.sampleRate || 44100;
          
          AudioContext = function(...args) {
            const context = new OriginalAudioContext(...args);
            
            // Override analyser node for consistent fingerprinting
            const originalCreateAnalyser = context.createAnalyser;
            context.createAnalyser = function() {
              const analyser = originalCreateAnalyser.call(this);
              const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
              const originalGetByteFrequencyData = analyser.getByteFrequencyData;
              
              analyser.getFloatFrequencyData = function(array) {
                originalGetFloatFrequencyData.call(this, array);
                // Add consistent noise
                const seed = parseInt(canvasFingerprint.slice(-4), 36) || 1234;
                let random = seed;
                for (let i = 0; i < array.length; i++) {
                  random = (random * 1103515245 + 12345) % (2**31);
                  array[i] += (random / (2**31)) * 0.0001; // Very small noise
                }
              };
              
              analyser.getByteFrequencyData = function(array) {
                originalGetByteFrequencyData.call(this, array);
                // Add consistent noise
                const seed = parseInt(canvasFingerprint.slice(-4), 36) || 1234;
                let random = seed;
                for (let i = 0; i < array.length; i++) {
                  random = (random * 1103515245 + 12345) % (2**31);
                  array[i] = Math.max(0, Math.min(255, array[i] + (random % 3) - 1));
                }
              };
              
              return analyser;
            };
            
            return context;
          };
          
          AudioContext.prototype = OriginalAudioContext.prototype;
          Object.setPrototypeOf(AudioContext, OriginalAudioContext);
        }
        
        // 4. Font Detection Protection
        if (typeof document !== 'undefined') {
          // Override font measurement to return consistent results
          const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
          const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
          
          if (originalOffsetWidth && originalOffsetHeight) {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
              get: function() {
                const originalValue = originalOffsetWidth.get.call(this);
                
                // If this looks like font measurement (small text elements)
                if (this.tagName === 'SPAN' && this.style.position === 'absolute' && 
                    originalValue < 200 && this.textContent && this.textContent.length < 10) {
                  // Return slightly randomized but consistent values
                  const textHash = this.textContent.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                  }, 0);
                  const variance = (textHash % 5) - 2; // -2 to 2
                  return Math.max(1, originalValue + variance);
                }
                
                return originalValue;
              }
            });
          }
        }
        
        // 5. Media Device Fingerprinting Protection
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
          navigator.mediaDevices.enumerateDevices = function() {
            return Promise.resolve([
              {
                deviceId: 'default',
                groupId: 'group1',
                kind: 'audioinput',
                label: 'Default - Microphone'
              },
              {
                deviceId: 'communications',
                groupId: 'group1', 
                kind: 'audioinput',
                label: 'Communications - Microphone'
              },
              {
                deviceId: 'default',
                groupId: 'group2',
                kind: 'audiooutput',
                label: 'Default - Speaker'
              }
            ]);
          };
        }
        
        // 6. Battery API Protection
        if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
          const originalGetBattery = navigator.getBattery;
          navigator.getBattery = function() {
            return Promise.resolve({
              charging: true,
              chargingTime: 0,
              dischargingTime: Infinity,
              level: 1,
              addEventListener: function() {},
              removeEventListener: function() {}
            });
          };
        }
        
        // 7. Network Information Protection
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
          Object.defineProperty(navigator, 'connection', {
            get: () => ({
              effectiveType: '4g',
              downlink: 10,
              rtt: 50,
              saveData: false
            }),
            configurable: true
          });
        }
        
        // 8. Geolocation Protection
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
          navigator.geolocation.getCurrentPosition = function(success, error, options) {
            if (error) {
              error({
                code: 1,
                message: 'User denied the request for Geolocation.'
              });
            }
          };
        }
      })();
    `;
  }
}