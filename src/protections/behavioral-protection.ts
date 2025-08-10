/**
 * Behavioral Pattern Simulation Protection
 * Provides human-like behavioral patterns to prevent behavioral fingerprinting
 */

export class BehavioralProtection {
  static getMouseMovementNormalization(): string {
    return `
      // Mouse Movement Pattern Normalization
      if (typeof document !== 'undefined') {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        // Mouse movement tracking for natural patterns
        let lastMouseTime = 0;
        let mouseVelocityHistory = [];
        let mousePositionHistory = [];
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'mousemove' && typeof listener === 'function') {
            const normalizedListener = function(event) {
              const now = performance.now();
              const timeDelta = now - lastMouseTime;
              
              if (timeDelta > 0) {
                // Calculate mouse velocity for natural movement
                const lastPos = mousePositionHistory[mousePositionHistory.length - 1];
                if (lastPos) {
                  const distance = Math.sqrt(
                    Math.pow(event.clientX - lastPos.x, 2) + 
                    Math.pow(event.clientY - lastPos.y, 2)
                  );
                  const velocity = distance / timeDelta;
                  
                  // Add to velocity history (keep last 10 entries)
                  mouseVelocityHistory.push(velocity);
                  if (mouseVelocityHistory.length > 10) {
                    mouseVelocityHistory.shift();
                  }
                  
                  // Calculate average velocity for smoothness detection
                  const avgVelocity = mouseVelocityHistory.reduce((a, b) => a + b, 0) / mouseVelocityHistory.length;
                  
                  // If movement is too smooth/robotic, add natural variation
                  if (avgVelocity > 0 && mouseVelocityHistory.length > 3) {
                    const velocityVariation = mouseVelocityHistory.reduce((acc, v) => acc + Math.abs(v - avgVelocity), 0) / mouseVelocityHistory.length;
                    
                    if (velocityVariation < 0.1) { // Too smooth, likely robotic
                      // Add natural micro-movements
                      const jitterX = (Math.random() - 0.5) * 2;
                      const jitterY = (Math.random() - 0.5) * 2;
                      
                      Object.defineProperty(event, 'clientX', {
                        value: Math.round(event.clientX + jitterX),
                        writable: false,
                        configurable: true
                      });
                      
                      Object.defineProperty(event, 'clientY', {
                        value: Math.round(event.clientY + jitterY),
                        writable: false,
                        configurable: true
                      });
                    }
                  }
                }
                
                // Update position history
                mousePositionHistory.push({ x: event.clientX, y: event.clientY, time: now });
                if (mousePositionHistory.length > 5) {
                  mousePositionHistory.shift();
                }
              }
              
              lastMouseTime = now;
              
              // Add natural timing variation to prevent perfect intervals
              const delay = Math.random() * 2; // 0-2ms natural delay
              if (delay > 1) {
                setTimeout(() => listener.call(this, event), delay);
              } else {
                listener.call(this, event);
              }
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
    `;
  }

  static getKeyboardTimingNormalization(): string {
    return `
      // Keyboard Timing Pattern Normalization
      if (typeof document !== 'undefined') {
        let lastKeyTime = 0;
        let keyTimingHistory = [];
        
        const normalizeKeyboardEvent = function(originalListener, event) {
          const now = performance.now();
          const timeDelta = now - lastKeyTime;
          
          if (lastKeyTime > 0 && timeDelta > 0) {
            keyTimingHistory.push(timeDelta);
            if (keyTimingHistory.length > 20) {
              keyTimingHistory.shift();
            }
            
            // Analyze typing rhythm
            if (keyTimingHistory.length > 5) {
              const avgInterval = keyTimingHistory.reduce((a, b) => a + b, 0) / keyTimingHistory.length;
              const intervalVariation = keyTimingHistory.reduce((acc, interval) => 
                acc + Math.abs(interval - avgInterval), 0) / keyTimingHistory.length;
              
              // If typing is too consistent (robotic), add natural variation
              if (intervalVariation < 20 && avgInterval < 200) { // Less than 20ms variation
                const naturalDelay = 10 + Math.random() * 30; // 10-40ms natural variation
                setTimeout(() => originalListener.call(this, event), naturalDelay);
                lastKeyTime = now + naturalDelay;
                return;
              }
            }
          }
          
          lastKeyTime = now;
          originalListener.call(this, event);
        };
        
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if ((type === 'keydown' || type === 'keyup' || type === 'keypress') && typeof listener === 'function') {
            const normalizedListener = function(event) {
              normalizeKeyboardEvent.call(this, listener, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
    `;
  }

  static getScrollBehaviorNormalization(): string {
    return `
      // Scroll Behavior Pattern Normalization
      if (typeof window !== 'undefined') {
        let scrollHistory = [];
        let lastScrollTime = 0;
        
        // Override scroll events
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'scroll' && typeof listener === 'function') {
            const normalizedListener = function(event) {
              const now = performance.now();
              const scrollY = window.scrollY || document.documentElement.scrollTop;
              const scrollX = window.scrollX || document.documentElement.scrollLeft;
              
              if (lastScrollTime > 0) {
                const timeDelta = now - lastScrollTime;
                const lastScroll = scrollHistory[scrollHistory.length - 1];
                
                if (lastScroll) {
                  const deltaY = Math.abs(scrollY - lastScroll.y);
                  const deltaX = Math.abs(scrollX - lastScroll.x);
                  const scrollSpeed = (deltaY + deltaX) / timeDelta;
                  
                  scrollHistory.push({ x: scrollX, y: scrollY, time: now, speed: scrollSpeed });
                  if (scrollHistory.length > 10) {
                    scrollHistory.shift();
                  }
                  
                  // Detect robotic scrolling patterns
                  if (scrollHistory.length > 3) {
                    const speeds = scrollHistory.map(s => s.speed);
                    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
                    const speedVariation = speeds.reduce((acc, speed) => 
                      acc + Math.abs(speed - avgSpeed), 0) / speeds.length;
                    
                    // If scrolling is too uniform, add natural delays
                    if (speedVariation < 0.1 && avgSpeed > 1) {
                      const naturalDelay = 5 + Math.random() * 15; // 5-20ms delay
                      setTimeout(() => listener.call(this, event), naturalDelay);
                      return;
                    }
                  }
                }
              }
              
              scrollHistory.push({ x: scrollX, y: scrollY, time: now, speed: 0 });
              lastScrollTime = now;
              
              listener.call(this, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Override scroll methods to add natural behavior
        const originalScrollTo = window.scrollTo;
        const originalScrollBy = window.scrollBy;
        
        window.scrollTo = function(x, y) {
          // Convert number arguments to options object
          const options = typeof x === 'object' ? x : { left: x, top: y };
          
          // Add natural easing to programmatic scrolls
          const naturalOptions = {
            ...options,
            behavior: options.behavior || 'smooth'
          };
          
          // Add slight delay to prevent robotic timing
          setTimeout(() => {
            originalScrollTo.call(this, naturalOptions);
          }, Math.random() * 10);
        };
        
        window.scrollBy = function(x, y) {
          const options = typeof x === 'object' ? x : { left: x, top: y };
          
          const naturalOptions = {
            ...options,
            behavior: options.behavior || 'smooth'
          };
          
          setTimeout(() => {
            originalScrollBy.call(this, naturalOptions);
          }, Math.random() * 10);
        };
      }
    `;
  }

  static getClickPatternNormalization(): string {
    return `
      // Click Pattern Normalization
      if (typeof document !== 'undefined') {
        let clickHistory = [];
        let lastClickTime = 0;
        
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if ((type === 'click' || type === 'mousedown' || type === 'mouseup') && typeof listener === 'function') {
            const normalizedListener = function(event) {
              const now = performance.now();
              
              if (type === 'click') {
                const timeDelta = now - lastClickTime;
                
                if (lastClickTime > 0) {
                  clickHistory.push(timeDelta);
                  if (clickHistory.length > 15) {
                    clickHistory.shift();
                  }
                  
                  // Analyze click intervals
                  if (clickHistory.length > 5) {
                    const avgInterval = clickHistory.reduce((a, b) => a + b, 0) / clickHistory.length;
                    const intervalVariation = clickHistory.reduce((acc, interval) => 
                      acc + Math.abs(interval - avgInterval), 0) / clickHistory.length;
                    
                    // If clicks are too regular (robotic), add natural delay
                    if (intervalVariation < 50 && avgInterval < 1000) {
                      const humanDelay = 20 + Math.random() * 80; // 20-100ms human reaction delay
                      setTimeout(() => listener.call(this, event), humanDelay);
                      lastClickTime = now + humanDelay;
                      return;
                    }
                  }
                }
                
                lastClickTime = now;
              }
              
              // Add micro-delays for natural click processing
              const microDelay = Math.random() * 3; // 0-3ms natural processing delay
              if (microDelay > 2) {
                setTimeout(() => listener.call(this, event), microDelay);
              } else {
                listener.call(this, event);
              }
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
    `;
  }

  static getFocusPatternNormalization(): string {
    return `
      // Focus Pattern Normalization
      if (typeof document !== 'undefined') {
        let focusHistory = [];
        let lastFocusTime = 0;
        
        const normalizeFocusEvent = function(originalListener, event) {
          const now = performance.now();
          const timeDelta = now - lastFocusTime;
          
          if (lastFocusTime > 0) {
            focusHistory.push({ 
              element: event.target.tagName + (event.target.id ? '#' + event.target.id : ''),
              time: now,
              delta: timeDelta
            });
            
            if (focusHistory.length > 10) {
              focusHistory.shift();
            }
            
            // Detect robotic focus patterns
            if (focusHistory.length > 3) {
              const deltas = focusHistory.map(f => f.delta);
              const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
              const deltaVariation = deltas.reduce((acc, delta) => 
                acc + Math.abs(delta - avgDelta), 0) / deltas.length;
              
              // If focus changes are too uniform, add natural delay
              if (deltaVariation < 10 && avgDelta < 500) {
                const humanDelay = 50 + Math.random() * 150; // 50-200ms human focus delay
                setTimeout(() => originalListener.call(this, event), humanDelay);
                lastFocusTime = now + humanDelay;
                return;
              }
            }
          }
          
          lastFocusTime = now;
          
          // Natural focus processing delay
          const delay = 5 + Math.random() * 15; // 5-20ms
          setTimeout(() => originalListener.call(this, event), delay);
        };
        
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if ((type === 'focus' || type === 'blur' || type === 'focusin' || type === 'focusout') && typeof listener === 'function') {
            const normalizedListener = function(event) {
              normalizeFocusEvent.call(this, listener, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
    `;
  }

  static getAllBehavioralProtections(): string {
    return `
      ${this.getMouseMovementNormalization()}
      ${this.getKeyboardTimingNormalization()}
      ${this.getScrollBehaviorNormalization()}
      ${this.getClickPatternNormalization()}
      ${this.getFocusPatternNormalization()}
    `;
  }
}