import { Page, Browser } from 'puppeteer';
import { FingerprintProtection } from './protection';
import { 
  ProtectionOptions, 
  ProtectedPage, 
  ProtectedBrowser,
  FingerprintProfile
} from './types';
import { profiles } from './profiles';
import { Logger } from './logger';

/**
 * Protect a Puppeteer page with anti-fingerprinting measures
 */
export async function protectPage(
  page: Page, 
  options?: ProtectionOptions
): Promise<ProtectedPage> {
  const protection = new FingerprintProtection(options);
  return await protection.protectPage(page);
}

/**
 * Create a protected browser instance with automatic page protection
 */
export async function protectedBrowser(
  browser: Browser, 
  options?: ProtectionOptions
): Promise<ProtectedBrowser> {
  const protectedBrowser = browser as ProtectedBrowser;
  
  protectedBrowser.newProtectedPage = async (pageOptions?: ProtectionOptions) => {
    const page = await browser.newPage();
    const mergedOptions = { ...options, ...pageOptions };
    return await protectPage(page, mergedOptions);
  };
  
  return protectedBrowser;
}

/**
 * Get a predefined fingerprint profile
 */
export function getProfile(name: 'chrome' | 'firefox' | 'safari' | 'edge'): FingerprintProfile {
  if (!profiles[name]) {
    throw new Error(`Profile "${name}" not found`);
  }
  return profiles[name];
}

/**
 * Generate random protection options
 */
export function generateRandomOptions(): ProtectionOptions {
  return {
    canvasRgba: [
      Math.floor(Math.random() * 10) - 5,
      Math.floor(Math.random() * 10) - 5,
      Math.floor(Math.random() * 10) - 5,
      Math.floor(Math.random() * 10) - 5
    ],
    fontFingerprint: {
      noise: Math.floor(Math.random() * 4) - 1,
      sign: Math.random() < 0.5 ? -1 : 1
    },
    audioFingerprint: {
      getChannelDataIndexRandom: Math.random(),
      getChannelDataResultRandom: Math.random(),
      createAnalyserIndexRandom: Math.random(),
      createAnalyserResultRandom: Math.random()
    },
    hardwareConfig: {
      hardwareConcurrency: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
      deviceMemory: [2, 4, 8, 16][Math.floor(Math.random() * 4)]
    },
    screenConfig: {
      width: [1366, 1440, 1920, 2560][Math.floor(Math.random() * 4)],
      height: [768, 900, 1080, 1440][Math.floor(Math.random() * 4)],
      availWidth: 1920,
      availHeight: 1040,
      colorDepth: [24, 30, 32][Math.floor(Math.random() * 3)],
      pixelDepth: [24, 30, 32][Math.floor(Math.random() * 3)]
    },
    timezoneConfig: {
      timezone: ['America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London'][Math.floor(Math.random() * 4)],
      locale: ['en-US', 'en-GB', 'en-CA'][Math.floor(Math.random() * 3)]
    },
    batteryConfig: {
      charging: Math.random() > 0.5,
      chargingTime: Math.floor(Math.random() * 3600),
      dischargingTime: Math.floor(Math.random() * 10800),
      level: Math.random()
    },
    languageConfig: {
      languages: [['en-US', 'en'], ['en-GB', 'en'], ['en-CA', 'en']][Math.floor(Math.random() * 3)],
      language: ['en-US', 'en-GB', 'en-CA'][Math.floor(Math.random() * 3)],
      platform: ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)]
    }
  };
}

// Export everything
export { FingerprintProtection } from './protection';
export { Logger } from './logger';
export { profiles } from './profiles';
export { validateOptions } from './validation';
export * from './types';

// Export advanced engine configurations
export {
  unifiedEngineConfigs,
  getEngineConfig,
  getBrowserEngineConfigs,
  getSupportedBrowsers,
  isValidBrowserEngine,
  EngineConfigFactory,
  getEngineCompatibility,
  UnifiedEngineConfig
} from './engine-configs';

// Export individual engine classes for advanced users
export { JavaScriptEngineEmulator, engineConfigs as jsEngineConfigs } from './engines/javascript-engine';
export { CSSEngineEmulator, cssEngineConfigs } from './engines/css-engine';
export { DOMEngineEmulator, domEngineConfigs } from './engines/dom-engine';
export { HardwareEmulator, hardwareConfigs } from './engines/hardware-engine';
export { NetworkEngineEmulator, networkConfigs } from './engines/network-engine';

// Export advanced browser integration
export { BrowserIntegration, createProtectedBrowser } from './browser-integration';
export { AdvancedProtections } from './advanced-protections';

// Export advanced protection modules
export { FontProtection } from './protections/font-protection';
export { WasmProtection } from './protections/wasm-protection';
export { AdvancedCanvasProtection } from './protections/canvas-advanced';
export { ClipboardProtection } from './protections/clipboard-protection';
export { MobileProtection } from './protections/mobile-protection';
export { NetworkTimingProtection } from './protections/network-timing-protection';
export { BehavioralProtection } from './protections/behavioral-protection';
export { StorageProtection } from './protections/storage-protection';
export { ComprehensiveAdvancedProtection } from './protections/comprehensive-advanced';

// Export advanced systems
export { DynamicProfileSystem, DynamicProfile, ProfileMetrics } from './systems/dynamic-profiles';
export { StealthValidator, ValidationResult, StealthReport } from './systems/stealth-validator';
export { RealWorldTester, FingerprintTestResult } from './testing/real-world-tests';
export { RealWorldDetectorTester, DetectorTestResult, DetectorTestSuite } from './testing/real-world-detector-tests';

// Export new advanced protection modules
export { FingerprintConsistencyManager, ConsistentFingerprint } from './systems/fingerprint-consistency';
export { EnhancedNavigatorProtection } from './protections/enhanced-navigator-protection';
export { WebDriverEvasion } from './protections/webdriver-evasion';
export { CreepJSEvasion } from './protections/creepjs-evasion';