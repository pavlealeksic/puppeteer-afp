"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreepJSEvasion = exports.WebDriverEvasion = exports.EnhancedNavigatorProtection = exports.FingerprintConsistencyManager = exports.RealWorldDetectorTester = exports.RealWorldTester = exports.StealthValidator = exports.DynamicProfileSystem = exports.ComprehensiveAdvancedProtection = exports.StorageProtection = exports.BehavioralProtection = exports.NetworkTimingProtection = exports.MobileProtection = exports.ClipboardProtection = exports.AdvancedCanvasProtection = exports.WasmProtection = exports.FontProtection = exports.AdvancedProtections = exports.createProtectedBrowser = exports.BrowserIntegration = exports.networkConfigs = exports.NetworkEngineEmulator = exports.hardwareConfigs = exports.HardwareEmulator = exports.domEngineConfigs = exports.DOMEngineEmulator = exports.cssEngineConfigs = exports.CSSEngineEmulator = exports.jsEngineConfigs = exports.JavaScriptEngineEmulator = exports.getEngineCompatibility = exports.EngineConfigFactory = exports.isValidBrowserEngine = exports.getSupportedBrowsers = exports.getBrowserEngineConfigs = exports.getEngineConfig = exports.unifiedEngineConfigs = exports.validateOptions = exports.profiles = exports.Logger = exports.FingerprintProtection = void 0;
exports.protectPage = protectPage;
exports.protectedBrowser = protectedBrowser;
exports.getProfile = getProfile;
exports.generateRandomOptions = generateRandomOptions;
const protection_1 = require("./protection");
const profiles_1 = require("./profiles");
/**
 * Protect a Puppeteer page with anti-fingerprinting measures
 */
async function protectPage(page, options) {
    const protection = new protection_1.FingerprintProtection(options);
    return await protection.protectPage(page);
}
/**
 * Create a protected browser instance with automatic page protection
 */
async function protectedBrowser(browser, options) {
    const protectedBrowser = browser;
    protectedBrowser.newProtectedPage = async (pageOptions) => {
        const page = await browser.newPage();
        const mergedOptions = { ...options, ...pageOptions };
        return await protectPage(page, mergedOptions);
    };
    return protectedBrowser;
}
/**
 * Get a predefined fingerprint profile
 */
function getProfile(name) {
    if (!profiles_1.profiles[name]) {
        throw new Error(`Profile "${name}" not found`);
    }
    return profiles_1.profiles[name];
}
/**
 * Generate random protection options
 */
function generateRandomOptions() {
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
var protection_2 = require("./protection");
Object.defineProperty(exports, "FingerprintProtection", { enumerable: true, get: function () { return protection_2.FingerprintProtection; } });
var logger_1 = require("./logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
var profiles_2 = require("./profiles");
Object.defineProperty(exports, "profiles", { enumerable: true, get: function () { return profiles_2.profiles; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "validateOptions", { enumerable: true, get: function () { return validation_1.validateOptions; } });
__exportStar(require("./types"), exports);
// Export advanced engine configurations
var engine_configs_1 = require("./engine-configs");
Object.defineProperty(exports, "unifiedEngineConfigs", { enumerable: true, get: function () { return engine_configs_1.unifiedEngineConfigs; } });
Object.defineProperty(exports, "getEngineConfig", { enumerable: true, get: function () { return engine_configs_1.getEngineConfig; } });
Object.defineProperty(exports, "getBrowserEngineConfigs", { enumerable: true, get: function () { return engine_configs_1.getBrowserEngineConfigs; } });
Object.defineProperty(exports, "getSupportedBrowsers", { enumerable: true, get: function () { return engine_configs_1.getSupportedBrowsers; } });
Object.defineProperty(exports, "isValidBrowserEngine", { enumerable: true, get: function () { return engine_configs_1.isValidBrowserEngine; } });
Object.defineProperty(exports, "EngineConfigFactory", { enumerable: true, get: function () { return engine_configs_1.EngineConfigFactory; } });
Object.defineProperty(exports, "getEngineCompatibility", { enumerable: true, get: function () { return engine_configs_1.getEngineCompatibility; } });
// Export individual engine classes for advanced users
var javascript_engine_1 = require("./engines/javascript-engine");
Object.defineProperty(exports, "JavaScriptEngineEmulator", { enumerable: true, get: function () { return javascript_engine_1.JavaScriptEngineEmulator; } });
Object.defineProperty(exports, "jsEngineConfigs", { enumerable: true, get: function () { return javascript_engine_1.engineConfigs; } });
var css_engine_1 = require("./engines/css-engine");
Object.defineProperty(exports, "CSSEngineEmulator", { enumerable: true, get: function () { return css_engine_1.CSSEngineEmulator; } });
Object.defineProperty(exports, "cssEngineConfigs", { enumerable: true, get: function () { return css_engine_1.cssEngineConfigs; } });
var dom_engine_1 = require("./engines/dom-engine");
Object.defineProperty(exports, "DOMEngineEmulator", { enumerable: true, get: function () { return dom_engine_1.DOMEngineEmulator; } });
Object.defineProperty(exports, "domEngineConfigs", { enumerable: true, get: function () { return dom_engine_1.domEngineConfigs; } });
var hardware_engine_1 = require("./engines/hardware-engine");
Object.defineProperty(exports, "HardwareEmulator", { enumerable: true, get: function () { return hardware_engine_1.HardwareEmulator; } });
Object.defineProperty(exports, "hardwareConfigs", { enumerable: true, get: function () { return hardware_engine_1.hardwareConfigs; } });
var network_engine_1 = require("./engines/network-engine");
Object.defineProperty(exports, "NetworkEngineEmulator", { enumerable: true, get: function () { return network_engine_1.NetworkEngineEmulator; } });
Object.defineProperty(exports, "networkConfigs", { enumerable: true, get: function () { return network_engine_1.networkConfigs; } });
// Export advanced browser integration
var browser_integration_1 = require("./browser-integration");
Object.defineProperty(exports, "BrowserIntegration", { enumerable: true, get: function () { return browser_integration_1.BrowserIntegration; } });
Object.defineProperty(exports, "createProtectedBrowser", { enumerable: true, get: function () { return browser_integration_1.createProtectedBrowser; } });
var advanced_protections_1 = require("./advanced-protections");
Object.defineProperty(exports, "AdvancedProtections", { enumerable: true, get: function () { return advanced_protections_1.AdvancedProtections; } });
// Export advanced protection modules
var font_protection_1 = require("./protections/font-protection");
Object.defineProperty(exports, "FontProtection", { enumerable: true, get: function () { return font_protection_1.FontProtection; } });
var wasm_protection_1 = require("./protections/wasm-protection");
Object.defineProperty(exports, "WasmProtection", { enumerable: true, get: function () { return wasm_protection_1.WasmProtection; } });
var canvas_advanced_1 = require("./protections/canvas-advanced");
Object.defineProperty(exports, "AdvancedCanvasProtection", { enumerable: true, get: function () { return canvas_advanced_1.AdvancedCanvasProtection; } });
var clipboard_protection_1 = require("./protections/clipboard-protection");
Object.defineProperty(exports, "ClipboardProtection", { enumerable: true, get: function () { return clipboard_protection_1.ClipboardProtection; } });
var mobile_protection_1 = require("./protections/mobile-protection");
Object.defineProperty(exports, "MobileProtection", { enumerable: true, get: function () { return mobile_protection_1.MobileProtection; } });
var network_timing_protection_1 = require("./protections/network-timing-protection");
Object.defineProperty(exports, "NetworkTimingProtection", { enumerable: true, get: function () { return network_timing_protection_1.NetworkTimingProtection; } });
var behavioral_protection_1 = require("./protections/behavioral-protection");
Object.defineProperty(exports, "BehavioralProtection", { enumerable: true, get: function () { return behavioral_protection_1.BehavioralProtection; } });
var storage_protection_1 = require("./protections/storage-protection");
Object.defineProperty(exports, "StorageProtection", { enumerable: true, get: function () { return storage_protection_1.StorageProtection; } });
var comprehensive_advanced_1 = require("./protections/comprehensive-advanced");
Object.defineProperty(exports, "ComprehensiveAdvancedProtection", { enumerable: true, get: function () { return comprehensive_advanced_1.ComprehensiveAdvancedProtection; } });
// Export advanced systems
var dynamic_profiles_1 = require("./systems/dynamic-profiles");
Object.defineProperty(exports, "DynamicProfileSystem", { enumerable: true, get: function () { return dynamic_profiles_1.DynamicProfileSystem; } });
var stealth_validator_1 = require("./systems/stealth-validator");
Object.defineProperty(exports, "StealthValidator", { enumerable: true, get: function () { return stealth_validator_1.StealthValidator; } });
var real_world_tests_1 = require("./testing/real-world-tests");
Object.defineProperty(exports, "RealWorldTester", { enumerable: true, get: function () { return real_world_tests_1.RealWorldTester; } });
var real_world_detector_tests_1 = require("./testing/real-world-detector-tests");
Object.defineProperty(exports, "RealWorldDetectorTester", { enumerable: true, get: function () { return real_world_detector_tests_1.RealWorldDetectorTester; } });
// Export new advanced protection modules
var fingerprint_consistency_1 = require("./systems/fingerprint-consistency");
Object.defineProperty(exports, "FingerprintConsistencyManager", { enumerable: true, get: function () { return fingerprint_consistency_1.FingerprintConsistencyManager; } });
var enhanced_navigator_protection_1 = require("./protections/enhanced-navigator-protection");
Object.defineProperty(exports, "EnhancedNavigatorProtection", { enumerable: true, get: function () { return enhanced_navigator_protection_1.EnhancedNavigatorProtection; } });
var webdriver_evasion_1 = require("./protections/webdriver-evasion");
Object.defineProperty(exports, "WebDriverEvasion", { enumerable: true, get: function () { return webdriver_evasion_1.WebDriverEvasion; } });
var creepjs_evasion_1 = require("./protections/creepjs-evasion");
Object.defineProperty(exports, "CreepJSEvasion", { enumerable: true, get: function () { return creepjs_evasion_1.CreepJSEvasion; } });
//# sourceMappingURL=index.js.map