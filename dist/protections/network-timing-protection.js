"use strict";
/**
 * Network Timing Fingerprinting Protection
 * Provides comprehensive protection against network timing-based fingerprinting techniques
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkTimingProtection = void 0;
class NetworkTimingProtection {
    static getFetchTimingProtection() {
        return `
      // Fetch API Timing Protection
      if (typeof fetch !== 'undefined') {
        const originalFetch = fetch;
        
        fetch = async function(input, init) {
          const startTime = performance.now();
          
          try {
            // Add consistent minimum delay to normalize timing patterns
            const minDelay = 10 + Math.random() * 20; // 10-30ms base delay
            await new Promise(resolve => setTimeout(resolve, minDelay));
            
            const response = await originalFetch.call(this, input, init);
            
            // Create normalized response wrapper
            const normalizedResponse = new Proxy(response, {
              get: function(target, property) {
                if (property === 'headers') {
                  // Normalize timing-related headers
                  const headers = target.headers;
                  const normalizedHeaders = new Headers();
                  
                  // Copy headers but normalize timing-sensitive ones
                  headers.forEach((value, name) => {
                    if (name.toLowerCase().includes('timing') || 
                        name.toLowerCase().includes('age') ||
                        name.toLowerCase().includes('date')) {
                      // Don't expose precise timing headers
                      return;
                    }
                    normalizedHeaders.set(name, value);
                  });
                  
                  return normalizedHeaders;
                }
                
                return target[property];
              }
            });
            
            const endTime = performance.now();
            const actualDuration = endTime - startTime;
            
            // Ensure minimum response time for consistency
            const targetDuration = Math.max(50, Math.round(actualDuration / 10) * 10); // Round to 10ms
            if (actualDuration < targetDuration) {
              await new Promise(resolve => 
                setTimeout(resolve, targetDuration - actualDuration)
              );
            }
            
            return normalizedResponse;
          } catch (error) {
            // Normalize error timing as well
            const errorDelay = 20 + Math.random() * 10; // 20-30ms for errors
            await new Promise(resolve => setTimeout(resolve, errorDelay));
            throw error;
          }
        };
        
        // Preserve fetch properties
        Object.setPrototypeOf(fetch, originalFetch);
        Object.defineProperty(fetch, 'name', { value: 'fetch' });
      }
    `;
    }
    static getXHRTimingProtection() {
        return `
      // XMLHttpRequest Timing Protection
      if (typeof XMLHttpRequest !== 'undefined') {
        const OriginalXHR = XMLHttpRequest;
        
        XMLHttpRequest = function() {
          const xhr = new OriginalXHR();
          const requestStartTimes = new Map();
          
          // Override open to track request start
          const originalOpen = xhr.open;
          xhr.open = function(method, url, async, user, password) {
            requestStartTimes.set(this, performance.now());
            return originalOpen.call(this, method, url, async, user, password);
          };
          
          // Override send to add timing normalization
          const originalSend = xhr.send;
          xhr.send = function(body) {
            const startTime = requestStartTimes.get(this) || performance.now();
            
            // Add base delay for consistency
            setTimeout(() => {
              originalSend.call(this, body);
            }, 5 + Math.random() * 10); // 5-15ms delay
            
            // Override readystatechange to normalize response timing
            const originalOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function(event) {
              if (this.readyState === 4) { // DONE
                const now = performance.now();
                const duration = now - startTime;
                
                // Ensure minimum response time
                const minDuration = 20; // 20ms minimum
                if (duration < minDuration) {
                  setTimeout(() => {
                    if (originalOnReadyStateChange) {
                      originalOnReadyStateChange.call(this, event);
                    }
                  }, minDuration - duration);
                  return;
                }
              }
              
              if (originalOnReadyStateChange) {
                originalOnReadyStateChange.call(this, event);
              }
            };
          };
          
          // Override addEventListener for timing events
          const originalAddEventListener = xhr.addEventListener;
          xhr.addEventListener = function(type, listener, options) {
            if (type === 'load' || type === 'loadend' || type === 'readystatechange') {
              const normalizedListener = function(event) {
                // Add slight delay to normalize event timing
                setTimeout(() => listener.call(this, event), 1 + Math.random() * 3);
              };
              return originalAddEventListener.call(this, type, normalizedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
          };
          
          return xhr;
        };
        
        // Preserve XMLHttpRequest prototype
        XMLHttpRequest.prototype = OriginalXHR.prototype;
        Object.setPrototypeOf(XMLHttpRequest, OriginalXHR);
      }
    `;
    }
    static getWebSocketTimingProtection() {
        return `
      // WebSocket Timing Protection
      if (typeof WebSocket !== 'undefined') {
        const OriginalWebSocket = WebSocket;
        
        WebSocket = function(url, protocols) {
          const ws = new OriginalWebSocket(url, protocols);
          const connectionStart = performance.now();
          
          // Override event handlers to normalize timing
          const eventTypes = ['open', 'message', 'close', 'error'];
          eventTypes.forEach(eventType => {
            const originalHandler = ws['on' + eventType];
            ws['on' + eventType] = function(event) {
              const now = performance.now();
              const elapsed = now - connectionStart;
              
              // Add consistent delays based on event type
              const delays = {
                'open': 20 + Math.random() * 30,    // 20-50ms for connection
                'message': 1 + Math.random() * 5,   // 1-6ms for messages
                'close': 10 + Math.random() * 10,   // 10-20ms for close
                'error': 5 + Math.random() * 5      // 5-10ms for errors
              };
              
              const delay = delays[eventType] || 0;
              setTimeout(() => {
                if (originalHandler) {
                  originalHandler.call(this, event);
                }
              }, delay);
            };
          });
          
          // Override addEventListener for timing normalization
          const originalAddEventListener = ws.addEventListener;
          ws.addEventListener = function(type, listener, options) {
            if (['open', 'message', 'close', 'error'].includes(type)) {
              const normalizedListener = function(event) {
                const delays = {
                  'open': 20 + Math.random() * 30,
                  'message': 1 + Math.random() * 5,
                  'close': 10 + Math.random() * 10,
                  'error': 5 + Math.random() * 5
                };
                
                setTimeout(() => listener.call(this, event), delays[type] || 0);
              };
              
              return originalAddEventListener.call(this, type, normalizedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
          };
          
          // Override send to add timing consistency
          const originalSend = ws.send;
          ws.send = function(data) {
            // Add small delay to normalize send timing
            setTimeout(() => {
              originalSend.call(this, data);
            }, Math.random() * 2); // 0-2ms delay
          };
          
          return ws;
        };
        
        // Preserve WebSocket prototype and properties
        WebSocket.prototype = OriginalWebSocket.prototype;
        Object.setPrototypeOf(WebSocket, OriginalWebSocket);
        WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
        WebSocket.OPEN = OriginalWebSocket.OPEN;
        WebSocket.CLOSING = OriginalWebSocket.CLOSING;
        WebSocket.CLOSED = OriginalWebSocket.CLOSED;
      }
    `;
    }
    static getResourceTimingProtection() {
        return `
      // Resource Timing API Protection
      if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        const originalGetEntriesByType = performance.getEntriesByType;
        const originalGetEntriesByName = performance.getEntriesByName;
        
        performance.getEntriesByType = function(type) {
          const entries = originalGetEntriesByType.call(this, type);
          
          if (type === 'resource' || type === 'navigation') {
            // Normalize timing entries to prevent fingerprinting
            return entries.map(entry => ({
              ...entry,
              connectEnd: Math.round(entry.connectEnd / 10) * 10,
              connectStart: Math.round(entry.connectStart / 10) * 10,
              domainLookupEnd: Math.round(entry.domainLookupEnd / 10) * 10,
              domainLookupStart: Math.round(entry.domainLookupStart / 10) * 10,
              fetchStart: Math.round(entry.fetchStart / 10) * 10,
              redirectEnd: Math.round(entry.redirectEnd / 10) * 10,
              redirectStart: Math.round(entry.redirectStart / 10) * 10,
              requestStart: Math.round(entry.requestStart / 10) * 10,
              responseEnd: Math.round(entry.responseEnd / 10) * 10,
              responseStart: Math.round(entry.responseStart / 10) * 10,
              secureConnectionStart: entry.secureConnectionStart > 0 ? 
                Math.round(entry.secureConnectionStart / 10) * 10 : 0,
              startTime: Math.round(entry.startTime / 10) * 10,
              duration: Math.round(entry.duration / 10) * 10,
              // Remove potentially identifying information
              nextHopProtocol: 'h2', // Always report HTTP/2 for consistency
              transferSize: Math.round(entry.transferSize / 1024) * 1024, // Round to KB
              encodedBodySize: Math.round(entry.encodedBodySize / 1024) * 1024,
              decodedBodySize: Math.round(entry.decodedBodySize / 1024) * 1024
            }));
          }
          
          return entries;
        };
        
        performance.getEntriesByName = function(name, type) {
          const entries = originalGetEntriesByName.call(this, name, type);
          
          if (type === 'resource' || type === 'navigation') {
            return entries.map(entry => ({
              ...entry,
              connectEnd: Math.round(entry.connectEnd / 10) * 10,
              connectStart: Math.round(entry.connectStart / 10) * 10,
              domainLookupEnd: Math.round(entry.domainLookupEnd / 10) * 10,
              domainLookupStart: Math.round(entry.domainLookupStart / 10) * 10,
              duration: Math.round(entry.duration / 10) * 10,
              fetchStart: Math.round(entry.fetchStart / 10) * 10,
              responseEnd: Math.round(entry.responseEnd / 10) * 10,
              responseStart: Math.round(entry.responseStart / 10) * 10,
              startTime: Math.round(entry.startTime / 10) * 10,
              nextHopProtocol: 'h2',
              transferSize: Math.round(entry.transferSize / 1024) * 1024
            }));
          }
          
          return entries;
        };
      }
    `;
    }
    static getConnectionTimingProtection() {
        return `
      // Connection Timing Protection
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = navigator.connection;
        
        if (connection && 'addEventListener' in connection) {
          // Override connection change events to normalize timing
          const originalAddEventListener = connection.addEventListener;
          connection.addEventListener = function(type, listener, options) {
            if (type === 'change' && typeof listener === 'function') {
              const normalizedListener = function(event) {
                // Add delay to prevent precise timing analysis
                setTimeout(() => {
                  listener.call(this, event);
                }, 100 + Math.random() * 200); // 100-300ms delay
              };
              
              return originalAddEventListener.call(this, type, normalizedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
          };
        }
      }
      
      // Override EventSource timing for server-sent events
      if (typeof EventSource !== 'undefined') {
        const OriginalEventSource = EventSource;
        
        EventSource = function(url, eventSourceInitDict) {
          const es = new OriginalEventSource(url, eventSourceInitDict);
          
          // Override event handlers to add timing protection
          ['open', 'message', 'error'].forEach(eventType => {
            const originalHandler = es['on' + eventType];
            es['on' + eventType] = function(event) {
              // Add consistent delay based on event type
              const delay = eventType === 'message' ? 
                Math.random() * 5 : // 0-5ms for messages
                10 + Math.random() * 10; // 10-20ms for open/error
              
              setTimeout(() => {
                if (originalHandler) {
                  originalHandler.call(this, event);
                }
              }, delay);
            };
          });
          
          return es;
        };
        
        EventSource.prototype = OriginalEventSource.prototype;
        Object.setPrototypeOf(EventSource, OriginalEventSource);
        EventSource.CONNECTING = OriginalEventSource.CONNECTING;
        EventSource.OPEN = OriginalEventSource.OPEN;
        EventSource.CLOSED = OriginalEventSource.CLOSED;
      }
    `;
    }
    static getAllNetworkTimingProtections() {
        return `
      ${this.getFetchTimingProtection()}
      ${this.getXHRTimingProtection()}
      ${this.getWebSocketTimingProtection()}
      ${this.getResourceTimingProtection()}
      ${this.getConnectionTimingProtection()}
    `;
    }
}
exports.NetworkTimingProtection = NetworkTimingProtection;
//# sourceMappingURL=network-timing-protection.js.map