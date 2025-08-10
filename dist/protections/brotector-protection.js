"use strict";
/**
 * Brotector-specific Protection
 * Targets automation detection patterns used by Brotector
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrotectorProtection = void 0;
class BrotectorProtection {
    static getBrotectorProtection() {
        return `
      // Brotector Automation Detection Protection
      (function() {
        'use strict';
        
        // 1. Behavioral Pattern Normalization
        let mouseMovements = [];
        let clickPattern = [];
        let keystrokes = [];
        
        // Simulate natural mouse movement
        document.addEventListener('mousemove', function(e) {
          mouseMovements.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
          });
          
          // Keep only recent movements
          if (mouseMovements.length > 50) {
            mouseMovements = mouseMovements.slice(-25);
          }
        });
        
        // Add micro-movements periodically
        setInterval(() => {
          if (mouseMovements.length > 0) {
            const lastMove = mouseMovements[mouseMovements.length - 1];
            const microMove = {
              x: lastMove.x + (Math.random() - 0.5) * 2,
              y: lastMove.y + (Math.random() - 0.5) * 2,
              timestamp: Date.now()
            };
            mouseMovements.push(microMove);
          }
        }, 1000 + Math.random() * 2000);
        
        // 2. Event Timing Humanization
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (typeof listener === 'function') {
            const originalListener = listener;
            const humanizedListener = function(event) {
              // Add small random delays to event handling
              const delay = Math.random() * 5; // 0-5ms
              setTimeout(() => originalListener.call(this, event), delay);
            };
            return originalAddEventListener.call(this, type, humanizedListener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
        
        // 3. Document Loading Patterns
        if (typeof document !== 'undefined') {
          let readyStateCallbacks = [];
          const originalReadyState = document.readyState;
          
          // Simulate gradual loading state changes
          Object.defineProperty(document, 'readyState', {
            get: function() {
              return originalReadyState;
            },
            configurable: true
          });
          
          // Add slight delays to DOMContentLoaded
          const originalDispatchEvent = document.dispatchEvent;
          document.dispatchEvent = function(event) {
            if (event.type === 'DOMContentLoaded') {
              // Add natural delay
              setTimeout(() => {
                originalDispatchEvent.call(this, event);
              }, 10 + Math.random() * 20);
              return true;
            }
            return originalDispatchEvent.call(this, event);
          };
        }
        
        // 4. Network Request Patterns
        if (typeof XMLHttpRequest !== 'undefined') {
          const OriginalXHR = XMLHttpRequest;
          XMLHttpRequest = function() {
            const xhr = new OriginalXHR();
            const originalSend = xhr.send;
            
            xhr.send = function(data) {
              // Add natural delay to requests
              const delay = 50 + Math.random() * 100; // 50-150ms
              setTimeout(() => {
                originalSend.call(this, data);
              }, delay);
            };
            
            return xhr;
          };
          XMLHttpRequest.prototype = OriginalXHR.prototype;
          Object.setPrototypeOf(XMLHttpRequest, OriginalXHR);
        }
        
        // 5. Focus/Blur Event Simulation
        let windowFocused = true;
        const focusEvents = ['focus', 'blur'];
        
        focusEvents.forEach(eventType => {
          const originalMethod = window[eventType] || function() {};
          window[eventType] = function(...args) {
            windowFocused = eventType === 'focus';
            return originalMethod.apply(this, args);
          };
        });
        
        // Simulate occasional focus/blur events
        setInterval(() => {
          if (Math.random() < 0.1) { // 10% chance every interval
            windowFocused = !windowFocused;
            const event = new Event(windowFocused ? 'focus' : 'blur');
            window.dispatchEvent(event);
          }
        }, 5000 + Math.random() * 10000);
        
        // 6. Scroll Behavior Humanization
        if (typeof window !== 'undefined') {
          let scrollTimeout;
          const originalScrollTo = window.scrollTo;
          const originalScrollBy = window.scrollBy;
          
          window.scrollTo = function(x, y) {
            // Clear any existing scroll
            clearTimeout(scrollTimeout);
            
            // Simulate smooth scrolling with micro-delays
            const steps = 5 + Math.floor(Math.random() * 5);
            const stepX = (x - window.scrollX) / steps;
            const stepY = (y - window.scrollY) / steps;
            
            for (let i = 0; i <= steps; i++) {
              scrollTimeout = setTimeout(() => {
                originalScrollTo.call(this, 
                  window.scrollX + stepX * i,
                  window.scrollY + stepY * i
                );
              }, i * (10 + Math.random() * 10));
            }
          };
          
          window.scrollBy = function(x, y) {
            const targetX = window.scrollX + x;
            const targetY = window.scrollY + y;
            window.scrollTo(targetX, targetY);
          };
        }
        
        // 7. Touch Event Simulation (for mobile fingerprinting)
        if (typeof TouchEvent !== 'undefined' && 'ontouchstart' in window) {
          const touchEvents = ['touchstart', 'touchmove', 'touchend'];
          
          touchEvents.forEach(eventType => {
            document.addEventListener(eventType, function(e) {
              // Add slight randomization to touch coordinates
              if (e.touches && e.touches.length > 0) {
                const touch = e.touches[0];
                const variation = Math.random() * 2 - 1; // -1 to 1 pixel
                
                Object.defineProperty(touch, 'clientX', {
                  value: touch.clientX + variation,
                  writable: false
                });
                Object.defineProperty(touch, 'clientY', {
                  value: touch.clientY + variation,
                  writable: false
                });
              }
            }, true);
          });
        }
        
        // 8. Animation Frame Timing
        if (typeof requestAnimationFrame !== 'undefined') {
          const originalRAF = requestAnimationFrame;
          requestAnimationFrame = function(callback) {
            return originalRAF(function(timestamp) {
              // Add micro-jitter to animation timing
              const jitter = Math.random() * 0.5 - 0.25;
              callback(timestamp + jitter);
            });
          };
        }
        
        // 9. Memory Usage Patterns (Simulate normal usage)
        let memoryUsage = [];
        setInterval(() => {
          // Simulate memory fluctuation
          if (performance.memory) {
            const usage = performance.memory.usedJSHeapSize;
            memoryUsage.push(usage);
            
            // Keep memory usage history limited
            if (memoryUsage.length > 10) {
              memoryUsage = memoryUsage.slice(-5);
            }
          }
          
          // Occasionally create and cleanup small objects to simulate activity
          if (Math.random() < 0.3) {
            const temp = new Array(100 + Math.floor(Math.random() * 100)).fill(0);
            setTimeout(() => {
              temp.length = 0;
            }, 100 + Math.random() * 200);
          }
        }, 2000 + Math.random() * 3000);
        
        // 10. CPU Usage Simulation (Light background tasks)
        setInterval(() => {
          // Simulate light CPU usage with micro-tasks
          const start = Date.now();
          while (Date.now() - start < 1 + Math.random() * 2) {
            // Light computational work
            Math.random() * Math.random();
          }
        }, 3000 + Math.random() * 5000);
        
        // 11. Storage Access Patterns
        if (typeof localStorage !== 'undefined') {
          // Simulate occasional storage access
          setInterval(() => {
            if (Math.random() < 0.2) {
              try {
                const keys = Object.keys(localStorage);
                if (keys.length > 0) {
                  const randomKey = keys[Math.floor(Math.random() * keys.length)];
                  localStorage.getItem(randomKey);
                }
              } catch (e) {
                // Ignore errors
              }
            }
          }, 10000 + Math.random() * 20000);
        }
        
        // 12. Error Handling Patterns (Natural error occurrence)
        window.addEventListener('error', function(e) {
          // Simulate natural error handling with slight delays
          setTimeout(() => {
            console.log('Handled error naturally');
          }, Math.random() * 100);
        });
        
        // Occasionally generate benign errors to simulate real usage
        setInterval(() => {
          if (Math.random() < 0.05) { // 5% chance
            try {
              // Generate a harmless error that gets caught
              throw new Error('Natural client-side error');
            } catch (e) {
              // Silently handle
            }
          }
        }, 30000 + Math.random() * 60000);
      })();
    `;
    }
}
exports.BrotectorProtection = BrotectorProtection;
//# sourceMappingURL=brotector-protection.js.map