"use strict";
/**
 * Comprehensive Engine Configuration System
 * Provides unified access to all browser engine emulation configurations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineCompatibilityMatrix = exports.EngineConfigFactory = exports.networkConfigs = exports.hardwareConfigs = exports.domEngineConfigs = exports.cssEngineConfigs = exports.javascriptEngineConfigs = exports.unifiedEngineConfigs = void 0;
exports.getEngineConfig = getEngineConfig;
exports.getBrowserEngineConfigs = getBrowserEngineConfigs;
exports.getSupportedBrowsers = getSupportedBrowsers;
exports.isValidBrowserEngine = isValidBrowserEngine;
exports.getEngineCompatibility = getEngineCompatibility;
const javascript_engine_1 = require("./engines/javascript-engine");
Object.defineProperty(exports, "javascriptEngineConfigs", { enumerable: true, get: function () { return javascript_engine_1.engineConfigs; } });
const css_engine_1 = require("./engines/css-engine");
Object.defineProperty(exports, "cssEngineConfigs", { enumerable: true, get: function () { return css_engine_1.cssEngineConfigs; } });
const dom_engine_1 = require("./engines/dom-engine");
Object.defineProperty(exports, "domEngineConfigs", { enumerable: true, get: function () { return dom_engine_1.domEngineConfigs; } });
const hardware_engine_1 = require("./engines/hardware-engine");
Object.defineProperty(exports, "hardwareConfigs", { enumerable: true, get: function () { return hardware_engine_1.hardwareConfigs; } });
const network_engine_1 = require("./engines/network-engine");
Object.defineProperty(exports, "networkConfigs", { enumerable: true, get: function () { return network_engine_1.networkConfigs; } });
// Unified configuration for each browser
exports.unifiedEngineConfigs = {
    chrome: {
        javascript: javascript_engine_1.engineConfigs.chrome,
        css: css_engine_1.cssEngineConfigs.chrome,
        dom: dom_engine_1.domEngineConfigs.chrome,
        hardware: hardware_engine_1.hardwareConfigs.chrome,
        network: network_engine_1.networkConfigs.chrome
    },
    firefox: {
        javascript: javascript_engine_1.engineConfigs.firefox,
        css: css_engine_1.cssEngineConfigs.firefox,
        dom: dom_engine_1.domEngineConfigs.firefox,
        hardware: hardware_engine_1.hardwareConfigs.firefox,
        network: network_engine_1.networkConfigs.firefox
    },
    safari: {
        javascript: javascript_engine_1.engineConfigs.safari,
        css: css_engine_1.cssEngineConfigs.safari,
        dom: dom_engine_1.domEngineConfigs.safari,
        hardware: hardware_engine_1.hardwareConfigs.safari,
        network: network_engine_1.networkConfigs.safari
    }
};
// Add edge (chromium-based) configuration
exports.unifiedEngineConfigs.edge = {
    javascript: { ...javascript_engine_1.engineConfigs.chrome, version: '120.0.6099.109-edge' },
    css: { ...css_engine_1.cssEngineConfigs.chrome, version: '120.0.6099.109-edge' },
    dom: { ...dom_engine_1.domEngineConfigs.chrome, version: '120.0.6099.109-edge' },
    hardware: { ...hardware_engine_1.hardwareConfigs.chrome },
    network: { ...network_engine_1.networkConfigs.chrome }
};
/**
 * Get engine configuration for specific browser and engine type
 * @param browser Browser name (chrome, firefox, safari, edge)
 * @param engineType Type of engine (javascript, css, dom, hardware, network)
 * @returns Engine configuration or null if not found
 */
function getEngineConfig(browser, engineType) {
    const browserConfig = exports.unifiedEngineConfigs[browser];
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
function getBrowserEngineConfigs(browser) {
    return exports.unifiedEngineConfigs[browser] || null;
}
/**
 * Get list of supported browsers
 * @returns Array of supported browser names
 */
function getSupportedBrowsers() {
    return Object.keys(exports.unifiedEngineConfigs);
}
/**
 * Validate browser and engine combination
 * @param browser Browser name
 * @param engineType Engine type
 * @returns true if combination is supported
 */
function isValidBrowserEngine(browser, engineType) {
    return !!(exports.unifiedEngineConfigs[browser]?.[engineType]);
}
// Engine factory functions
class EngineConfigFactory {
    /**
     * Create a custom JavaScript engine configuration
     */
    static createJSEngineConfig(overrides) {
        return {
            ...javascript_engine_1.engineConfigs.chrome,
            ...overrides
        };
    }
    /**
     * Create a custom CSS engine configuration
     */
    static createCSSEngineConfig(overrides) {
        return {
            ...css_engine_1.cssEngineConfigs.chrome,
            ...overrides
        };
    }
    /**
     * Create a custom DOM engine configuration
     */
    static createDOMEngineConfig(overrides) {
        return {
            ...dom_engine_1.domEngineConfigs.chrome,
            ...overrides
        };
    }
    /**
     * Create a custom hardware engine configuration
     */
    static createHardwareEngineConfig(overrides) {
        return {
            ...hardware_engine_1.hardwareConfigs.chrome,
            ...overrides
        };
    }
    /**
     * Create a custom network engine configuration
     */
    static createNetworkEngineConfig(overrides) {
        return {
            ...network_engine_1.networkConfigs.chrome,
            ...overrides
        };
    }
    /**
     * Create a complete unified engine configuration
     */
    static createUnifiedConfig(browser = 'chrome', overrides = {}) {
        const baseConfig = exports.unifiedEngineConfigs[browser] || exports.unifiedEngineConfigs.chrome;
        return {
            javascript: { ...baseConfig.javascript, ...overrides.javascript },
            css: { ...baseConfig.css, ...overrides.css },
            dom: { ...baseConfig.dom, ...overrides.dom },
            hardware: { ...baseConfig.hardware, ...overrides.hardware },
            network: { ...baseConfig.network, ...overrides.network }
        };
    }
}
exports.EngineConfigFactory = EngineConfigFactory;
/**
 * Engine compatibility matrix
 * Defines which engines work together for realistic browser emulation
 */
exports.engineCompatibilityMatrix = {
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
function getEngineCompatibility(browser) {
    return exports.engineCompatibilityMatrix[browser];
}
//# sourceMappingURL=engine-configs.js.map