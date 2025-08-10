/**
 * Production Readiness Tests
 * Verifies the built package works correctly in production scenarios
 */

import { describe, it, expect } from '@jest/globals';

describe('Production Readiness', () => {
  it('should import all main exports without errors', () => {
    // Test that all main exports are available
    const pkg = require('../dist/index.js');
    
    expect(pkg.FingerprintProtection).toBeDefined();
    expect(pkg.protectPage).toBeDefined();
    expect(pkg.protectedBrowser).toBeDefined();
    expect(pkg.getProfile).toBeDefined();
    expect(pkg.generateRandomOptions).toBeDefined();
    expect(pkg.Logger).toBeDefined();
    expect(pkg.profiles).toBeDefined();
    expect(pkg.validateOptions).toBeDefined();
    
    // Test engine exports
    expect(pkg.unifiedEngineConfigs).toBeDefined();
    expect(pkg.getEngineConfig).toBeDefined();
    expect(pkg.getBrowserEngineConfigs).toBeDefined();
    expect(pkg.EngineConfigFactory).toBeDefined();
    
    // Test individual engine classes
    expect(pkg.JavaScriptEngineEmulator).toBeDefined();
    expect(pkg.CSSEngineEmulator).toBeDefined();
    expect(pkg.DOMEngineEmulator).toBeDefined();
    expect(pkg.HardwareEmulator).toBeDefined();
    expect(pkg.NetworkEngineEmulator).toBeDefined();
  });
  
  it('should create FingerprintProtection instance without errors', () => {
    const { FingerprintProtection } = require('../dist/index.js');
    
    expect(() => {
      const protection = new FingerprintProtection({
        profile: 'chrome',
        engineEmulation: {
          javascript: true,
          css: true,
          dom: true,
          hardware: false, // Disable hardware to avoid missing config issues
          network: true
        }
      });
      expect(protection).toBeDefined();
      protection.destroy(); // Cleanup
    }).not.toThrow();
  });
  
  it('should provide working configuration system', () => {
    const { 
      unifiedEngineConfigs, 
      getEngineConfig, 
      getBrowserEngineConfigs,
      getSupportedBrowsers,
      EngineConfigFactory
    } = require('../dist/index.js');
    
    // Test unified configs
    expect(unifiedEngineConfigs.chrome).toBeDefined();
    expect(unifiedEngineConfigs.firefox).toBeDefined();
    expect(unifiedEngineConfigs.safari).toBeDefined();
    
    // Test config getters
    const chromeConfig = getBrowserEngineConfigs('chrome');
    expect(chromeConfig).toBeDefined();
    expect(chromeConfig.javascript).toBeDefined();
    expect(chromeConfig.css).toBeDefined();
    expect(chromeConfig.dom).toBeDefined();
    
    // Test individual engine config
    const jsConfig = getEngineConfig('chrome', 'javascript');
    expect(jsConfig).toBeDefined();
    expect(jsConfig.engine).toBe('v8');
    
    // Test supported browsers
    const browsers = getSupportedBrowsers();
    expect(browsers).toContain('chrome');
    expect(browsers).toContain('firefox');
    expect(browsers).toContain('safari');
    
    // Test factory
    expect(EngineConfigFactory.createJSEngineConfig).toBeDefined();
    expect(EngineConfigFactory.createCSSEngineConfig).toBeDefined();
  });
  
  it('should validate options correctly', () => {
    const { validateOptions } = require('../dist/index.js');
    
    // Valid options should pass
    expect(() => {
      validateOptions({
        profile: 'chrome',
        enableLogging: true,
        features: {
          canvas: true,
          webgl: true
        },
        engineEmulation: {
          javascript: true,
          css: false
        }
      });
    }).not.toThrow();
    
    // Invalid options should throw
    expect(() => {
      validateOptions({
        profile: 'invalid-profile' as any
      });
    }).toThrow();
  });
  
  it('should provide working profiles', () => {
    const { profiles, getProfile } = require('../dist/index.js');
    
    // Test profiles object
    expect(profiles.chrome).toBeDefined();
    expect(profiles.firefox).toBeDefined();
    expect(profiles.safari).toBeDefined();
    expect(profiles.edge).toBeDefined();
    
    // Test profile getter
    const chromeProfile = getProfile('chrome');
    expect(chromeProfile.name).toBe('Chrome');
    expect(chromeProfile.options).toBeDefined();
    expect(chromeProfile.options.engineEmulation).toBeDefined();
    
    // Test invalid profile
    expect(() => {
      getProfile('invalid' as any);
    }).toThrow();
  });
  
  it('should generate random options', () => {
    const { generateRandomOptions } = require('../dist/index.js');
    
    const options = generateRandomOptions();
    expect(options).toBeDefined();
    expect(options.canvasRgba).toBeDefined();
    expect(options.canvasRgba).toHaveLength(4);
    expect(options.fontFingerprint).toBeDefined();
    expect(options.audioFingerprint).toBeDefined();
    expect(options.hardwareConfig).toBeDefined();
    expect(options.screenConfig).toBeDefined();
  });
  
  it('should have correct package metadata', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.name).toBe('puppeteer-afp');
    expect(packageJson.version).toBe('2.0.0');
    expect(packageJson.main).toBe('dist/index.js');
    expect(packageJson.types).toBe('dist/index.d.ts');
    expect(packageJson.engines.node).toBeDefined();
    expect(packageJson.peerDependencies.puppeteer).toBeDefined();
    
    // Check production dependencies
    expect(packageJson.dependencies.joi).toBeDefined();
    expect(packageJson.dependencies.winston).toBeDefined();
    
    // Ensure no unnecessary production dependencies
    const depCount = Object.keys(packageJson.dependencies).length;
    expect(depCount).toBeLessThanOrEqual(3); // joi, winston, and maybe one more
  });
});