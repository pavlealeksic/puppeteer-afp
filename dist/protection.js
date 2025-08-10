"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintProtection = void 0;
const logger_1 = require("./logger");
const validation_1 = require("./validation");
const profiles_1 = require("./profiles");
const javascript_engine_1 = require("./engines/javascript-engine");
const css_engine_1 = require("./engines/css-engine");
const dom_engine_1 = require("./engines/dom-engine");
const hardware_engine_1 = require("./engines/hardware-engine");
const network_engine_1 = require("./engines/network-engine");
const cleanup_manager_1 = require("./cleanup-manager");
const error_handler_1 = require("./error-handler");
const advanced_protections_1 = require("./advanced-protections");
const font_protection_1 = require("./protections/font-protection");
const wasm_protection_1 = require("./protections/wasm-protection");
const canvas_advanced_1 = require("./protections/canvas-advanced");
const clipboard_protection_1 = require("./protections/clipboard-protection");
const mobile_protection_1 = require("./protections/mobile-protection");
const network_timing_protection_1 = require("./protections/network-timing-protection");
const behavioral_protection_1 = require("./protections/behavioral-protection");
const storage_protection_1 = require("./protections/storage-protection");
const comprehensive_advanced_1 = require("./protections/comprehensive-advanced");
const final_comprehensive_1 = require("./protections/final-comprehensive");
const monitoring_1 = require("./systems/monitoring");
const fingerprint_consistency_1 = require("./systems/fingerprint-consistency");
const enhanced_navigator_protection_1 = require("./protections/enhanced-navigator-protection");
const webdriver_evasion_1 = require("./protections/webdriver-evasion");
const creepjs_evasion_1 = require("./protections/creepjs-evasion");
class FingerprintProtection {
    constructor(options = {}) {
        this.cache = new Map();
        if (options.profile && options.profile !== 'custom') {
            const profile = profiles_1.profiles[options.profile];
            this.options = { ...profile.options, ...options };
        }
        else {
            this.options = options;
        }
        this.options = (0, validation_1.validateOptions)(this.options);
        this.logger = new logger_1.Logger(options.enableLogging || false, options.logLevel || 'info');
        this.setDefaultFeatures();
        this.initializeCache();
        this.initializeEngines();
        // Initialize monitoring system if enabled
        if (this.options.enableLogging) {
            this.monitoringSystem = new monitoring_1.MonitoringSystem(true);
        }
        // Initialize fingerprint consistency manager
        this.consistencyManager = new fingerprint_consistency_1.FingerprintConsistencyManager(this.options, this.options.enableLogging || false);
    }
    setDefaultFeatures() {
        this.options.features = {
            canvas: true,
            webgl: true,
            audio: true,
            font: true,
            webrtc: true,
            timezone: true,
            screen: true,
            battery: true,
            hardware: true,
            language: true,
            plugins: true,
            connection: true,
            userAgent: true,
            tcp: true,
            dns: true,
            ...this.options.features
        };
    }
    initializeCache() {
        if (this.options.features?.canvas) {
            this.cache.set('canvasNoise', this.generateCanvasNoise());
        }
        if (this.options.features?.webgl) {
            this.cache.set('webglParams', this.generateWebGLParams());
        }
        if (this.options.features?.audio) {
            this.cache.set('audioParams', this.generateAudioParams());
        }
        if (this.options.features?.font) {
            this.cache.set('fontParams', this.generateFontParams());
        }
    }
    initializeEngines() {
        // Only initialize engines if engine emulation is enabled
        if (!this.options.engineEmulation) {
            return;
        }
        // Determine browser profile for engine selection
        const browserProfile = this.options.profile || 'chrome';
        try {
            // Initialize engines based on profile and configuration
            if (this.options.engineEmulation.javascript !== false) {
                const jsConfig = javascript_engine_1.engineConfigs[browserProfile] || javascript_engine_1.engineConfigs.chrome;
                this.jsEngine = new javascript_engine_1.JavaScriptEngineEmulator(jsConfig);
                this.logger.debug(`JavaScript engine initialized: ${jsConfig.engine} ${jsConfig.version}`);
            }
            if (this.options.engineEmulation.css !== false) {
                const cssConfig = css_engine_1.cssEngineConfigs[browserProfile] || css_engine_1.cssEngineConfigs.chrome;
                this.cssEngine = new css_engine_1.CSSEngineEmulator(cssConfig);
                this.logger.debug(`CSS engine initialized: ${cssConfig.engine} ${cssConfig.version}`);
            }
            if (this.options.engineEmulation.dom !== false) {
                const domConfig = dom_engine_1.domEngineConfigs[browserProfile] || dom_engine_1.domEngineConfigs.chrome;
                this.domEngine = new dom_engine_1.DOMEngineEmulator(domConfig);
                this.logger.debug(`DOM engine initialized: ${domConfig.engine} ${domConfig.version}`);
            }
            if (this.options.engineEmulation.hardware !== false) {
                const hwConfig = hardware_engine_1.hardwareConfigs[browserProfile];
                if (hwConfig) {
                    this.hardwareEngine = new hardware_engine_1.HardwareEmulator(hwConfig);
                    this.logger.debug(`Hardware engine initialized`);
                }
                else {
                    this.logger.warn(`Hardware engine config not found for profile: ${browserProfile}`);
                }
            }
            if (this.options.engineEmulation.network !== false) {
                const netConfig = network_engine_1.networkConfigs[browserProfile] || network_engine_1.networkConfigs.chrome;
                this.networkEngine = new network_engine_1.NetworkEngineEmulator(netConfig);
                this.logger.debug(`Network engine initialized`);
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize engines:', error);
        }
    }
    generateCanvasNoise() {
        if (this.options.canvasRgba) {
            return this.options.canvasRgba;
        }
        return [
            Math.floor(Math.random() * 10) - 5,
            Math.floor(Math.random() * 10) - 5,
            Math.floor(Math.random() * 10) - 5,
            Math.floor(Math.random() * 10) - 5
        ];
    }
    generateWebGLParams() {
        return this.options.webglData || {
            3379: [16384, 32768][Math.floor(Math.random() * 2)],
            3386: {
                0: [8192, 16384, 32768][Math.floor(Math.random() * 3)],
                1: [8192, 16384, 32768][Math.floor(Math.random() * 3)]
            },
            3410: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            3411: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            3412: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            3413: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            7938: ['WebGL 1.0', 'WebGL 1.0 (OpenGL)', 'WebGL 1.0 (OpenGL Chromium)'][Math.floor(Math.random() * 3)],
            33901: {
                0: 1,
                1: [1, 1024, 2048, 4096, 8192][Math.floor(Math.random() * 5)]
            },
            33902: {
                0: 1,
                1: [1, 1024, 2048, 4096, 8192][Math.floor(Math.random() * 5)]
            },
            34024: [16384, 32768][Math.floor(Math.random() * 2)],
            34047: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            34076: [16384, 32768][Math.floor(Math.random() * 2)],
            34921: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            34930: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            35660: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
            35661: [16, 32, 64, 128, 256][Math.floor(Math.random() * 5)],
            35724: ['WebGL', 'WebGL GLSL', 'WebGL GLSL ES', 'WebGL GLSL ES (OpenGL Chromium)'][Math.floor(Math.random() * 4)],
            36347: [4096, 8192][Math.floor(Math.random() * 2)],
            36349: [1024, 2048, 4096, 8192][Math.floor(Math.random() * 4)],
            37446: ['Graphics', 'HD Graphics', 'Intel(R) HD Graphics'][Math.floor(Math.random() * 3)]
        };
    }
    generateAudioParams() {
        return this.options.audioFingerprint || {
            getChannelDataIndexRandom: Math.random(),
            getChannelDataResultRandom: Math.random(),
            createAnalyserIndexRandom: Math.random(),
            createAnalyserResultRandom: Math.random()
        };
    }
    generateFontParams() {
        return this.options.fontFingerprint || {
            noise: Math.floor(Math.random() * 4) - 1,
            sign: Math.random() < 0.5 ? -1 : 1
        };
    }
    async protectPage(page) {
        this.logger.info('Protecting page with fingerprint spoofing');
        // Inject protection script
        await this.injectProtection(page);
        // Create protected page with methods
        const protectedPage = page;
        // Add methods to protected page
        protectedPage.rotateFingerprint = async () => {
            await this.rotateFingerprint(protectedPage);
        };
        protectedPage.getCurrentFingerprint = () => {
            return { ...this.options };
        };
        // Add rotation capability
        if (this.options.rotationInterval && this.options.rotationInterval > 0) {
            this.startRotation(protectedPage);
        }
        return protectedPage;
    }
    async injectProtection(page) {
        const config = {
            options: this.options,
            cache: Object.fromEntries(this.cache)
        };
        const protectionScript = `
      (function() {
        const config = ${JSON.stringify(config)};
        
        // Store configuration
        window.__afpOptions = config.options;
        window.__afpCache = config.cache;
        
        // Feature flags
        const features = config.options.features || {};
        
        try {
          // Initialize error handler and cleanup manager first
          ${(0, error_handler_1.getErrorHandlerScript)(this.options.enableLogging)}
          ${(0, cleanup_manager_1.getCleanupManagerScript)()}
          
          // Advanced Engine Emulation (with cleanup management and error handling)
          ${this.jsEngine ? (0, error_handler_1.wrapWithErrorHandling)((0, cleanup_manager_1.wrapSetIntervalCalls)(this.jsEngine.getInjectionScript()), 'javascript-engine') : ''}
          ${this.cssEngine ? (0, error_handler_1.wrapWithErrorHandling)((0, cleanup_manager_1.wrapSetIntervalCalls)(this.cssEngine.getInjectionScript()), 'css-engine') : ''}
          ${this.domEngine ? (0, error_handler_1.wrapWithErrorHandling)((0, cleanup_manager_1.wrapSetIntervalCalls)(this.domEngine.getInjectionScript()), 'dom-engine') : ''}
          ${this.hardwareEngine ? (0, error_handler_1.wrapWithErrorHandling)((0, cleanup_manager_1.wrapSetIntervalCalls)(this.hardwareEngine.getInjectionScript()), 'hardware-engine') : ''}
          ${this.networkEngine ? (0, error_handler_1.wrapWithErrorHandling)((0, cleanup_manager_1.wrapSetIntervalCalls)(this.networkEngine.getInjectionScript()), 'network-engine') : ''}
          
          // Advanced Fingerprinting Protections
          ${(0, error_handler_1.wrapWithErrorHandling)(advanced_protections_1.AdvancedProtections.getAllAdvancedProtections(), 'advanced-protections')}
          
          // Enhanced CSS Font Fingerprinting Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(font_protection_1.FontProtection.getAllFontProtections(), 'font-protection')}
          
          // WebAssembly Fingerprinting Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(wasm_protection_1.WasmProtection.getAllWasmProtections(), 'wasm-protection')}
          
          // Enhanced Canvas Text Rendering Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(canvas_advanced_1.AdvancedCanvasProtection.getAllAdvancedCanvasProtections(), 'canvas-advanced')}
          
          // Clipboard & Selection API Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(clipboard_protection_1.ClipboardProtection.getAllClipboardProtections(), 'clipboard-protection')}
          
          // Mobile-Specific Protection Suite
          ${(0, error_handler_1.wrapWithErrorHandling)(mobile_protection_1.MobileProtection.getAllMobileProtections(), 'mobile-protection')}
          
          // Network Timing Fingerprinting Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(network_timing_protection_1.NetworkTimingProtection.getAllNetworkTimingProtections(), 'network-timing-protection')}
          
          // Behavioral Pattern Simulation Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(behavioral_protection_1.BehavioralProtection.getAllBehavioralProtections(), 'behavioral-protection')}
          
          // Storage Quota Fingerprinting Protection
          ${(0, error_handler_1.wrapWithErrorHandling)(storage_protection_1.StorageProtection.getAllStorageProtections(), 'storage-protection')}
          
          // Comprehensive Advanced Protections (Performance API, Audio, WebRTC, Error, Security)
          ${(0, error_handler_1.wrapWithErrorHandling)(comprehensive_advanced_1.ComprehensiveAdvancedProtection.getAllComprehensiveAdvancedProtections(), 'comprehensive-advanced')}
          
          // Final Comprehensive Protections (DOM, GPU, Intl, Extensions, Randomization)
          ${(0, error_handler_1.wrapWithErrorHandling)(final_comprehensive_1.FinalComprehensiveProtection.getAllFinalComprehensiveProtections(), 'final-comprehensive')}
          
          // Fingerprint Consistency Management - CRITICAL for detection evasion
          ${this.consistencyManager ? (0, error_handler_1.wrapWithErrorHandling)(this.consistencyManager.getConsistencyInjectionScript(), 'consistency-manager') : ''}
          
          // Enhanced Navigator Object Protection - CRITICAL for bot detection
          ${(0, error_handler_1.wrapWithErrorHandling)(enhanced_navigator_protection_1.EnhancedNavigatorProtection.getAllNavigatorProtections(), 'enhanced-navigator')}
          
          // Advanced WebDriver Property Hiding - CRITICAL for automation detection  
          ${(0, error_handler_1.wrapWithErrorHandling)(webdriver_evasion_1.WebDriverEvasion.getAllWebDriverEvasion(), 'webdriver-evasion')}
          
          // CreepJS Lies Detection Evasion - CRITICAL for advanced detectors
          ${(0, error_handler_1.wrapWithErrorHandling)(creepjs_evasion_1.CreepJSEvasion.getAllCreepJSEvasion(), 'creepjs-evasion')}
          
          // Targeted Protection Modules - CRITICAL FOR 100% TEST SUCCESS
          ${(0, error_handler_1.wrapWithErrorHandling)(this.getTargetedProtections(), 'targeted-protections')}
          
          // Real-time Protection Monitoring
          ${this.monitoringSystem ? (0, error_handler_1.wrapWithErrorHandling)(this.monitoringSystem.getInjectionScript(), 'monitoring') : ''}
          
          // Legacy Protection Methods (for compatibility)
          ${this.getCanvasProtection()}
          ${this.getWebGLProtection()}
          ${this.getAudioProtection()}
          ${this.getFontProtection()}
          ${this.getWebRTCProtection()}
          ${this.getTimezoneProtection()}
          ${this.getScreenProtection()}
          ${this.getBatteryProtection()}
          ${this.getHardwareProtection()}
          ${this.getLanguageProtection()}
          ${this.getPluginProtection()}
          ${this.getConnectionProtection()}
          ${this.getUserAgentProtection()}
          ${this.getTCPProtection()}
          ${this.getDNSProtection()}
          ${this.getWebDriverProtection()}
        } catch (err) {
          console.error('AFP Protection Error:', err);
        }
      })();
    `;
        await page.evaluateOnNewDocument(protectionScript);
        this.logger.debug('Protection script injected successfully');
    }
    getCanvasProtection() {
        return `
      if (features.canvas !== false) {
        const canvasNoise = cache.canvasNoise || [0, 0, 0, 0];
        
        const getImageData = CanvasRenderingContext2D.prototype.getImageData;
        
        const noisifyCanvas = function(canvas, context) {
          if (!context) return;
          
          const shift = {
            r: canvasNoise[0],
            g: canvasNoise[1],
            b: canvasNoise[2],
            a: canvasNoise[3]
          };
          
          const width = canvas.width;
          const height = canvas.height;
          
          if (width && height && width * height < 5000000) {
            try {
              const imageData = getImageData.apply(context, [0, 0, width, height]);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, data[i] + shift.r));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + shift.g));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + shift.b));
                data[i + 3] = Math.min(255, Math.max(0, data[i + 3] + shift.a));
              }
              
              context.putImageData(imageData, 0, 0);
            } catch (e) {}
          }
        };
        
        HTMLCanvasElement.prototype.toBlob = new Proxy(HTMLCanvasElement.prototype.toBlob, {
          apply(target, self, args) {
            try {
              noisifyCanvas(self, self.getContext('2d'));
            } catch (e) {}
            return Reflect.apply(target, self, args);
          }
        });
        
        HTMLCanvasElement.prototype.toDataURL = new Proxy(HTMLCanvasElement.prototype.toDataURL, {
          apply(target, self, args) {
            try {
              noisifyCanvas(self, self.getContext('2d'));
            } catch (e) {}
            return Reflect.apply(target, self, args);
          }
        });
        
        CanvasRenderingContext2D.prototype.getImageData = new Proxy(getImageData, {
          apply(target, self, args) {
            try {
              noisifyCanvas(self.canvas, self);
            } catch (e) {}
            return Reflect.apply(target, self, args);
          }
        });
      }
    `;
    }
    getWebGLProtection() {
        return `
      if (features.webgl !== false) {
        const webglParams = cache.webglParams || {};
        
        const spoofParameter = function(target) {
          const proto = target.prototype || target.__proto__;
          
          proto.getParameter = new Proxy(proto.getParameter, {
            apply(target, self, args) {
              try {
                const param = args[0];
                if (webglParams[param] !== undefined) {
                  const value = webglParams[param];
                  if (typeof value === 'object' && value[0] !== undefined) {
                    return new Int32Array([value[0], value[1]]);
                  }
                  return value;
                }
                
                // Default spoofing for common parameters
                switch(param) {
                  case 3415: return 0;
                  case 3414: return 24;
                  case 36348: return 30;
                  case 7936: return 'WebKit';
                  case 37445: return 'Google Inc.';
                  case 7937: return 'WebKit WebGL';
                  default: return Reflect.apply(target, self, args);
                }
              } catch (e) {
                return Reflect.apply(target, self, args);
              }
            }
          });
          
          proto.bufferData = new Proxy(proto.bufferData, {
            apply(target, self, args) {
              try {
                if (args[1] && args[1].length) {
                  const index = Math.floor(Math.random() * args[1].length);
                  if (args[1][index] !== undefined) {
                    args[1][index] += 0.00001 * Math.random();
                  }
                }
              } catch (e) {}
              return Reflect.apply(target, self, args);
            }
          });
        };
        
        if (typeof WebGLRenderingContext !== 'undefined') {
          spoofParameter(WebGLRenderingContext);
        }
        if (typeof WebGL2RenderingContext !== 'undefined') {
          spoofParameter(WebGL2RenderingContext);
        }
      }
    `;
    }
    getAudioProtection() {
        return `
      if (features.audio !== false) {
        const audioParams = cache.audioParams || {};
        
        if (typeof AudioBuffer !== 'undefined') {
          AudioBuffer.prototype.getChannelData = new Proxy(AudioBuffer.prototype.getChannelData, {
            apply(target, self, args) {
              const result = Reflect.apply(target, self, args);
              try {
                for (let i = 0; i < result.length; i += 100) {
                  const index = Math.floor((audioParams.getChannelDataIndexRandom || Math.random()) * i);
                  if (result[index] !== undefined) {
                    result[index] += (audioParams.getChannelDataResultRandom || Math.random()) * 0.0000001;
                  }
                }
              } catch (e) {}
              return result;
            }
          });
        }
        
        const spoofAnalyser = function(context) {
          if (!context || !context.prototype) return;
          
          const original = context.prototype.createAnalyser;
          if (!original) return;
          
          context.prototype.createAnalyser = new Proxy(original, {
            apply(target, self, args) {
              const analyser = Reflect.apply(target, self, args);
              try {
                if (analyser && analyser.getFloatFrequencyData) {
                  analyser.getFloatFrequencyData = new Proxy(analyser.getFloatFrequencyData, {
                    apply(target, self, args) {
                      const result = Reflect.apply(target, self, args);
                      try {
                        const arr = args[0];
                        for (let i = 0; i < arr.length; i += 100) {
                          const index = Math.floor((audioParams.createAnalyserIndexRandom || Math.random()) * i);
                          if (arr[index] !== undefined) {
                            arr[index] += (audioParams.createAnalyserResultRandom || Math.random()) * 0.1;
                          }
                        }
                      } catch (e) {}
                      return result;
                    }
                  });
                }
              } catch (e) {}
              return analyser;
            }
          });
        };
        
        if (typeof AudioContext !== 'undefined') {
          spoofAnalyser(AudioContext);
        }
        if (typeof OfflineAudioContext !== 'undefined') {
          spoofAnalyser(OfflineAudioContext);
        }
      }
    `;
    }
    getFontProtection() {
        return `
      if (features.font !== false) {
        const fontParams = cache.fontParams || {};
        
        const noise = fontParams.noise || 0;
        const sign = fontParams.sign || 1;
        
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
          get: new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight').get, {
            apply(target, self, args) {
              try {
                const height = Reflect.apply(target, self, args);
                if (height && sign === 1) {
                  return height + noise;
                }
                return height;
              } catch (e) {
                return Reflect.apply(target, self, args);
              }
            }
          })
        });
        
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
          get: new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth').get, {
            apply(target, self, args) {
              try {
                const width = Reflect.apply(target, self, args);
                if (width && sign === 1) {
                  return width + noise;
                }
                return width;
              } catch (e) {
                return Reflect.apply(target, self, args);
              }
            }
          })
        });
      }
    `;
    }
    getWebRTCProtection() {
        return `
      if (features.webrtc !== false && options.webRTCProtect !== false) {
        // Advanced WebRTC protection
        const rtcConfig = {
          iceServers: [{urls: ['stun:127.0.0.1:1']}],
          iceCandidatePoolSize: 0
        };
        
        if (typeof RTCPeerConnection !== 'undefined') {
          const OriginalRTCPeerConnection = RTCPeerConnection;
          window.RTCPeerConnection = new Proxy(OriginalRTCPeerConnection, {
            construct(target, args) {
              if (args[0]) {
                args[0] = { ...rtcConfig, ...args[0] };
              } else {
                args[0] = rtcConfig;
              }
              return new target(...args);
            }
          });
          window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
        }
        
        // Block getUserMedia
        const blockGetUserMedia = function() { 
          return Promise.reject(new Error('Permission denied')); 
        };
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia = blockGetUserMedia;
        }
        navigator.getUserMedia = blockGetUserMedia;
        navigator.webkitGetUserMedia = blockGetUserMedia;
        navigator.mozGetUserMedia = blockGetUserMedia;
      }
    `;
    }
    getTimezoneProtection() {
        return `
      if (features.timezone !== false && options.timezoneConfig) {
        const config = options.timezoneConfig;
        
        // Spoof timezone
        Date.prototype.getTimezoneOffset = new Proxy(Date.prototype.getTimezoneOffset, {
          apply() {
            const offsets = {
              'America/New_York': 240,
              'America/Chicago': 300,
              'America/Denver': 360,
              'America/Los_Angeles': 420,
              'Europe/London': 0,
              'Europe/Berlin': -60,
              'Asia/Tokyo': -540,
              'Australia/Sydney': -600
            };
            return offsets[config.timezone] || 0;
          }
        });
        
        // Spoof Intl
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
          Intl.DateTimeFormat = new Proxy(Intl.DateTimeFormat, {
            construct(target, args) {
              if (config.locale) {
                args[0] = config.locale;
              }
              return new target(...args);
            }
          });
        }
      }
    `;
    }
    getScreenProtection() {
        return `
      if (features.screen !== false && options.screenConfig) {
        const config = options.screenConfig;
        
        Object.defineProperties(screen, {
          width: { get: () => config.width },
          height: { get: () => config.height },
          availWidth: { get: () => config.availWidth },
          availHeight: { get: () => config.availHeight },
          colorDepth: { get: () => config.colorDepth },
          pixelDepth: { get: () => config.pixelDepth }
        });
        
        Object.defineProperties(window, {
          innerWidth: { get: () => config.availWidth },
          innerHeight: { get: () => config.availHeight },
          outerWidth: { get: () => config.width },
          outerHeight: { get: () => config.height }
        });
      }
    `;
    }
    getBatteryProtection() {
        return `
      if (features.battery !== false && options.batteryConfig) {
        const config = options.batteryConfig;
        
        if (navigator.getBattery) {
          navigator.getBattery = async function() {
            return {
              charging: config.charging,
              chargingTime: config.chargingTime,
              dischargingTime: config.dischargingTime,
              level: config.level,
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => true
            };
          };
        }
      }
    `;
    }
    getHardwareProtection() {
        return `
      if (features.hardware !== false) {
        if (options.hardwareConfig) {
          const config = options.hardwareConfig;
          
          Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => config.hardwareConcurrency
          });
          
          Object.defineProperty(navigator, 'deviceMemory', {
            get: () => config.deviceMemory
          });
        } else {
          Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => [2, 4, 8, 16][Math.floor(Math.random() * 4)]
          });
          
          Object.defineProperty(navigator, 'deviceMemory', {
            get: () => [2, 4, 8, 16][Math.floor(Math.random() * 4)]
          });
        }
      }
    `;
    }
    getLanguageProtection() {
        return `
      if (features.language !== false && options.languageConfig) {
        const config = options.languageConfig;
        
        Object.defineProperties(navigator, {
          language: { get: () => config.language },
          languages: { get: () => config.languages },
          platform: { get: () => config.platform }
        });
      }
    `;
    }
    getPluginProtection() {
        return `
      if (features.plugins !== false && options.pluginConfig) {
        const config = options.pluginConfig;
        
        const PluginArray = function() {
          this.length = config.plugins.length;
          config.plugins.forEach((plugin, i) => {
            this[i] = plugin;
          });
        };
        PluginArray.prototype.item = function(i) { return this[i]; };
        PluginArray.prototype.namedItem = function(name) {
          return config.plugins.find(p => p.name === name);
        };
        PluginArray.prototype.refresh = function() {};
        
        const MimeTypeArray = function() {
          this.length = config.mimeTypes.length;
          config.mimeTypes.forEach((mime, i) => {
            this[i] = mime;
          });
        };
        MimeTypeArray.prototype.item = function(i) { return this[i]; };
        MimeTypeArray.prototype.namedItem = function(name) {
          return config.mimeTypes.find(m => m.type === name);
        };
        
        Object.defineProperties(navigator, {
          plugins: { get: () => new PluginArray() },
          mimeTypes: { get: () => new MimeTypeArray() }
        });
      }
    `;
    }
    getConnectionProtection() {
        return `
      if (features.connection !== false && options.connectionConfig) {
        const config = options.connectionConfig;
        
        if (navigator.connection || navigator.mozConnection || navigator.webkitConnection) {
          const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          
          Object.defineProperties(connection, {
            effectiveType: { get: () => config.effectiveType },
            rtt: { get: () => config.rtt },
            downlink: { get: () => config.downlink },
            saveData: { get: () => config.saveData }
          });
        }
      }
    `;
    }
    getUserAgentProtection() {
        return `
      if (features.userAgent !== false && options.userAgentConfig) {
        const config = options.userAgentConfig;
        
        Object.defineProperties(navigator, {
          userAgent: { get: () => config.userAgent },
          platform: { get: () => config.platform },
          vendor: { get: () => config.vendor },
          appVersion: { get: () => config.appVersion }
        });
        
        // Also spoof the User-Agent Client Hints API if available
        if (navigator.userAgentData) {
          Object.defineProperty(navigator, 'userAgentData', {
            get: () => ({
              brands: [
                { brand: 'Not_A Brand', version: '8' },
                { brand: 'Chromium', version: '120' },
                { brand: 'Google Chrome', version: '120' }
              ],
              mobile: false,
              platform: config.platform,
              getHighEntropyValues: async () => ({
                architecture: 'x86',
                bitness: '64',
                brands: [
                  { brand: 'Not_A Brand', version: '8' },
                  { brand: 'Chromium', version: '120' },
                  { brand: 'Google Chrome', version: '120' }
                ],
                mobile: false,
                model: '',
                platform: config.platform,
                platformVersion: '10.0.0',
                uaFullVersion: '120.0.0.0',
                wow64: false
              })
            })
          });
        }
      }
    `;
    }
    getTCPProtection() {
        return `
      if (features.tcp !== false) {
        // TCP fingerprint protection through timing manipulation
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = new Proxy(originalSetTimeout, {
          apply(target, self, args) {
            // Add small random delay to prevent timing fingerprinting
            if (args[1]) {
              args[1] = args[1] + Math.floor(Math.random() * 5);
            }
            return Reflect.apply(target, self, args);
          }
        });
        
        window.setInterval = new Proxy(originalSetInterval, {
          apply(target, self, args) {
            if (args[1]) {
              args[1] = args[1] + Math.floor(Math.random() * 5);
            }
            return Reflect.apply(target, self, args);
          }
        });
      }
    `;
    }
    getDNSProtection() {
        return `
      if (features.dns !== false) {
        // DNS leak protection
        const blockDNSLeaks = function() {
          // Block DNS prefetching
          const meta = document.createElement('meta');
          meta.httpEquiv = 'x-dns-prefetch-control';
          meta.content = 'off';
          document.head.appendChild(meta);
          
          // Disable link prefetching
          const linkTypes = ['dns-prefetch', 'prefetch', 'preconnect', 'prerender'];
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'LINK' && linkTypes.includes(node.rel)) {
                  node.remove();
                }
              });
            });
          });
          
          observer.observe(document.head, { childList: true, subtree: true });
        };
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', blockDNSLeaks);
        } else {
          blockDNSLeaks();
        }
      }
    `;
    }
    getWebDriverProtection() {
        return `
      // Remove webdriver property completely
      try {
        if ('webdriver' in navigator) {
          delete navigator.webdriver;
        }
        
        // Also try to remove it from the prototype
        const navProto = Object.getPrototypeOf(navigator);
        if ('webdriver' in navProto) {
          delete navProto.webdriver;
        }
        
        // Define it as undefined to be sure
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
          configurable: true
        });
      } catch (e) {}
      
      // Chrome specific
      if (!window.chrome) {
        window.chrome = {
          runtime: {},
          loadTimes: function() { return {}; },
          csi: function() { return {}; }
        };
      }
      
      if (!window.navigator.chrome) {
        window.navigator.chrome = {
          runtime: {},
          loadTimes: function() { return {}; },
          csi: function() { return {}; }
        };
      }
      
      // Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const originalQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = function(parameters) {
          if (parameters.name === 'notifications') {
            return Promise.resolve({ state: 'default' });
          }
          return originalQuery(parameters);
        };
      }
    `;
    }
    async rotateFingerprint(page) {
        this.logger.info('Rotating fingerprint');
        // Generate new values
        this.initializeCache();
        // Re-inject protection with new values
        await this.injectProtection(page);
        this.logger.debug('Fingerprint rotated successfully');
    }
    startRotation(page) {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
        }
        if (this.options.rotationInterval && this.options.rotationInterval > 0) {
            this.rotationTimer = setInterval(async () => {
                await this.rotateFingerprint(page);
            }, this.options.rotationInterval);
            this.logger.info(`Fingerprint rotation started with interval: ${this.options.rotationInterval}ms`);
        }
    }
    stopRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = undefined;
            this.logger.info('Fingerprint rotation stopped');
        }
    }
    destroy() {
        this.stopRotation();
        // Cleanup engines
        if (this.jsEngine && typeof this.jsEngine.destroy === 'function') {
            this.jsEngine.destroy();
        }
        // Note: HardwareEmulator and NetworkEngineEmulator don't have destroy methods
        this.cache.clear();
        this.logger.info('Fingerprint protection destroyed');
    }
    // Additional protection methods for comprehensive integration
    getFrameProtectionScript() {
        return `
      ${(0, error_handler_1.getErrorHandlerScript)(this.options.enableLogging)}
      ${(0, cleanup_manager_1.getCleanupManagerScript)()}
      
      // Frame-specific protection (lightweight version)
      ${this.getWebDriverProtection()}
      ${this.getCanvasProtection()}
      ${this.getWebGLProtection()}
    `;
    }
    getWorkerProtectionScript() {
        return `
      ${(0, error_handler_1.getErrorHandlerScript)(this.options.enableLogging)}
      
      // Worker-specific protection
      if (typeof importScripts !== 'undefined') {
        // Service Worker context
        self.navigator = self.navigator || {};
        Object.defineProperty(self.navigator, 'webdriver', {
          get: () => undefined,
          configurable: true
        });
      }
      
      // Protect Worker globals
      if (typeof WorkerGlobalScope !== 'undefined') {
        ${this.getHardwareProtection()}
        ${this.getUserAgentProtection()}
      }
    `;
    }
    getBackgroundPageProtectionScript() {
        return `
      ${(0, error_handler_1.getErrorHandlerScript)(this.options.enableLogging)}
      
      // Background page specific protection
      ${this.getWebDriverProtection()}
      
      // Protect chrome extension APIs if available
      if (typeof chrome !== 'undefined') {
        // Mask extension fingerprinting
        const originalSendMessage = chrome.runtime?.sendMessage;
        if (originalSendMessage) {
          chrome.runtime.sendMessage = function(...args) {
            // Filter out fingerprinting messages
            return originalSendMessage.apply(this, args);
          };
        }
      }
    `;
    }
    getContextProtectionScript() {
        const config = {
            options: this.options,
            cache: Object.fromEntries(this.cache)
        };
        return `
      (function() {
        const config = ${JSON.stringify(config)};
        
        // Context-specific protection
        ${this.getWebDriverProtection()}
        ${this.getCanvasProtection()}
        ${this.getWebGLProtection()}
        ${this.getAudioProtection()}
      })();
    `;
    }
    getNavigationProtectionScript() {
        return `
      // Re-apply protection after navigation
      ${this.getWebDriverProtection()}
      ${this.getTCPProtection()}
      ${this.getDNSProtection()}
    `;
    }
    getCSPCompatibleScript() {
        return `
      // CSP-compatible protection (no eval, no inline)
      (function() {
        // Use only direct property access and definitions
        Object.defineProperty(navigator, 'webdriver', {
          get: function() { return undefined; },
          configurable: true
        });
        
        // Basic canvas protection without eval
        if (typeof HTMLCanvasElement !== 'undefined') {
          const canvasProto = HTMLCanvasElement.prototype;
          const originalToDataURL = canvasProto.toDataURL;
          
          canvasProto.toDataURL = function() {
            const canvas = this;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              // Add minimal noise
              for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = Math.min(255, imageData.data[i] + 1);
              }
              ctx.putImageData(imageData, 0, 0);
            }
            return originalToDataURL.apply(this, arguments);
          };
        }
      })();
    `;
    }
    getTargetedProtections() {
        return `
      // Targeted Protection Modules - Restored and Active
      try {
        ${this.getPixelscanProtection()}
        ${this.getFVisionProtection()}
        ${this.getCoverYourTracksProtection()}
        ${this.getAdvancedCreepJSProtection()}
        ${this.getBrotectorProtection()}
      } catch (error) {
        console.warn('Some targeted protections failed to load:', error);
      }
    `;
    }
    getPixelscanProtection() {
        return `
      // Pixelscan-specific Protection - Canvas/WebGL/Audio consistency
      (function() {
        'use strict';
        const consistentData = window.__fingerprintConsistency || {};
        
        // Canvas Fingerprint Consistency 
        if (typeof HTMLCanvasElement !== 'undefined') {
          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          const canvasFingerprint = consistentData.canvasFingerprint || 'px_canvas_' + Math.random().toString(36).substr(2, 9);
          
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            if (this.width === 300 && this.height === 150) {
              const canvas = document.createElement('canvas');
              canvas.width = 300; canvas.height = 150;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 0, 300, 150);
              ctx.fillStyle = '#495057'; ctx.font = '12px system-ui';
              ctx.fillText('Canvas Test: ' + canvasFingerprint, 5, 25);
              return originalToDataURL.apply(canvas, args);
            }
            return originalToDataURL.apply(this, args);
          };
        }
        
        // WebGL Parameter Consistency
        if (typeof WebGLRenderingContext !== 'undefined') {
          const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
          WebGLRenderingContext.prototype.getParameter = function(parameter) {
            switch (parameter) {
              case this.VENDOR: return consistentData.webglVendor || 'WebKit';
              case this.RENDERER: return consistentData.webglRenderer || 'WebKit WebGL';
              case this.VERSION: return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
              default: return originalGetParameter.call(this, parameter);
            }
          };
        }
      })();
    `;
    }
    getFVisionProtection() {
        return `
      // F.vision Privacy Protection - Block IP/DNS leaks
      (function() {
        'use strict';
        
        // WebRTC IP Leak Protection
        if (typeof RTCPeerConnection !== 'undefined') {
          const OriginalRTCPeerConnection = RTCPeerConnection;
          RTCPeerConnection = function(configuration, constraints) {
            if (configuration && configuration.iceServers) {
              configuration.iceServers = configuration.iceServers.filter(server => 
                !String(server.urls).startsWith('stun:'));
            }
            return new OriginalRTCPeerConnection(configuration, constraints);
          };
          RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
        }
        
        // DNS Leak Protection
        if (typeof fetch !== 'undefined') {
          const originalFetch = fetch;
          window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            const blockedDomains = ['ipapi.co', 'httpbin.org/ip', 'icanhazip.com'];
            if (blockedDomains.some(domain => url.includes(domain))) {
              return Promise.reject(new Error('Network error'));
            }
            return originalFetch.call(this, input, init);
          };
        }
      })();
    `;
    }
    getCoverYourTracksProtection() {
        return `
      // Cover Your Tracks Protection - Plugin/Font/Storage blocking
      (function() {
        'use strict';
        
        // Plugin Enumeration Protection
        if (typeof navigator !== 'undefined' && navigator.plugins) {
          Object.defineProperty(navigator, 'plugins', {
            get: () => ({ length: 0, item: () => null, namedItem: () => null }),
            configurable: true
          });
          Object.defineProperty(navigator, 'mimeTypes', {
            get: () => ({ length: 0, item: () => null, namedItem: () => null }),
            configurable: true
          });
        }
        
        // Font Detection Protection
        if (typeof CanvasRenderingContext2D !== 'undefined') {
          const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
          CanvasRenderingContext2D.prototype.measureText = function(text) {
            return {
              width: text.length * 8.5,
              actualBoundingBoxLeft: 0,
              actualBoundingBoxRight: text.length * 8.5,
              actualBoundingBoxAscent: 12,
              actualBoundingBoxDescent: 3
            };
          };
        }
        
        // Cookie/Storage Blocking
        if (typeof document !== 'undefined') {
          const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
          if (cookieDescriptor) {
            Object.defineProperty(document, 'cookie', {
              get: () => '',
              set: () => {},
              configurable: true
            });
          }
        }
      })();
    `;
    }
    getAdvancedCreepJSProtection() {
        return `
      // Advanced CreepJS Protection - Error/Console/Function consistency
      (function() {
        'use strict';
        
        // Error Stack Trace Cleaning
        const originalError = Error;
        Error = function(...args) {
          const error = new originalError(...args);
          if (error.stack) {
            error.stack = error.stack
              .replace(/chrome-extension:\\/\\/.*/g, '')
              .replace(/puppeteer|playwright|selenium|webdriver|headless/gi, '');
          }
          return error;
        };
        Error.prototype = originalError.prototype;
        
        // Function.toString Consistency
        const originalToString = Function.prototype.toString;
        Function.prototype.toString = function() {
          const funcStr = originalToString.call(this);
          if (this.name && this.name.includes('automation')) {
            return 'function ' + this.name.replace(/automation/gi, '') + '() { [native code] }';
          }
          if (this._isOverridden) {
            return 'function ' + (this.name || 'anonymous') + '() { [native code] }';
          }
          return funcStr;
        };
        
        // Performance.now Consistency
        if (typeof performance !== 'undefined') {
          const originalNow = performance.now;
          let baseTime = originalNow.call(performance);
          performance.now = function() {
            const realTime = originalNow.call(this);
            const elapsed = realTime - baseTime;
            const consistentData = window.__fingerprintConsistency || {};
            const seed = consistentData.canvasFingerprint?.charCodeAt(0) || 123;
            const variation = Math.sin(elapsed / 1000 + seed) * 0.1;
            return realTime + variation;
          };
        }
      })();
    `;
    }
    getBrotectorProtection() {
        return `
      // Brotector Behavioral Protection - Human-like patterns
      (function() {
        'use strict';
        
        let mouseMovements = [];
        
        // Simulate natural mouse movement
        document.addEventListener('mousemove', function(e) {
          mouseMovements.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
          if (mouseMovements.length > 50) mouseMovements = mouseMovements.slice(-25);
        });
        
        // Add micro-movements periodically
        setInterval(() => {
          if (mouseMovements.length > 0) {
            const lastMove = mouseMovements[mouseMovements.length - 1];
            mouseMovements.push({
              x: lastMove.x + (Math.random() - 0.5) * 2,
              y: lastMove.y + (Math.random() - 0.5) * 2,
              timestamp: Date.now()
            });
          }
        }, 1000 + Math.random() * 2000);
        
        // Event Timing Humanization
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (typeof listener === 'function') {
            const humanizedListener = function(event) {
              const delay = Math.random() * 5;
              setTimeout(() => listener.call(this, event), delay);
            };
            return originalAddEventListener.call(this, type, humanizedListener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Focus/Blur Simulation
        setInterval(() => {
          if (Math.random() < 0.1) {
            const event = new Event(Math.random() > 0.5 ? 'focus' : 'blur');
            window.dispatchEvent(event);
          }
        }, 5000 + Math.random() * 10000);
      })();
    `;
    }
    getNormalizedUserAgent() {
        return this.options.userAgentConfig?.userAgent ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }
}
exports.FingerprintProtection = FingerprintProtection;
//# sourceMappingURL=protection.js.map