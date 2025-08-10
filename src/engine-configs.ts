/**
 * Comprehensive Engine Configuration System
 * Provides unified access to all browser engine emulation configurations
 */

import { engineConfigs as jsEngineConfigs, JSEngineConfig } from './engines/javascript-engine';
import { cssEngineConfigs as cssConfigs, CSSEngineConfig } from './engines/css-engine';
import { domEngineConfigs as domConfigs, DOMEngineConfig } from './engines/dom-engine';
import { hardwareConfigs as hwConfigs, HardwareConfig } from './engines/hardware-engine';
import { networkConfigs as netConfigs, NetworkEngineConfig } from './engines/network-engine';

export interface UnifiedEngineConfig {
  javascript: JSEngineConfig;
  css: CSSEngineConfig;
  dom: DOMEngineConfig;
  hardware: HardwareConfig;
  network: NetworkEngineConfig;
}

// Unified configuration for each browser
export const unifiedEngineConfigs: Record<string, UnifiedEngineConfig> = {
  chrome: {
    javascript: jsEngineConfigs.chrome,
    css: cssConfigs.chrome,
    dom: domConfigs.chrome,
    hardware: hwConfigs.chrome,
    network: netConfigs.chrome
  },
  
  firefox: {
    javascript: jsEngineConfigs.firefox,
    css: cssConfigs.firefox,
    dom: domConfigs.firefox,
    hardware: hwConfigs.firefox,
    network: netConfigs.firefox
  },
  
  safari: {
    javascript: jsEngineConfigs.safari,
    css: cssConfigs.safari,
    dom: domConfigs.safari,
    hardware: hwConfigs.safari,
    network: netConfigs.safari
  }
};

// Add edge (chromium-based) configuration
unifiedEngineConfigs.edge = {
  javascript: { ...jsEngineConfigs.chrome, version: '120.0.6099.109-edge' },
  css: { ...cssConfigs.chrome, version: '120.0.6099.109-edge' },
  dom: { ...domConfigs.chrome, version: '120.0.6099.109-edge' },
  hardware: { ...hwConfigs.chrome },
  network: { ...netConfigs.chrome }
};

/**
 * Get engine configuration for specific browser and engine type
 * @param browser Browser name (chrome, firefox, safari, edge)
 * @param engineType Type of engine (javascript, css, dom, hardware, network)
 * @returns Engine configuration or null if not found
 */
export function getEngineConfig<T extends keyof UnifiedEngineConfig>(
  browser: string, 
  engineType: T
): UnifiedEngineConfig[T] | null {
  const browserConfig = unifiedEngineConfigs[browser];
  if (!browserConfig) {
    console.warn(`No configuration found for browser: ${browser}`);
    return null;
  }
  
  const engineConfig = browserConfig[engineType];
  if (!engineConfig) {
    console.warn(`No ${engineType} engine configuration found for browser: ${browser}`);
    return null;
  }
  
  return engineConfig;
}

/**
 * Get all engine configurations for a specific browser
 * @param browser Browser name
 * @returns Complete engine configuration set or null
 */
export function getBrowserEngineConfigs(browser: string): UnifiedEngineConfig | null {
  return unifiedEngineConfigs[browser] || null;
}

/**
 * Get list of supported browsers
 * @returns Array of supported browser names
 */
export function getSupportedBrowsers(): string[] {
  return Object.keys(unifiedEngineConfigs);
}

/**
 * Validate browser and engine combination
 * @param browser Browser name
 * @param engineType Engine type
 * @returns true if combination is supported
 */
export function isValidBrowserEngine(browser: string, engineType: keyof UnifiedEngineConfig): boolean {
  return !!(unifiedEngineConfigs[browser]?.[engineType]);
}

// Export individual engine configs for backward compatibility
export {
  jsEngineConfigs as javascriptEngineConfigs,
  cssConfigs as cssEngineConfigs,
  domConfigs as domEngineConfigs,
  hwConfigs as hardwareConfigs,
  netConfigs as networkConfigs
};

// Engine factory functions
export class EngineConfigFactory {
  /**
   * Create a custom JavaScript engine configuration
   */
  static createJSEngineConfig(overrides: Partial<JSEngineConfig>): JSEngineConfig {
    return {
      ...jsEngineConfigs.chrome,
      ...overrides
    };
  }
  
  /**
   * Create a custom CSS engine configuration
   */
  static createCSSEngineConfig(overrides: Partial<CSSEngineConfig>): CSSEngineConfig {
    return {
      ...cssConfigs.chrome,
      ...overrides
    };
  }
  
  /**
   * Create a custom DOM engine configuration
   */
  static createDOMEngineConfig(overrides: Partial<DOMEngineConfig>): DOMEngineConfig {
    return {
      ...domConfigs.chrome,
      ...overrides
    };
  }
  
  /**
   * Create a custom hardware engine configuration
   */
  static createHardwareEngineConfig(overrides: Partial<HardwareConfig>): HardwareConfig {
    return {
      ...hwConfigs.chrome,
      ...overrides
    };
  }
  
  /**
   * Create a custom network engine configuration
   */
  static createNetworkEngineConfig(overrides: Partial<NetworkEngineConfig>): NetworkEngineConfig {
    return {
      ...netConfigs.chrome,
      ...overrides
    };
  }
  
  /**
   * Create a complete unified engine configuration
   */
  static createUnifiedConfig(
    browser: string = 'chrome',
    overrides: Partial<UnifiedEngineConfig> = {}
  ): UnifiedEngineConfig {
    const baseConfig = unifiedEngineConfigs[browser] || unifiedEngineConfigs.chrome;
    
    return {
      javascript: { ...baseConfig.javascript, ...overrides.javascript },
      css: { ...baseConfig.css, ...overrides.css },
      dom: { ...baseConfig.dom, ...overrides.dom },
      hardware: { ...baseConfig.hardware, ...overrides.hardware },
      network: { ...baseConfig.network, ...overrides.network }
    };
  }
}

/**
 * Engine compatibility matrix
 * Defines which engines work together for realistic browser emulation
 */
export const engineCompatibilityMatrix = {
  chrome: {
    javascript: 'v8',
    css: 'blink',
    dom: 'blink',
    rendering: 'skia',
    network: 'chromium'
  },
  firefox: {
    javascript: 'spidermonkey',
    css: 'gecko',
    dom: 'gecko',
    rendering: 'gecko',
    network: 'necko'
  },
  safari: {
    javascript: 'javascriptcore',
    css: 'webkit',
    dom: 'webkit',
    rendering: 'webkit',
    network: 'webkit'
  },
  edge: {
    javascript: 'v8',
    css: 'blink',
    dom: 'blink',
    rendering: 'skia',
    network: 'chromium'
  }
};

/**
 * Get engine compatibility info for a browser
 * @param browser Browser name
 * @returns Compatibility information
 */
export function getEngineCompatibility(browser: string) {
  return engineCompatibilityMatrix[browser as keyof typeof engineCompatibilityMatrix];
}