/**
 * F.vision Privacy Test Protection
 * Targets privacy leaks detected by F.vision checker
 */

export class FVisionProtection {

  static getFVisionProtection(): string {
    return `
      // F.vision Privacy Protection
      (function() {
        'use strict';
        
        const consistentData = window.__fingerprintConsistency || {};
        
        // 1. IP Address Leaks Protection (WebRTC)
        if (typeof RTCPeerConnection !== 'undefined') {
          const OriginalRTCPeerConnection = RTCPeerConnection;
          
          RTCPeerConnection = function(configuration, constraints) {
            // Filter out STUN servers that could leak IP
            if (configuration && configuration.iceServers) {
              configuration.iceServers = configuration.iceServers.filter(server => {
                if (typeof server.urls === 'string') {
                  return !server.urls.startsWith('stun:');
                } else if (Array.isArray(server.urls)) {
                  server.urls = server.urls.filter(url => !url.startsWith('stun:'));
                  return server.urls.length > 0;
                }
                return true;
              });
            }
            
            const connection = new OriginalRTCPeerConnection(configuration, constraints);
            
            // Override createDataChannel to prevent fingerprinting
            const originalCreateDataChannel = connection.createDataChannel;
            connection.createDataChannel = function(label, dataChannelDict) {
              // Use generic channel configuration
              return originalCreateDataChannel.call(this, 'channel', {
                ordered: true,
                maxRetransmits: 3
              });
            };
            
            return connection;
          };
          
          RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
          Object.setPrototypeOf(RTCPeerConnection, OriginalRTCPeerConnection);
        }
        
        // 2. DNS Leaks Protection
        if (typeof fetch !== 'undefined') {
          const originalFetch = fetch;
          window.fetch = function(input, init) {
            // Block requests to IP lookup services
            const url = typeof input === 'string' ? input : input.url;
            const blockedDomains = [
              'ipapi.co',
              'httpbin.org/ip',
              'icanhazip.com',
              'ifconfig.me',
              'whatismyipaddress.com',
              'ipecho.net',
              'api.ipify.org'
            ];
            
            if (blockedDomains.some(domain => url.includes(domain))) {
              return Promise.reject(new Error('Network error'));
            }
            
            return originalFetch.call(this, input, init);
          };
        }
        
        // 3. Local Storage Privacy Protection
        if (typeof Storage !== 'undefined') {
          // Override localStorage to return consistent, limited data
          const originalLocalStorageSetItem = localStorage.setItem;
          const originalLocalStorageGetItem = localStorage.getItem;
          const originalLocalStorageRemoveItem = localStorage.removeItem;
          const originalLocalStorageClear = localStorage.clear;
          
          const allowedKeys = ['theme', 'language', 'preferences'];
          
          localStorage.setItem = function(key, value) {
            if (allowedKeys.includes(key)) {
              return originalLocalStorageSetItem.call(this, key, value);
            }
            // Silently ignore other keys
          };
          
          localStorage.getItem = function(key) {
            if (allowedKeys.includes(key)) {
              return originalLocalStorageGetItem.call(this, key);
            }
            return null;
          };
          
          localStorage.removeItem = function(key) {
            if (allowedKeys.includes(key)) {
              return originalLocalStorageRemoveItem.call(this, key);
            }
          };
          
          localStorage.clear = function() {
            allowedKeys.forEach(key => {
              originalLocalStorageRemoveItem.call(this, key);
            });
          };
          
          // Same for sessionStorage
          const originalSessionStorageSetItem = sessionStorage.setItem;
          const originalSessionStorageGetItem = sessionStorage.getItem;
          
          sessionStorage.setItem = function(key, value) {
            if (allowedKeys.includes(key)) {
              return originalSessionStorageSetItem.call(this, key, value);
            }
          };
          
          sessionStorage.getItem = function(key) {
            if (allowedKeys.includes(key)) {
              return originalSessionStorageGetItem.call(this, key);
            }
            return null;
          };
        }
        
        // 4. Referrer Policy Protection
        if (typeof document !== 'undefined') {
          // Ensure referrer is not leaked
          Object.defineProperty(document, 'referrer', {
            get: () => '',
            configurable: true
          });
          
          // Override link creation to add noreferrer
          const originalCreateElement = document.createElement;
          document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'a') {
              element.rel = 'noreferrer noopener';
            }
            
            return element;
          };
        }
        
        // 5. Cookie Privacy Protection
        if (typeof document !== 'undefined') {
          const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
                                         Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
          
          if (originalCookieDescriptor) {
            Object.defineProperty(document, 'cookie', {
              get: function() {
                // Return only essential cookies
                const fullCookies = originalCookieDescriptor.get.call(this);
                const allowedCookies = ['session', 'auth', 'csrf'];
                
                return fullCookies.split('; ').filter(cookie => {
                  const name = cookie.split('=')[0];
                  return allowedCookies.some(allowed => name.includes(allowed));
                }).join('; ');
              },
              set: function(value) {
                // Only allow essential cookies
                const cookieName = value.split('=')[0];
                const allowedCookies = ['session', 'auth', 'csrf'];
                
                if (allowedCookies.some(allowed => cookieName.includes(allowed))) {
                  return originalCookieDescriptor.set.call(this, value);
                }
                // Silently ignore other cookies
              }
            });
          }
        }
        
        // 6. User Media Privacy Protection
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
          navigator.mediaDevices.getUserMedia = function(constraints) {
            // Reject all media access requests
            return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
          };
          
          // Also handle legacy getUserMedia
          if (navigator.getUserMedia) {
            navigator.getUserMedia = function(constraints, success, error) {
              if (error) {
                error(new DOMException('Permission denied', 'NotAllowedError'));
              }
            };
          }
        }
        
        // 7. Notification Privacy Protection
        if (typeof Notification !== 'undefined') {
          Object.defineProperty(Notification, 'permission', {
            get: () => 'denied',
            configurable: true
          });
          
          const originalRequestPermission = Notification.requestPermission;
          Notification.requestPermission = function() {
            return Promise.resolve('denied');
          };
        }
        
        // 8. Clipboard Privacy Protection
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.readText = function() {
            return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
          };
          
          navigator.clipboard.read = function() {
            return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
          };
          
          navigator.clipboard.writeText = function(text) {
            return Promise.resolve(); // Pretend to succeed but don't actually write
          };
        }
        
        // 9. Sensor API Privacy Protection
        if (typeof DeviceOrientationEvent !== 'undefined') {
          // Block device orientation events
          const originalAddEventListener = EventTarget.prototype.addEventListener;
          EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'deviceorientation' || type === 'devicemotion' || type === 'compassneedscalibration') {
              // Don't actually add the event listener
              return;
            }
            return originalAddEventListener.call(this, type, listener, options);
          };
        }
        
        // 10. Gamepad API Privacy Protection
        if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
          navigator.getGamepads = function() {
            return [null, null, null, null]; // Return empty gamepad array
          };
        }
        
        // 11. Vibration API Privacy Protection
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate = function() {
            return false; // Pretend vibration is not supported
          };
        }
        
        // 12. Ambient Light Sensor Privacy Protection
        if (typeof window !== 'undefined' && 'DeviceLightEvent' in window) {
          window.addEventListener = function(type, listener, options) {
            if (type === 'devicelight') {
              // Don't add ambient light event listeners
              return;
            }
            return EventTarget.prototype.addEventListener.call(this, type, listener, options);
          };
        }
      })();
    `;
  }
}