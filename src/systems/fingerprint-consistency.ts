/**
 * Fingerprint Consistency System
 * Ensures all fingerprinting APIs return consistent, correlated values
 */

import { ProtectionOptions } from '../types';
import { Logger } from '../logger';

export interface ConsistentFingerprint {
  // Hardware consistency
  hardwareConcurrency: number;
  deviceMemory: number;
  maxTouchPoints: number;
  
  // Screen consistency  
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  
  // Canvas consistency
  canvasFingerprint: string;
  webglVendor: string;
  webglRenderer: string;
  webglVersion: string;
  
  // Audio consistency
  audioContext: {
    sampleRate: number;
    maxChannelCount: number;
    baseLatency: number;
  };
  
  // Font consistency
  availableFonts: string[];
  fontFingerprint: string;
  
  // Platform consistency
  platform: string;
  userAgent: string;
  languages: string[];
  timezone: string;
  
  // WebRTC consistency
  webrtcLocalIP: string;
  webrtcPublicIP: string;
  
  // Performance consistency
  performanceTiming: {
    connectTime: number;
    domainLookupTime: number;
    loadEventTime: number;
  };
}

export class FingerprintConsistencyManager {
  private logger: Logger;
  private consistentFingerprint: ConsistentFingerprint;
  private fingerprintSeed: number;
  
  constructor(options: ProtectionOptions, enableLogging: boolean = false) {
    this.logger = new Logger(enableLogging);
    this.fingerprintSeed = this.generateSeed(options);
    this.consistentFingerprint = this.generateConsistentFingerprint(options);
    this.logger.info('Fingerprint consistency manager initialized');
  }

  private generateSeed(options: ProtectionOptions): number {
    // Create deterministic seed based on options
    let seed = 12345; // Base seed
    
    if (options.hardwareConfig?.hardwareConcurrency) {
      seed += options.hardwareConfig.hardwareConcurrency * 1000;
    }
    
    if (options.screenConfig?.width) {
      seed += options.screenConfig.width;
    }
    
    if (options.languageConfig?.platform) {
      seed += options.languageConfig.platform.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }
    
    return seed % 1000000; // Keep it manageable
  }

  private seededRandom(): number {
    // Linear congruential generator for consistent randomness
    this.fingerprintSeed = (this.fingerprintSeed * 9301 + 49297) % 233280;
    return this.fingerprintSeed / 233280;
  }

  private generateConsistentFingerprint(options: ProtectionOptions): ConsistentFingerprint {
    // Use provided hardware values or generate correlating ones
    const hardwareConcurrency = options.hardwareConfig?.hardwareConcurrency || 
                                this.selectFromArray([4, 8, 12, 16]);
    const deviceMemory = options.hardwareConfig?.deviceMemory || 
                        this.correlateMemoryWithCores(hardwareConcurrency);
    const maxTouchPoints = this.correlateTouchPoints(options.languageConfig?.platform || 'Win32');

    // Use provided screen values or generate correlating ones
    const screenResolution = this.generateCorrelatedScreenResolution(options.screenConfig);
    
    // Generate consistent canvas fingerprint
    const canvasFingerprint = this.generateCanvasFingerprint(hardwareConcurrency, deviceMemory);
    
    // Generate consistent WebGL values
    const webglInfo = this.generateConsistentWebGL(hardwareConcurrency, deviceMemory);
    
    // Generate consistent audio context
    const audioContext = this.generateConsistentAudio(hardwareConcurrency);
    
    // Generate consistent fonts based on platform
    const fontInfo = this.generateConsistentFonts(options.languageConfig?.platform || 'Win32');
    
    // Generate consistent platform info
    const platformInfo = this.generateConsistentPlatform(options);
    
    // Generate consistent WebRTC
    const webrtcInfo = this.generateConsistentWebRTC();
    
    // Generate consistent performance metrics
    const performanceInfo = this.generateConsistentPerformance(hardwareConcurrency, deviceMemory);

    return {
      hardwareConcurrency,
      deviceMemory,
      maxTouchPoints,
      ...screenResolution,
      canvasFingerprint,
      ...webglInfo,
      audioContext,
      ...fontInfo,
      ...platformInfo,
      ...webrtcInfo,
      performanceTiming: performanceInfo
    };
  }

  private selectFromArray<T>(array: T[]): T {
    const index = Math.floor(this.seededRandom() * array.length);
    return array[index];
  }

  private correlateMemoryWithCores(cores: number): number {
    // Realistic memory correlation with CPU cores
    const memoryMap: { [key: number]: number[] } = {
      4: [4, 8],
      8: [8, 16],
      12: [16, 32],
      16: [16, 32, 64]
    };
    
    const possibleMemory = memoryMap[cores] || [8];
    return this.selectFromArray(possibleMemory);
  }

  private correlateTouchPoints(platform: string): number {
    // Touch points correlate with platform type
    if (platform.includes('ARM') || platform.includes('Mobile')) {
      return this.selectFromArray([5, 10]); // Mobile devices
    } else if (platform.includes('Win')) {
      return this.selectFromArray([0, 10]); // Windows laptops may have touch
    } else {
      return 0; // Mac/Linux typically no touch
    }
  }

  private generateCorrelatedScreenResolution(screenConfig?: any) {
    // Common resolution pairs that make sense together
    const commonResolutions = [
      { screenWidth: 1920, screenHeight: 1080, availWidth: 1920, availHeight: 1040, devicePixelRatio: 1 },
      { screenWidth: 2560, screenHeight: 1440, availWidth: 2560, availHeight: 1400, devicePixelRatio: 1 },
      { screenWidth: 1366, screenHeight: 768, availWidth: 1366, availHeight: 728, devicePixelRatio: 1 },
      { screenWidth: 1440, screenHeight: 900, availWidth: 1440, availHeight: 860, devicePixelRatio: 1 },
      { screenWidth: 2880, screenHeight: 1800, availWidth: 2880, availHeight: 1760, devicePixelRatio: 2 } // Retina
    ];

    const selected = screenConfig?.width && screenConfig?.height ? 
      {
        screenWidth: screenConfig.width,
        screenHeight: screenConfig.height,
        availWidth: screenConfig.availWidth || screenConfig.width,
        availHeight: screenConfig.availHeight || screenConfig.height - 40,
        devicePixelRatio: 1
      } :
      this.selectFromArray(commonResolutions);

    return {
      ...selected,
      colorDepth: 24, // Consistent color depth
      pixelDepth: 24  // Match color depth
    };
  }

  private generateCanvasFingerprint(cores: number, memory: number): string {
    // Generate consistent canvas fingerprint based on hardware
    const baseString = `cores:${cores}-memory:${memory}-seed:${this.fingerprintSeed}`;
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  private generateConsistentWebGL(cores: number, memory: number) {
    // WebGL info should correlate with hardware specs
    const vendors = ['Intel Inc.', 'NVIDIA Corporation', 'ATI Technologies Inc.'];
    const vendor = this.selectFromArray(vendors);
    
    let renderer: string;
    if (cores >= 12 && memory >= 16) {
      // High-end system
      renderer = vendor.includes('NVIDIA') ? 'NVIDIA GeForce RTX 3080' :
                vendor.includes('ATI') ? 'AMD Radeon RX 6800 XT' :
                'Intel(R) Iris(R) Xe Graphics';
    } else if (cores >= 8 && memory >= 8) {
      // Mid-range system  
      renderer = vendor.includes('NVIDIA') ? 'NVIDIA GeForce GTX 1660' :
                vendor.includes('ATI') ? 'AMD Radeon RX 580' :
                'Intel(R) UHD Graphics 620';
    } else {
      // Lower-end system
      renderer = vendor.includes('NVIDIA') ? 'NVIDIA GeForce GTX 1050' :
                vendor.includes('ATI') ? 'AMD Radeon R7' :
                'Intel(R) HD Graphics 4000';
    }

    return {
      webglVendor: vendor,
      webglRenderer: renderer,
      webglVersion: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)'
    };
  }

  private generateConsistentAudio(cores: number) {
    // Audio context should correlate with hardware capability
    const sampleRates = [44100, 48000];
    const sampleRate = this.selectFromArray(sampleRates);
    
    return {
      sampleRate,
      maxChannelCount: cores >= 8 ? 8 : 2, // More cores = better audio
      baseLatency: cores >= 8 ? 0.005 : 0.01 // Better hardware = lower latency
    };
  }

  private generateConsistentFonts(platform: string) {
    // Platform-specific font sets
    const windowsFonts = [
      'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 
      'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
      'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets',
      'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode',
      'Malgun Gothic', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue',
      'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei',
      'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli',
      'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print',
      'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS',
      'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic'
    ];

    const macFonts = [
      'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
      'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon',
      'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT',
      'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS',
      'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed',
      'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum',
      'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif',
      'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET',
      'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello',
      'Trebuchet MS', 'Verdana', 'Zapfino'
    ];

    const linuxFonts = [
      'Abyssinica SIL', 'Arial', 'Bitstream Vera Sans', 'Bitstream Vera Sans Mono', 'Bitstream Vera Serif',
      'Calibri', 'Century Schoolbook L', 'Comic Sans MS', 'Courier 10 Pitch', 'Courier New',
      'DejaVu Sans', 'DejaVu Sans Condensed', 'DejaVu Sans Mono', 'DejaVu Serif', 'DejaVu Serif Condensed',
      'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'FreeMono', 'FreeSans', 'FreeSerif',
      'Gargi', 'Georgia', 'Impact', 'Liberation Mono', 'Liberation Sans', 'Liberation Sans Narrow',
      'Liberation Serif', 'Lohit Bengali', 'Lohit Gujarati', 'Lohit Hindi', 'Lohit Marathi',
      'Lohit Tamil', 'Lohit Telugu', 'Nimbus Mono L', 'Nimbus Roman No9 L', 'Nimbus Sans L',
      'Noto Color Emoji', 'Noto Sans', 'Open Sans', 'Padauk', 'Source Code Pro', 'Tahoma',
      'Times New Roman', 'Trebuchet MS', 'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Mono', 'Verdana'
    ];

    let availableFonts: string[];
    if (platform.includes('Win')) {
      availableFonts = windowsFonts;
    } else if (platform.includes('Mac')) {
      availableFonts = macFonts;
    } else {
      availableFonts = linuxFonts;
    }

    // Generate consistent font fingerprint
    const fontString = availableFonts.slice(0, 20).join(',');
    const fontFingerprint = this.generateCanvasFingerprint(fontString.length, availableFonts.length);

    return { availableFonts, fontFingerprint };
  }

  private generateConsistentPlatform(options: ProtectionOptions) {
    const platform = options.languageConfig?.platform || 'Win32';
    const languages = options.languageConfig?.languages || ['en-US', 'en'];
    const timezone = options.timezoneConfig?.timezone || 'America/New_York';

    // Generate consistent user agent based on platform
    let userAgent: string;
    if (platform.includes('Win')) {
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    } else if (platform.includes('Mac')) {
      userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    } else {
      userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    return { platform, userAgent, languages, timezone };
  }

  private generateConsistentWebRTC() {
    // Generate consistent local IP (private range)
    const privateRanges = ['192.168.1', '192.168.0', '10.0.0', '172.16.0'];
    const range = this.selectFromArray(privateRanges);
    const lastOctet = Math.floor(this.seededRandom() * 254) + 2;
    const webrtcLocalIP = `${range}.${lastOctet}`;

    // Generate consistent public IP (using common ISP ranges)
    const publicRanges = ['203.0.113', '198.51.100', '203.113.0'];
    const publicRange = this.selectFromArray(publicRanges);
    const publicLast = Math.floor(this.seededRandom() * 254) + 1;
    const webrtcPublicIP = `${publicRange}.${publicLast}`;

    return { webrtcLocalIP, webrtcPublicIP };
  }

  private generateConsistentPerformance(cores: number, memory: number) {
    // Performance metrics should correlate with hardware
    const baseConnectTime = cores >= 8 ? 50 : 100;
    const baseDomainLookup = cores >= 8 ? 10 : 20;
    const baseLoadTime = memory >= 16 ? 200 : 400;

    return {
      connectTime: baseConnectTime + Math.floor(this.seededRandom() * 20),
      domainLookupTime: baseDomainLookup + Math.floor(this.seededRandom() * 10),
      loadEventTime: baseLoadTime + Math.floor(this.seededRandom() * 100)
    };
  }

  // Getters for consistent values
  getConsistentFingerprint(): ConsistentFingerprint {
    return { ...this.consistentFingerprint };
  }

  getConsistentValue(key: keyof ConsistentFingerprint): any {
    return this.consistentFingerprint[key];
  }

  // Generate injection script for consistent values
  getConsistencyInjectionScript(): string {
    const fp = this.consistentFingerprint;
    
    return `
      // Fingerprint Consistency Manager - ensures all APIs return correlated values
      window.__fingerprintConsistency = ${JSON.stringify(fp)};
      
      // Apply consistency to navigator properties
      if (typeof navigator !== 'undefined') {
        Object.defineProperties(navigator, {
          hardwareConcurrency: {
            get: () => window.__fingerprintConsistency.hardwareConcurrency,
            configurable: true
          },
          deviceMemory: {
            get: () => window.__fingerprintConsistency.deviceMemory,
            configurable: true
          },
          maxTouchPoints: {
            get: () => window.__fingerprintConsistency.maxTouchPoints,
            configurable: true
          },
          platform: {
            get: () => window.__fingerprintConsistency.platform,
            configurable: true
          },
          userAgent: {
            get: () => window.__fingerprintConsistency.userAgent,
            configurable: true
          },
          languages: {
            get: () => window.__fingerprintConsistency.languages,
            configurable: true
          }
        });
      }
      
      // Apply consistency to screen properties
      if (typeof screen !== 'undefined') {
        Object.defineProperties(screen, {
          width: {
            get: () => window.__fingerprintConsistency.screenWidth,
            configurable: true
          },
          height: {
            get: () => window.__fingerprintConsistency.screenHeight,
            configurable: true
          },
          availWidth: {
            get: () => window.__fingerprintConsistency.availWidth,
            configurable: true
          },
          availHeight: {
            get: () => window.__fingerprintConsistency.availHeight,
            configurable: true
          },
          colorDepth: {
            get: () => window.__fingerprintConsistency.colorDepth,
            configurable: true
          },
          pixelDepth: {
            get: () => window.__fingerprintConsistency.pixelDepth,
            configurable: true
          }
        });
      }
      
      // Apply consistency to window properties
      if (typeof window !== 'undefined') {
        Object.defineProperties(window, {
          innerWidth: {
            get: () => window.__fingerprintConsistency.availWidth,
            configurable: true
          },
          innerHeight: {
            get: () => window.__fingerprintConsistency.availHeight,
            configurable: true
          },
          outerWidth: {
            get: () => window.__fingerprintConsistency.screenWidth,
            configurable: true
          },
          outerHeight: {
            get: () => window.__fingerprintConsistency.screenHeight,
            configurable: true
          },
          devicePixelRatio: {
            get: () => window.__fingerprintConsistency.devicePixelRatio,
            configurable: true
          }
        });
      }
      
      // Apply consistency to Date/timezone
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
        Intl.DateTimeFormat.prototype.resolvedOptions = function() {
          const options = originalResolvedOptions.call(this);
          return {
            ...options,
            timeZone: window.__fingerprintConsistency.timezone
          };
        };
      }
    `;
  }

  destroy(): void {
    this.logger.info('Fingerprint consistency manager destroyed');
  }
}