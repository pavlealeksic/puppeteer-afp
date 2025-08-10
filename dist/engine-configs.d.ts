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
export declare const unifiedEngineConfigs: Record<string, UnifiedEngineConfig>;
/**
 * Get engine configuration for specific browser and engine type
 * @param browser Browser name (chrome, firefox, safari, edge)
 * @param engineType Type of engine (javascript, css, dom, hardware, network)
 * @returns Engine configuration or null if not found
 */
export declare function getEngineConfig<T extends keyof UnifiedEngineConfig>(browser: string, engineType: T): UnifiedEngineConfig[T] | null;
/**
 * Get all engine configurations for a specific browser
 * @param browser Browser name
 * @returns Complete engine configuration set or null
 */
export declare function getBrowserEngineConfigs(browser: string): UnifiedEngineConfig | null;
/**
 * Get list of supported browsers
 * @returns Array of supported browser names
 */
export declare function getSupportedBrowsers(): string[];
/**
 * Validate browser and engine combination
 * @param browser Browser name
 * @param engineType Engine type
 * @returns true if combination is supported
 */
export declare function isValidBrowserEngine(browser: string, engineType: keyof UnifiedEngineConfig): boolean;
export { jsEngineConfigs as javascriptEngineConfigs, cssConfigs as cssEngineConfigs, domConfigs as domEngineConfigs, hwConfigs as hardwareConfigs, netConfigs as networkConfigs };
export declare class EngineConfigFactory {
    /**
     * Create a custom JavaScript engine configuration
     */
    static createJSEngineConfig(overrides: Partial<JSEngineConfig>): JSEngineConfig;
    /**
     * Create a custom CSS engine configuration
     */
    static createCSSEngineConfig(overrides: Partial<CSSEngineConfig>): CSSEngineConfig;
    /**
     * Create a custom DOM engine configuration
     */
    static createDOMEngineConfig(overrides: Partial<DOMEngineConfig>): DOMEngineConfig;
    /**
     * Create a custom hardware engine configuration
     */
    static createHardwareEngineConfig(overrides: Partial<HardwareConfig>): HardwareConfig;
    /**
     * Create a custom network engine configuration
     */
    static createNetworkEngineConfig(overrides: Partial<NetworkEngineConfig>): NetworkEngineConfig;
    /**
     * Create a complete unified engine configuration
     */
    static createUnifiedConfig(browser?: string, overrides?: Partial<UnifiedEngineConfig>): UnifiedEngineConfig;
}
/**
 * Engine compatibility matrix
 * Defines which engines work together for realistic browser emulation
 */
export declare const engineCompatibilityMatrix: {
    chrome: {
        javascript: string;
        css: string;
        dom: string;
        rendering: string;
        network: string;
    };
    firefox: {
        javascript: string;
        css: string;
        dom: string;
        rendering: string;
        network: string;
    };
    safari: {
        javascript: string;
        css: string;
        dom: string;
        rendering: string;
        network: string;
    };
    edge: {
        javascript: string;
        css: string;
        dom: string;
        rendering: string;
        network: string;
    };
};
/**
 * Get engine compatibility info for a browser
 * @param browser Browser name
 * @returns Compatibility information
 */
export declare function getEngineCompatibility(browser: string): {
    javascript: string;
    css: string;
    dom: string;
    rendering: string;
    network: string;
} | {
    javascript: string;
    css: string;
    dom: string;
    rendering: string;
    network: string;
} | {
    javascript: string;
    css: string;
    dom: string;
    rendering: string;
    network: string;
} | {
    javascript: string;
    css: string;
    dom: string;
    rendering: string;
    network: string;
};
//# sourceMappingURL=engine-configs.d.ts.map