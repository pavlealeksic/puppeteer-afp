"use strict";
/**
 * Comprehensive Advanced Protection Suite
 * Covers Performance API, Audio/WebRTC Advanced, Error Normalization, and Security Features
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprehensiveAdvancedProtection = void 0;
class ComprehensiveAdvancedProtection {
    // Advanced Performance API Protection
    static getAdvancedPerformanceProtection() {
        return `
      // Advanced Performance API Fingerprinting Protection
      if (typeof performance !== 'undefined') {
        // Override Performance Observer with advanced filtering
        if (typeof PerformanceObserver !== 'undefined') {
          const originalObserver = PerformanceObserver;
          const observedMetrics = new Map();
          
          PerformanceObserver = function(callback) {
            const normalizedCallback = function(list) {
              const entries = list.getEntries().map(entry => {
                const normalizedEntry = { ...entry };
                
                // Normalize all timing values to prevent fingerprinting
                ['startTime', 'duration', 'processingStart', 'processingEnd', 
                 'loadEventStart', 'loadEventEnd', 'domContentLoadedEventStart',
                 'domContentLoadedEventEnd', 'connectStart', 'connectEnd'].forEach(prop => {
                  if (typeof normalizedEntry[prop] === 'number') {
                    normalizedEntry[prop] = Math.round(normalizedEntry[prop] / 5) * 5; // Round to 5ms
                  }
                });
                
                // Remove hardware-specific measurements
                if (normalizedEntry.name && normalizedEntry.name.includes('gpu')) {
                  return null; // Filter out GPU-related entries
                }
                
                return normalizedEntry;
              }).filter(entry => entry !== null);
              
              return callback({ getEntries: () => entries });
            };
            
            return new originalObserver(normalizedCallback);
          };
          
          // Normalize supported entry types
          PerformanceObserver.supportedEntryTypes = [
            'navigation', 'resource', 'measure', 'mark', 'paint'
          ];
        }
        
        // Override memory measurements
        if (performance.memory) {
          Object.defineProperty(performance, 'memory', {
            get: () => ({
              usedJSHeapSize: 16777216 + Math.random() * 8388608, // 16-24MB
              totalJSHeapSize: 33554432 + Math.random() * 16777216, // 32-48MB
              jsHeapSizeLimit: 2147483648 // 2GB constant
            }),
            configurable: true
          });
        }
        
        // Override timeOrigin for consistency
        if ('timeOrigin' in performance) {
          Object.defineProperty(performance, 'timeOrigin', {
            get: () => Math.floor(Date.now() / 1000) * 1000, // Round to nearest second
            configurable: true
          });
        }
      }
    `;
    }
    // Advanced Audio Fingerprinting Protection
    static getAdvancedAudioProtection() {
        return `
      // Advanced Audio Fingerprinting Protection
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const AudioContextClass = AudioContext || webkitAudioContext;
        
        // Override AudioContext constructor
        const OriginalAudioContext = AudioContextClass;
        const audioContexts = new Set();
        
        AudioContext = function(contextOptions) {
          const context = new OriginalAudioContext(contextOptions);
          audioContexts.add(context);
          
          // Override createAnalyser for fingerprinting protection
          const originalCreateAnalyser = context.createAnalyser;
          context.createAnalyser = function() {
            const analyser = originalCreateAnalyser.call(this);
            
            // Override getFloatFrequencyData to add noise
            const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
            analyser.getFloatFrequencyData = function(array) {
              originalGetFloatFrequencyData.call(this, array);
              
              // Add consistent noise to prevent fingerprinting
              for (let i = 0; i < array.length; i++) {
                const noise = (Math.random() - 0.5) * 0.1;
                array[i] += noise;
              }
            };
            
            // Override getByteFrequencyData
            const originalGetByteFrequencyData = analyser.getByteFrequencyData;
            analyser.getByteFrequencyData = function(array) {
              originalGetByteFrequencyData.call(this, array);
              
              for (let i = 0; i < array.length; i++) {
                const noise = Math.floor((Math.random() - 0.5) * 2);
                array[i] = Math.max(0, Math.min(255, array[i] + noise));
              }
            };
            
            return analyser;
          };
          
          // Override createOscillator for timing consistency
          const originalCreateOscillator = context.createOscillator;
          context.createOscillator = function() {
            const oscillator = originalCreateOscillator.call(this);
            
            // Add slight frequency variations
            const originalFrequency = oscillator.frequency;
            Object.defineProperty(oscillator, 'frequency', {
              get: () => {
                const param = originalFrequency;
                const originalValue = param.value;
                
                // Add micro-variations to frequency
                Object.defineProperty(param, 'value', {
                  get: () => originalValue + (Math.random() - 0.5) * 0.1,
                  set: (val) => { originalValue = val; }
                });
                
                return param;
              }
            });
            
            return oscillator;
          };
          
          // Override createConvolver for impulse response protection
          const originalCreateConvolver = context.createConvolver;
          context.createConvolver = function() {
            const convolver = originalCreateConvolver.call(this);
            
            // Override buffer setter to normalize impulse responses
            Object.defineProperty(convolver, 'buffer', {
              get: () => convolver._normalizedBuffer || null,
              set: (buffer) => {
                if (buffer) {
                  // Create normalized version
                  const normalizedBuffer = context.createBuffer(
                    buffer.numberOfChannels,
                    Math.min(buffer.length, 8192), // Limit buffer size
                    buffer.sampleRate
                  );
                  
                  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                    const sourceData = buffer.getChannelData(channel);
                    const normalizedData = normalizedBuffer.getChannelData(channel);
                    
                    // Add noise and normalize
                    for (let i = 0; i < normalizedData.length; i++) {
                      const noise = (Math.random() - 0.5) * 0.001;
                      normalizedData[i] = sourceData[i] + noise;
                    }
                  }
                  
                  convolver._normalizedBuffer = normalizedBuffer;
                } else {
                  convolver._normalizedBuffer = null;
                }
              }
            });
            
            return convolver;
          };
          
          return context;
        };
        
        // Preserve prototype and properties
        Object.setPrototypeOf(AudioContext, OriginalAudioContext);
        AudioContext.prototype = OriginalAudioContext.prototype;
        
        if (webkitAudioContext) {
          webkitAudioContext = AudioContext;
        }
      }
    `;
    }
    // Advanced WebRTC Protection
    static getAdvancedWebRTCProtection() {
        return `
      // Advanced WebRTC Fingerprinting Protection
      if (typeof RTCPeerConnection !== 'undefined' || typeof webkitRTCPeerConnection !== 'undefined') {
        const RTCPeerConnectionClass = RTCPeerConnection || webkitRTCPeerConnection;
        
        // Override RTCPeerConnection
        const OriginalRTCPeerConnection = RTCPeerConnectionClass;
        
        RTCPeerConnection = function(configuration) {
          // Filter ICE servers to prevent fingerprinting
          const normalizedConfig = {
            ...configuration,
            iceServers: [
              { urls: ['stun:stun.l.google.com:19302'] } // Standard STUN server only
            ],
            iceTransportPolicy: 'all',
            bundlePolicy: 'balanced'
          };
          
          const pc = new OriginalRTCPeerConnection(normalizedConfig);
          
          // Override createOffer to normalize SDP
          const originalCreateOffer = pc.createOffer;
          pc.createOffer = async function(options) {
            const offer = await originalCreateOffer.call(this, options);
            
            // Normalize SDP to remove fingerprinting data
            if (offer.sdp) {
              offer.sdp = offer.sdp
                .replace(/a=fingerprint:.*/g, 'a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99')
                .replace(/c=IN IP4 .*/g, 'c=IN IP4 192.168.1.1')
                .replace(/a=candidate:.*/g, ''); // Remove ICE candidates
            }
            
            return offer;
          };
          
          // Override createAnswer
          const originalCreateAnswer = pc.createAnswer;
          pc.createAnswer = async function(options) {
            const answer = await originalCreateAnswer.call(this, options);
            
            if (answer.sdp) {
              answer.sdp = answer.sdp
                .replace(/a=fingerprint:.*/g, 'a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99')
                .replace(/c=IN IP4 .*/g, 'c=IN IP4 192.168.1.1');
            }
            
            return answer;
          };
          
          // Override getStats to normalize statistics
          const originalGetStats = pc.getStats;
          pc.getStats = async function(selector) {
            const stats = await originalGetStats.call(this, selector);
            
            // Create normalized stats
            const normalizedStats = new Map();
            
            stats.forEach((report, id) => {
              const normalizedReport = { ...report };
              
              // Remove identifying information
              delete normalizedReport.googLocalAddress;
              delete normalizedReport.googRemoteAddress;
              delete normalizedReport.googLocalCandidateType;
              delete normalizedReport.googRemoteCandidateType;
              delete normalizedReport.localCandidateId;
              delete normalizedReport.remoteCandidateId;
              
              // Normalize timing values
              if (normalizedReport.timestamp) {
                normalizedReport.timestamp = Math.round(normalizedReport.timestamp / 1000) * 1000;
              }
              
              normalizedStats.set(id, normalizedReport);
            });
            
            return normalizedStats;
          };
          
          return pc;
        };
        
        Object.setPrototypeOf(RTCPeerConnection, OriginalRTCPeerConnection);
        RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
        
        if (webkitRTCPeerConnection) {
          webkitRTCPeerConnection = RTCPeerConnection;
        }
      }
      
      // Override MediaStreamTrack for additional protection
      if (typeof MediaStreamTrack !== 'undefined') {
        const originalGetCapabilities = MediaStreamTrack.prototype.getCapabilities;
        
        MediaStreamTrack.prototype.getCapabilities = function() {
          const capabilities = originalGetCapabilities ? originalGetCapabilities.call(this) : {};
          
          // Normalize capabilities to prevent device fingerprinting
          return {
            width: { min: 320, max: 1920 },
            height: { min: 240, max: 1080 },
            frameRate: { min: 15, max: 30 },
            facingMode: ['user', 'environment'],
            resizeMode: ['none', 'crop-and-scale'],
            deviceId: 'default'
          };
        };
      }
    `;
    }
    // Error Pattern Normalization
    static getErrorPatternNormalization() {
        return `
      // Error Pattern Normalization
      if (typeof Error !== 'undefined') {
        // Override Error constructor to normalize stack traces
        const OriginalError = Error;
        
        Error = function(message) {
          const error = new OriginalError(message);
          
          // Normalize stack trace format
          if (error.stack) {
            error.stack = error.stack
              .replace(/file:\\/\\/\\/.*?\\//g, 'file:///')  // Remove file paths
              .replace(/https?:\\/\\/[^\\/]+/g, 'https://example.com')  // Normalize domains
              .replace(/line \\d+/g, 'line 1')  // Normalize line numbers
              .replace(/column \\d+/g, 'column 1')  // Normalize column numbers
              .replace(/:\\d+:\\d+/g, ':1:1')  // Normalize line:column format
              .split('\\n').slice(0, 10).join('\\n');  // Limit stack depth
          }
          
          return error;
        };
        
        Error.prototype = OriginalError.prototype;
        Object.setPrototypeOf(Error, OriginalError);
        
        // Override console methods to normalize error logging
        if (typeof console !== 'undefined') {
          const consoleMethods = ['error', 'warn', 'log', 'info', 'debug'];
          
          consoleMethods.forEach(method => {
            const originalMethod = console[method];
            console[method] = function(...args) {
              // Normalize error objects in console output
              const normalizedArgs = args.map(arg => {
                if (arg instanceof Error && arg.stack) {
                  const normalizedError = new Error(arg.message);
                  normalizedError.name = arg.name;
                  normalizedError.stack = arg.stack
                    .replace(/file:\\/\\/\\/.*?\\//g, 'file:///')
                    .replace(/https?:\\/\\/[^\\/]+/g, 'https://example.com')
                    .split('\\n').slice(0, 5).join('\\n');
                  return normalizedError;
                }
                return arg;
              });
              
              return originalMethod.apply(this, normalizedArgs);
            };
          });
        }
      }
    `;
    }
    // Security Feature Fingerprinting Protection
    static getSecurityFeatureProtection() {
        return `
      // Security Feature Fingerprinting Protection
      if (typeof document !== 'undefined') {
        // Override document.domain to prevent domain-based fingerprinting
        Object.defineProperty(document, 'domain', {
          get: () => 'localhost',
          set: () => {}, // Ignore attempts to set domain
          configurable: true
        });
        
        // Override document.cookie to prevent cookie-based fingerprinting
        let simulatedCookies = '';
        Object.defineProperty(document, 'cookie', {
          get: () => simulatedCookies,
          set: (value) => {
            // Filter out tracking cookies
            if (!value.includes('_ga') && !value.includes('_gid') && !value.includes('__utma')) {
              simulatedCookies = value;
            }
          },
          configurable: true
        });
        
        // Override document.referrer to prevent referrer-based fingerprinting
        Object.defineProperty(document, 'referrer', {
          get: () => '',
          configurable: true
        });
      }
      
      // Override Notification API to prevent permission-based fingerprinting
      if (typeof Notification !== 'undefined') {
        Object.defineProperty(Notification, 'permission', {
          get: () => 'default',
          configurable: true
        });
        
        const originalRequestPermission = Notification.requestPermission;
        Notification.requestPermission = async function() {
          return 'denied'; // Always deny for consistency
        };
      }
      
      // Override Geolocation API
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
        const originalWatchPosition = navigator.geolocation.watchPosition;
        
        navigator.geolocation.getCurrentPosition = function(success, error, options) {
          if (error) {
            setTimeout(() => error({
              code: 1, // PERMISSION_DENIED
              message: 'Geolocation access denied'
            }), 100);
          }
        };
        
        navigator.geolocation.watchPosition = function(success, error, options) {
          if (error) {
            setTimeout(() => error({
              code: 1,
              message: 'Geolocation access denied'
            }), 100);
          }
          return 1; // Return fake watch ID
        };
      }
      
      // Override DeviceMotionEvent and DeviceOrientationEvent permissions
      if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
        const originalRequestPermission = DeviceMotionEvent.requestPermission;
        DeviceMotionEvent.requestPermission = async function() {
          return 'denied';
        };
      }
      
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        const originalRequestPermission = DeviceOrientationEvent.requestPermission;
        DeviceOrientationEvent.requestPermission = async function() {
          return 'denied';
        };
      }
    `;
    }
    static getAllComprehensiveAdvancedProtections() {
        return `
      ${this.getAdvancedPerformanceProtection()}
      ${this.getAdvancedAudioProtection()}
      ${this.getAdvancedWebRTCProtection()}
      ${this.getErrorPatternNormalization()}
      ${this.getSecurityFeatureProtection()}
    `;
    }
}
exports.ComprehensiveAdvancedProtection = ComprehensiveAdvancedProtection;
//# sourceMappingURL=comprehensive-advanced.js.map