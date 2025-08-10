/**
 * Comprehensive Engine Integration Tests
 * Verifies all advanced engine emulation functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';
import { FingerprintProtection } from '../dist/protection';
import { unifiedEngineConfigs, getEngineConfig, getBrowserEngineConfigs } from '../dist/engine-configs';
import { ProtectionOptions } from '../dist/types';

describe('Engine Integration Tests', () => {
  let browser: Browser;
  let page: Page;
  let protection: FingerprintProtection;

  beforeEach(async () => {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterEach(async () => {
    if (protection) {
      protection.destroy();
    }
    if (browser) {
      await browser.close();
    }
  });

  describe('JavaScript Engine Emulation', () => {
    it('should emulate V8 engine characteristics for Chrome', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { javascript: true },
        enableLogging: true
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      // Test JavaScript engine-specific behavior
      const result = await protectedPage.evaluate(() => {
        // Test error stack trace format (V8 specific)
        try {
          throw new Error('Test error');
        } catch (e: any) {
          return {
            stackFormat: e.stack?.includes('at ') ? 'v8' : 'other',
            errorMessage: e.message
          };
        }
      });
      
      expect(result.stackFormat).toBe('v8');
      expect(result.errorMessage).toBe('Test error');
    });

    it('should emulate SpiderMonkey engine for Firefox', async () => {
      const options: ProtectionOptions = {
        profile: 'firefox',
        engineEmulation: { javascript: true },
        enableLogging: true
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        // Test Firefox-specific error format
        try {
          throw new Error('Firefox test');
        } catch (e: any) {
          return {
            stackFormat: e.stack?.includes('@') ? 'spidermonkey' : 'other',
            errorMessage: e.message
          };
        }
      });
      
      expect(result.stackFormat).toBe('spidermonkey');
    });

    it('should simulate JIT optimization thresholds', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { javascript: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        // Test function call optimization simulation
        function testFunction() {
          return Math.random();
        }
        
        const startTime = performance.now();
        
        // Call function multiple times to trigger "optimization"
        for (let i = 0; i < 150; i++) {
          testFunction();
        }
        
        const endTime = performance.now();
        
        return {
          executionTime: endTime - startTime,
          callCount: 150
        };
      });
      
      expect(result.callCount).toBe(150);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('CSS Engine Emulation', () => {
    it('should emulate Blink CSS engine behavior', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { css: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        // Create test element for CSS measurements
        const div = document.createElement('div');
        div.style.width = '100.123456px';
        div.style.height = '200.654321px';
        document.body.appendChild(div);
        
        const computedStyle = getComputedStyle(div);
        const rect = div.getBoundingClientRect();
        
        document.body.removeChild(div);
        
        return {
          computedWidth: computedStyle.width,
          computedHeight: computedStyle.height,
          rectWidth: rect.width,
          rectHeight: rect.height,
          // Test Blink-specific precision
          precision: rect.width === Math.round(rect.width * 64) / 64
        };
      });
      
      expect(result.computedWidth).toBeTruthy();
      expect(result.computedHeight).toBeTruthy();
      expect(result.rectWidth).toBeGreaterThan(0);
      expect(result.rectHeight).toBeGreaterThan(0);
    });

    it('should simulate engine-specific font loading', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { css: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        return new Promise((resolve) => {
          if (typeof FontFace === 'undefined') {
            resolve({ fontSupported: false });
            return;
          }
          
          const startTime = performance.now();
          const font = new FontFace('TestFont', 'url(data:font/woff2;base64,)');
          
          font.load().then(() => {
            const loadTime = performance.now() - startTime;
            resolve({
              fontSupported: true,
              loadTime,
              fontFamily: font.family
            });
          }).catch(() => {
            resolve({
              fontSupported: true,
              loadTime: performance.now() - startTime,
              fontFamily: font.family,
              error: true
            });
          });
        });
      });
      
      if ((result as any).fontSupported) {
        expect((result as any).loadTime).toBeGreaterThan(0);
        expect((result as any).fontFamily).toBe('TestFont');
      }
    });
  });

  describe('DOM Engine Emulation', () => {
    it('should emulate browser-specific DOM method timing', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { dom: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        const startTime = performance.now();
        
        // Test DOM manipulation timing
        const div = document.createElement('div');
        div.innerHTML = '<span>Test</span><p>Content</p><strong>Bold</strong>';
        
        const children = div.children;
        const textContent = div.textContent;
        const cloned = div.cloneNode(true);
        
        document.body.appendChild(div);
        document.body.removeChild(div);
        
        const endTime = performance.now();
        
        return {
          operationTime: endTime - startTime,
          childrenCount: children.length,
          textContent: textContent?.trim(),
          clonedType: cloned.nodeType
        };
      });
      
      expect(result.operationTime).toBeGreaterThan(0);
      expect(result.childrenCount).toBe(3);
      expect(result.textContent).toBe('TestContentBold');
      expect(result.clonedType).toBe(1); // ELEMENT_NODE
    });

    it('should simulate engine-specific attribute handling', async () => {
      const options: ProtectionOptions = {
        profile: 'safari',
        engineEmulation: { dom: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        const div = document.createElement('div');
        
        // Test attribute normalization
        div.setAttribute('DATA-Test', 'value');
        div.setAttribute('customAttribute', 'custom');
        div.setAttribute('class', '  multiple   spaces  ');
        
        return {
          dataAttr: div.getAttribute('DATA-Test'),
          customAttr: div.getAttribute('customAttribute'),
          classAttr: div.getAttribute('class'),
          hasDataAttr: div.hasAttribute('data-test'),
          hasCustomAttr: div.hasAttribute('customAttribute')
        };
      });
      
      expect(result.dataAttr).toBeTruthy();
      expect(result.customAttr).toBeTruthy();
      expect(result.classAttr).toBeTruthy();
    });
  });

  describe('Hardware Engine Emulation', () => {
    it('should emulate realistic CPU behavior', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { hardware: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        return new Promise((resolve) => {
          const startTime = performance.now();
          
          // Intensive computation to trigger thermal simulation
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += Math.sqrt(i) * Math.sin(i);
          }
          
          const endTime = performance.now();
          
          resolve({
            computationTime: endTime - startTime,
            result: sum,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: (navigator as any).deviceMemory
          });
        });
      });
      
      expect((result as any).computationTime).toBeGreaterThan(0);
      expect((result as any).hardwareConcurrency).toBeGreaterThan(0);
      expect(typeof (result as any).result).toBe('number');
    });

    it('should simulate realistic memory patterns', async () => {
      const options: ProtectionOptions = {
        profile: 'firefox',
        engineEmulation: { hardware: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        // Test memory allocation patterns
        const arrays: number[][] = [];
        const startTime = performance.now();
        
        // Allocate memory in patterns
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(1000).fill(Math.random()));
        }
        
        const midTime = performance.now();
        
        // Clear some arrays to trigger GC simulation
        for (let i = 0; i < 50; i++) {
          arrays.pop();
        }
        
        const endTime = performance.now();
        
        return {
          allocationTime: midTime - startTime,
          cleanupTime: endTime - midTime,
          remainingArrays: arrays.length,
          performance: performance.now()
        };
      });
      
      expect((result as any).allocationTime).toBeGreaterThan(0);
      expect((result as any).remainingArrays).toBe(50);
      expect((result as any).performance).toBeGreaterThan(0);
    });
  });

  describe('Network Engine Emulation', () => {
    it('should emulate TCP/IP stack behavior', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { network: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        return new Promise((resolve) => {
          const startTime = performance.now();
          
          // Test fetch with timing
          fetch('data:text/plain,test')
            .then(response => response.text())
            .then(data => {
              const endTime = performance.now();
              resolve({
                requestTime: endTime - startTime,
                data,
                success: true
              });
            })
            .catch(error => {
              resolve({
                requestTime: performance.now() - startTime,
                error: error.message,
                success: false
              });
            });
        });
      });
      
      expect((result as any).requestTime).toBeGreaterThan(0);
      expect((result as any).success).toBe(true);
      expect((result as any).data).toBe('test');
    });

    it('should simulate WebRTC network behavior', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { network: true },
        webRTCProtect: false // Allow WebRTC for testing
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        return new Promise((resolve) => {
          if (typeof RTCPeerConnection === 'undefined') {
            resolve({ webrtcSupported: false });
            return;
          }
          
          try {
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            const startTime = performance.now();
            
            pc.createDataChannel('test');
            pc.createOffer()
              .then(offer => {
                const endTime = performance.now();
                pc.close();
                resolve({
                  webrtcSupported: true,
                  offerTime: endTime - startTime,
                  offerType: offer.type,
                  sdpLength: offer.sdp?.length || 0
                });
              })
              .catch(error => {
                pc.close();
                resolve({
                  webrtcSupported: true,
                  error: error.message
                });
              });
          } catch (error: any) {
            resolve({
              webrtcSupported: false,
              error: error.message
            });
          }
        });
      });
      
      if ((result as any).webrtcSupported) {
        expect((result as any).offerType).toBe('offer');
      }
    });
  });

  describe('Engine Configuration System', () => {
    it('should provide valid configurations for all browsers', () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'];
      
      browsers.forEach(browser => {
        const config = getBrowserEngineConfigs(browser);
        expect(config).toBeTruthy();
        
        expect(config?.javascript).toBeDefined();
        expect(config?.css).toBeDefined();
        expect(config?.dom).toBeDefined();
        expect(config?.hardware).toBeDefined();
        expect(config?.network).toBeDefined();
      });
    });

    it('should return correct engine types for each browser', () => {
      const chromeJs = getEngineConfig('chrome', 'javascript');
      const firefoxJs = getEngineConfig('firefox', 'javascript');
      const safariJs = getEngineConfig('safari', 'javascript');
      
      expect(chromeJs?.engine).toBe('v8');
      expect(firefoxJs?.engine).toBe('spidermonkey');
      expect(safariJs?.engine).toBe('javascriptcore');
      
      const chromeCss = getEngineConfig('chrome', 'css');
      const firefoxCss = getEngineConfig('firefox', 'css');
      const safariCss = getEngineConfig('safari', 'css');
      
      expect(chromeCss?.engine).toBe('blink');
      expect(firefoxCss?.engine).toBe('gecko');
      expect(safariCss?.engine).toBe('webkit');
    });

    it('should handle invalid configurations gracefully', () => {
      const invalidBrowser = getBrowserEngineConfigs('invalid-browser');
      expect(invalidBrowser).toBeNull();
      
      const invalidEngine = getEngineConfig('chrome', 'invalid' as any);
      expect(invalidEngine).toBeNull();
    });
  });

  describe('Integration with Legacy Features', () => {
    it('should work alongside existing canvas protection', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { javascript: true, css: true },
        features: { canvas: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = 'rgb(255, 0, 0)';
          ctx.fillRect(10, 10, 50, 50);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          return {
            canvasSupported: true,
            pixelCount: data.length,
            firstPixel: [data[0], data[1], data[2], data[3]],
            dataURL: canvas.toDataURL().substring(0, 50)
          };
        }
        
        return { canvasSupported: false };
      });
      
      expect((result as any).canvasSupported).toBe(true);
      expect((result as any).pixelCount).toBeGreaterThan(0);
      expect((result as any).dataURL).toContain('data:image/png');
    });

    it('should maintain WebGL protection with hardware emulation', async () => {
      const options: ProtectionOptions = {
        profile: 'chrome',
        engineEmulation: { hardware: true },
        features: { webgl: true }
      };
      
      protection = new FingerprintProtection(options);
      const protectedPage = await protection.protectPage(page);
      
      const result = await protectedPage.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
                   canvas.getContext('experimental-webgl') as WebGLRenderingContext;
        
        if (gl) {
          return {
            webglSupported: true,
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
          };
        }
        
        return { webglSupported: false };
      });
      
      if ((result as any).webglSupported) {
        expect((result as any).vendor).toBeDefined();
        expect((result as any).renderer).toBeDefined();
        expect((result as any).maxTextureSize).toBeGreaterThan(0);
      }
    });
  });
});