/**
 * Mobile-Specific Fingerprinting Protection Suite
 * Provides comprehensive protection against mobile device fingerprinting techniques
 */

export class MobileProtection {
  private static readonly commonMobileUserAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  ];

  static getTouchEventProtection(): string {
    return `
      // Touch Event Fingerprinting Protection
      if (typeof window !== 'undefined' && 'ontouchstart' in window) {
        const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (touchEvents.includes(type) && typeof listener === 'function') {
            const normalizedListener = function(event) {
              // Normalize touch coordinates to prevent fingerprinting
              if (event.touches) {
                Array.from(event.touches).forEach((touch, index) => {
                  // Add consistent but subtle variations
                  const touchId = touch.identifier || index;
                  const hash = (touchId + Date.now()).toString();
                  const hashValue = hash.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                  }, 0);
                  
                  const variation = (hashValue % 200) / 100 - 1; // ±1 pixel
                  
                  Object.defineProperty(touch, 'clientX', {
                    value: Math.round(touch.clientX + variation),
                    writable: false
                  });
                  
                  Object.defineProperty(touch, 'clientY', {
                    value: Math.round(touch.clientY + variation),
                    writable: false
                  });
                  
                  Object.defineProperty(touch, 'pageX', {
                    value: Math.round(touch.pageX + variation),
                    writable: false
                  });
                  
                  Object.defineProperty(touch, 'pageY', {
                    value: Math.round(touch.pageY + variation),
                    writable: false
                  });
                  
                  Object.defineProperty(touch, 'screenX', {
                    value: Math.round(touch.screenX + variation),
                    writable: false
                  });
                  
                  Object.defineProperty(touch, 'screenY', {
                    value: Math.round(touch.screenY + variation),
                    writable: false
                  });
                  
                  // Normalize pressure and touch radius
                  if ('force' in touch) {
                    Object.defineProperty(touch, 'force', {
                      value: Math.round((touch.force || 1) * 100) / 100, // Round to 2 decimals
                      writable: false
                    });
                  }
                  
                  if ('radiusX' in touch) {
                    Object.defineProperty(touch, 'radiusX', {
                      value: Math.round(touch.radiusX || 20),
                      writable: false
                    });
                  }
                  
                  if ('radiusY' in touch) {
                    Object.defineProperty(touch, 'radiusY', {
                      value: Math.round(touch.radiusY || 20),
                      writable: false
                    });
                  }
                });
              }
              
              // Normalize touch timing
              Object.defineProperty(event, 'timeStamp', {
                value: Math.round(event.timeStamp / 10) * 10, // Round to 10ms intervals
                writable: false
              });
              
              return listener.call(this, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
    `;
  }

  static getDeviceOrientationProtection(): string {
    return `
      // Device Orientation Fingerprinting Protection
      if (typeof DeviceOrientationEvent !== 'undefined') {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        let orientationPermissionGranted = false;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'deviceorientation' && typeof listener === 'function') {
            const normalizedListener = function(event) {
              // Check if orientation permission is granted
              if (!orientationPermissionGranted) {
                // Create a normalized "no permission" event
                const normalizedEvent = {
                  alpha: null,
                  beta: null,
                  gamma: null,
                  absolute: false,
                  type: 'deviceorientation',
                  target: event.target,
                  currentTarget: event.currentTarget,
                  bubbles: event.bubbles,
                  cancelable: event.cancelable,
                  preventDefault: event.preventDefault.bind(event),
                  stopPropagation: event.stopPropagation.bind(event)
                };
                
                return listener.call(this, normalizedEvent);
              }
              
              // Normalize orientation values to prevent precise fingerprinting
              const normalizedAlpha = event.alpha !== null ? 
                Math.round(event.alpha / 5) * 5 : null; // Round to nearest 5 degrees
              const normalizedBeta = event.beta !== null ? 
                Math.round(event.beta / 5) * 5 : null;
              const normalizedGamma = event.gamma !== null ? 
                Math.round(event.gamma / 5) * 5 : null;
              
              Object.defineProperty(event, 'alpha', {
                value: normalizedAlpha,
                writable: false
              });
              
              Object.defineProperty(event, 'beta', {
                value: normalizedBeta,
                writable: false
              });
              
              Object.defineProperty(event, 'gamma', {
                value: normalizedGamma,
                writable: false
              });
              
              return listener.call(this, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          if (type === 'devicemotion' && typeof listener === 'function') {
            const normalizedListener = function(event) {
              // Normalize device motion data
              if (event.acceleration) {
                ['x', 'y', 'z'].forEach(axis => {
                  if (event.acceleration[axis] !== null) {
                    Object.defineProperty(event.acceleration, axis, {
                      value: Math.round(event.acceleration[axis] * 100) / 100,
                      writable: false
                    });
                  }
                });
              }
              
              if (event.accelerationIncludingGravity) {
                ['x', 'y', 'z'].forEach(axis => {
                  if (event.accelerationIncludingGravity[axis] !== null) {
                    Object.defineProperty(event.accelerationIncludingGravity, axis, {
                      value: Math.round(event.accelerationIncludingGravity[axis] * 100) / 100,
                      writable: false
                    });
                  }
                });
              }
              
              if (event.rotationRate) {
                ['alpha', 'beta', 'gamma'].forEach(axis => {
                  if (event.rotationRate[axis] !== null) {
                    Object.defineProperty(event.rotationRate, axis, {
                      value: Math.round(event.rotationRate[axis] * 10) / 10,
                      writable: false
                    });
                  }
                });
              }
              
              return listener.call(this, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Override permission request if available
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const originalRequestPermission = DeviceOrientationEvent.requestPermission;
          DeviceOrientationEvent.requestPermission = async function() {
            try {
              const result = await originalRequestPermission.call(this);
              orientationPermissionGranted = (result === 'granted');
              return result;
            } catch (error) {
              return 'denied';
            }
          };
        }
      }
    `;
  }

  static getMobileMediaQueryProtection(): string {
    return `
      // Mobile Media Query Fingerprinting Protection
      if (typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined') {
        const originalMatchMedia = window.matchMedia;
        
        window.matchMedia = function(query) {
          const result = originalMatchMedia.call(this, query);
          
          // Normalize mobile-specific media queries
          const mobileQueries = {
            '(pointer: coarse)': 'ontouchstart' in window,
            '(hover: none)': 'ontouchstart' in window,
            '(any-pointer: coarse)': 'ontouchstart' in window,
            '(any-hover: none)': 'ontouchstart' in window,
            '(orientation: portrait)': window.innerHeight > window.innerWidth,
            '(orientation: landscape)': window.innerWidth > window.innerHeight
          };
          
          // Check if query matches mobile-specific patterns
          for (const [mobileQuery, shouldMatch] of Object.entries(mobileQueries)) {
            if (query.includes(mobileQuery.slice(1, -1))) {
              Object.defineProperty(result, 'matches', {
                value: shouldMatch,
                writable: false,
                configurable: true
              });
              break;
            }
          }
          
          // Normalize resolution-based queries
          if (query.includes('resolution') || query.includes('dpr')) {
            const dpr = window.devicePixelRatio || 1;
            const normalizedDpr = Math.round(dpr * 2) / 2; // Round to nearest 0.5
            
            Object.defineProperty(result, 'matches', {
              value: query.includes(normalizedDpr.toString()),
              writable: false,
              configurable: true
            });
          }
          
          return result;
        };
      }
    `;
  }

  static getMobileViewportProtection(): string {
    return `
      // Mobile Viewport Fingerprinting Protection
      if (typeof window !== 'undefined') {
        // Override visual viewport API if available
        if (typeof window.visualViewport !== 'undefined') {
          const originalViewport = window.visualViewport;
          const normalizedViewport = {};
          
          // Create normalized viewport properties
          Object.defineProperty(normalizedViewport, 'width', {
            get: () => Math.round(originalViewport.width / 10) * 10, // Round to nearest 10px
            configurable: true
          });
          
          Object.defineProperty(normalizedViewport, 'height', {
            get: () => Math.round(originalViewport.height / 10) * 10,
            configurable: true
          });
          
          Object.defineProperty(normalizedViewport, 'offsetLeft', {
            get: () => Math.round(originalViewport.offsetLeft),
            configurable: true
          });
          
          Object.defineProperty(normalizedViewport, 'offsetTop', {
            get: () => Math.round(originalViewport.offsetTop),
            configurable: true
          });
          
          Object.defineProperty(normalizedViewport, 'pageLeft', {
            get: () => Math.round(originalViewport.pageLeft),
            configurable: true
          });
          
          Object.defineProperty(normalizedViewport, 'pageTop', {
            get: () => Math.round(originalViewport.pageTop),
            configurable: true
          });
          
          Object.defineProperty(normalizedViewport, 'scale', {
            get: () => Math.round(originalViewport.scale * 100) / 100, // Round to 2 decimals
            configurable: true
          });
          
          // Normalize event handling
          normalizedViewport.addEventListener = function(type, listener, options) {
            if (type === 'resize' || type === 'scroll') {
              const throttledListener = function(event) {
                // Throttle viewport events to prevent timing fingerprinting
                setTimeout(() => listener.call(this, event), 16); // ~60fps
              };
              return originalViewport.addEventListener(type, throttledListener, options);
            }
            return originalViewport.addEventListener(type, listener, options);
          };
          
          normalizedViewport.removeEventListener = originalViewport.removeEventListener.bind(originalViewport);
          
          Object.defineProperty(window, 'visualViewport', {
            value: normalizedViewport,
            writable: false,
            configurable: true
          });
        }
        
        // Override window sizing for mobile consistency
        const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
        const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
        
        if (originalInnerWidth) {
          Object.defineProperty(window, 'innerWidth', {
            get: () => {
              const width = originalInnerWidth.get.call(this);
              return Math.round(width / 5) * 5; // Round to nearest 5px for consistency
            },
            configurable: true
          });
        }
        
        if (originalInnerHeight) {
          Object.defineProperty(window, 'innerHeight', {
            get: () => {
              const height = originalInnerHeight.get.call(this);
              return Math.round(height / 5) * 5;
            },
            configurable: true
          });
        }
      }
    `;
  }

  static getMobileUserAgentProtection(): string {
    const userAgents = JSON.stringify(MobileProtection.commonMobileUserAgents);
    
    return `
      // Mobile User Agent Protection
      if (typeof navigator !== 'undefined') {
        const commonMobileUserAgents = ${userAgents};
        
        // Detect if we should appear as mobile
        const shouldBeMobile = 'ontouchstart' in window || 
                              /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
        
        if (shouldBeMobile) {
          // Select a consistent mobile user agent
          const hash = (navigator.userAgent + window.location.hostname).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const selectedUA = commonMobileUserAgents[Math.abs(hash) % commonMobileUserAgents.length];
          
          // Override navigator properties for mobile consistency
          Object.defineProperty(navigator, 'userAgent', {
            value: selectedUA,
            writable: false,
            configurable: true
          });
          
          // Extract platform from user agent
          let platform = 'iPhone';
          if (selectedUA.includes('Android')) platform = 'Linux armv7l';
          if (selectedUA.includes('iPad')) platform = 'MacIntel';
          
          Object.defineProperty(navigator, 'platform', {
            value: platform,
            writable: false,
            configurable: true
          });
          
          // Mobile-specific navigator properties
          Object.defineProperty(navigator, 'maxTouchPoints', {
            value: 5, // Standard mobile touch points
            writable: false,
            configurable: true
          });
          
          // Override vendor for consistency
          Object.defineProperty(navigator, 'vendor', {
            value: selectedUA.includes('Safari') ? 'Apple Computer, Inc.' : 'Google Inc.',
            writable: false,
            configurable: true
          });
        }
      }
    `;
  }

  static getMobileNetworkProtection(): string {
    return `
      // Mobile Network Information Protection
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = navigator.connection;
        
        if (connection) {
          // Normalize connection properties to prevent fingerprinting
          const normalizedConnection = {
            effectiveType: '4g', // Always report 4G for consistency
            downlink: 10, // Standard mobile downlink speed
            rtt: 100, // Standard mobile RTT
            saveData: false // Don't reveal data saver status
          };
          
          Object.keys(normalizedConnection).forEach(prop => {
            if (prop in connection) {
              Object.defineProperty(connection, prop, {
                value: normalizedConnection[prop],
                writable: false,
                configurable: true
              });
            }
          });
          
          // Override addEventListener to filter connection events
          const originalConnectionAddEventListener = connection.addEventListener;
          connection.addEventListener = function(type, listener, options) {
            if (type === 'change' && typeof listener === 'function') {
              // Don't expose connection changes that could fingerprint
              const filteredListener = function(event) {
                // Always report stable connection
                return listener.call(this, {
                  ...event,
                  target: {
                    ...connection,
                    effectiveType: '4g',
                    downlink: 10,
                    rtt: 100
                  }
                });
              };
              
              return originalConnectionAddEventListener.call(this, type, filteredListener, options);
            }
            
            return originalConnectionAddEventListener.call(this, type, listener, options);
          };
        }
      }
    `;
  }

  static getAllMobileProtections(): string {
    return `
      ${this.getTouchEventProtection()}
      ${this.getDeviceOrientationProtection()}
      ${this.getMobileMediaQueryProtection()}
      ${this.getMobileViewportProtection()}
      ${this.getMobileUserAgentProtection()}
      ${this.getMobileNetworkProtection()}
    `;
  }
}