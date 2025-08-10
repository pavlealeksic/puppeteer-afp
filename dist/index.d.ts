import { Page, Browser } from 'puppeteer';
import { ProtectionOptions, ProtectedPage, ProtectedBrowser, FingerprintProfile } from './types';
/**
 * Protect a Puppeteer page with anti-fingerprinting measures
 */
export declare function protectPage(page: Page, options?: ProtectionOptions): Promise<ProtectedPage>;
/**
 * Create a protected browser instance with automatic page protection
 */
export declare function protectedBrowser(browser: Browser, options?: ProtectionOptions): Promise<ProtectedBrowser>;
/**
 * Get a predefined fingerprint profile
 */
export declare function getProfile(name: 'chrome' | 'firefox' | 'safari' | 'edge'): FingerprintProfile;
/**
 * Generate random protection options
 */
export declare function generateRandomOptions(): ProtectionOptions;
export { FingerprintProtection } from './protection';
export { Logger } from './logger';
export { profiles } from './profiles';
export { validateOptions } from './validation';
export * from './types';
export { unifiedEngineConfigs, getEngineConfig, getBrowserEngineConfigs, getSupportedBrowsers, isValidBrowserEngine, EngineConfigFactory, getEngineCompatibility, UnifiedEngineConfig } from './engine-configs';
export { JavaScriptEngineEmulator, engineConfigs as jsEngineConfigs } from './engines/javascript-engine';
export { CSSEngineEmulator, cssEngineConfigs } from './engines/css-engine';
export { DOMEngineEmulator, domEngineConfigs } from './engines/dom-engine';
export { HardwareEmulator, hardwareConfigs } from './engines/hardware-engine';
export { NetworkEngineEmulator, networkConfigs } from './engines/network-engine';
export { BrowserIntegration, createProtectedBrowser } from './browser-integration';
export { AdvancedProtections } from './advanced-protections';
export { FontProtection } from './protections/font-protection';
export { WasmProtection } from './protections/wasm-protection';
export { AdvancedCanvasProtection } from './protections/canvas-advanced';
export { ClipboardProtection } from './protections/clipboard-protection';
export { MobileProtection } from './protections/mobile-protection';
export { NetworkTimingProtection } from './protections/network-timing-protection';
export { BehavioralProtection } from './protections/behavioral-protection';
export { StorageProtection } from './protections/storage-protection';
export { ComprehensiveAdvancedProtection } from './protections/comprehensive-advanced';
export { DynamicProfileSystem, DynamicProfile, ProfileMetrics } from './systems/dynamic-profiles';
export { StealthValidator, ValidationResult, StealthReport } from './systems/stealth-validator';
export { RealWorldTester, FingerprintTestResult } from './testing/real-world-tests';
export { RealWorldDetectorTester, DetectorTestResult, DetectorTestSuite } from './testing/real-world-detector-tests';
export { FingerprintConsistencyManager, ConsistentFingerprint } from './systems/fingerprint-consistency';
export { EnhancedNavigatorProtection } from './protections/enhanced-navigator-protection';
export { WebDriverEvasion } from './protections/webdriver-evasion';
export { CreepJSEvasion } from './protections/creepjs-evasion';
//# sourceMappingURL=index.d.ts.map