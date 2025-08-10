import puppeteer, { Browser, Page } from 'puppeteer';
import { protectPage } from '../dist/index';
import { ProtectionOptions } from '../dist/types';

describe('Fingerprint Detection Integration Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  describe('Canvas Fingerprinting Tests', () => {
    it('should produce consistent canvas fingerprints', async () => {
      const options: ProtectionOptions = {
        canvasRgba: [1, 1, 1, 1],
        features: { canvas: true }
      };

      await protectPage(page, options);

      const fingerprints = await page.evaluate(() => {
        const results = [];
        for (let i = 0; i < 5; i++) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(0, 0, 50, 50);
          ctx.fillStyle = '#000000';
          ctx.fillText('Test fingerprint', 2, 2);
          results.push(canvas.toDataURL());
        }
        return results;
      });

      // All fingerprints should be the same (consistent)
      const uniqueFingerprints = new Set(fingerprints);
      expect(uniqueFingerprints.size).toBe(1);
    });

    it('should produce different fingerprints with different noise', async () => {
      const page1 = await browser.newPage();
      const page2 = await browser.newPage();

      await protectPage(page1, { 
        canvasRgba: [1, 1, 1, 1],
        features: { canvas: true }
      });
      
      await protectPage(page2, { 
        canvasRgba: [2, 2, 2, 2],
        features: { canvas: true }
      });

      const getCanvasFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Test', 2, 2);
        return canvas.toDataURL();
      };

      const fp1 = await page1.evaluate(getCanvasFingerprint);
      const fp2 = await page2.evaluate(getCanvasFingerprint);

      expect(fp1).not.toBe(fp2);

      await page1.close();
      await page2.close();
    });
  });

  describe('WebGL Fingerprinting Tests', () => {
    it('should spoof WebGL parameters consistently', async () => {
      const options: ProtectionOptions = {
        webglData: {
          7936: 'Test Vendor',
          37445: 'Test Inc.',
          37446: 'Test GPU'
        },
        features: { webgl: true }
      };

      await protectPage(page, options);

      const webglInfo = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) return null;

        return {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          vendorUnmasked: gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_VENDOR_WEBGL || 37445),
          rendererUnmasked: gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL || 37446)
        };
      });

      if (webglInfo) {
        expect(webglInfo.vendor).toBe('Test Vendor');
        expect(webglInfo.vendorUnmasked).toBe('Test Inc.');
        expect(webglInfo.rendererUnmasked).toBe('Test GPU');
      }
    });
  });

  describe('Audio Fingerprinting Tests', () => {
    it('should add consistent noise to audio context', async () => {
      const options: ProtectionOptions = {
        audioFingerprint: {
          getChannelDataIndexRandom: 0.5,
          getChannelDataResultRandom: 0.5,
          createAnalyserIndexRandom: 0.5,
          createAnalyserResultRandom: 0.5
        },
        features: { audio: true }
      };

      await protectPage(page, options);

      const audioFingerprints = await page.evaluate(async () => {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const analyser = context.createAnalyser();
        const gainNode = context.createGain();
        const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

        gainNode.gain.value = 0;
        oscillator.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(context.destination);
        oscillator.start();

        return new Promise<string>((resolve) => {
          scriptProcessor.onaudioprocess = (event) => {
            const samples = event.outputBuffer.getChannelData(0);
            const fingerprint = Array.from(samples.slice(0, 100)).join(',');
            oscillator.stop();
            context.close();
            resolve(fingerprint);
          };
        });
      });

      expect(typeof audioFingerprints).toBe('string');
      expect(audioFingerprints.length).toBeGreaterThan(0);
    });
  });

  describe('Hardware Fingerprinting Tests', () => {
    it('should spoof hardware concurrency', async () => {
      const options: ProtectionOptions = {
        hardwareConfig: {
          hardwareConcurrency: 16,
          deviceMemory: 32
        },
        features: { hardware: true }
      };

      await protectPage(page, options);

      const hardwareInfo = await page.evaluate(() => ({
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory
      }));

      expect(hardwareInfo.hardwareConcurrency).toBe(16);
      expect(hardwareInfo.deviceMemory).toBe(32);
    });
  });

  describe('Screen Fingerprinting Tests', () => {
    it('should spoof screen dimensions', async () => {
      const options: ProtectionOptions = {
        screenConfig: {
          width: 3840,
          height: 2160,
          availWidth: 3840,
          availHeight: 2100,
          colorDepth: 30,
          pixelDepth: 30
        },
        features: { screen: true }
      };

      await protectPage(page, options);

      const screenInfo = await page.evaluate(() => ({
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }));

      expect(screenInfo.width).toBe(3840);
      expect(screenInfo.height).toBe(2160);
      expect(screenInfo.colorDepth).toBe(30);
      expect(screenInfo.pixelDepth).toBe(30);
    });
  });

  describe('Language Fingerprinting Tests', () => {
    it('should spoof language settings', async () => {
      const options: ProtectionOptions = {
        languageConfig: {
          languages: ['fr-FR', 'fr', 'en-US', 'en'],
          language: 'fr-FR',
          platform: 'MacIntel'
        },
        features: { language: true }
      };

      await protectPage(page, options);

      const languageInfo = await page.evaluate(() => ({
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform
      }));

      expect(languageInfo.language).toBe('fr-FR');
      expect(languageInfo.languages).toEqual(['fr-FR', 'fr', 'en-US', 'en']);
      expect(languageInfo.platform).toBe('MacIntel');
    });
  });

  describe('WebRTC Fingerprinting Tests', () => {
    it('should block WebRTC when enabled', async () => {
      const options: ProtectionOptions = {
        webRTCProtect: true,
        features: { webrtc: true }
      };

      await protectPage(page, options);

      const webrtcBlocked = await page.evaluate(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          return false; // Should not reach here
        } catch (error) {
          return true; // Expected to be blocked
        }
      });

      expect(webrtcBlocked).toBe(true);
    });
  });

  describe('Font Fingerprinting Tests', () => {
    it('should add noise to font measurements', async () => {
      const options: ProtectionOptions = {
        fontFingerprint: {
          noise: 2,
          sign: 1
        },
        features: { font: true }
      };

      await protectPage(page, options);

      const fontMeasurements = await page.evaluate(() => {
        const div = document.createElement('div');
        div.style.fontSize = '20px';
        div.style.fontFamily = 'Arial';
        div.textContent = 'Test text for font fingerprinting';
        document.body.appendChild(div);
        
        const measurements = {
          offsetWidth: div.offsetWidth,
          offsetHeight: div.offsetHeight
        };
        
        document.body.removeChild(div);
        return measurements;
      });

      expect(typeof fontMeasurements.offsetWidth).toBe('number');
      expect(typeof fontMeasurements.offsetHeight).toBe('number');
      expect(fontMeasurements.offsetWidth).toBeGreaterThan(0);
      expect(fontMeasurements.offsetHeight).toBeGreaterThan(0);
    });
  });

  describe('Webdriver Detection Tests', () => {
    it('should remove webdriver property', async () => {
      await protectPage(page);

      const webdriverTests = await page.evaluate(() => ({
        hasWebdriverProperty: 'webdriver' in navigator,
        webdriverValue: (navigator as any).webdriver,
        hasChromeProperty: 'chrome' in window,
        chromeRuntime: !!(window as any).chrome?.runtime
      }));

      expect(webdriverTests.hasWebdriverProperty).toBe(false);
      expect(webdriverTests.webdriverValue).toBeUndefined();
      expect(webdriverTests.hasChromeProperty).toBe(true);
      expect(webdriverTests.chromeRuntime).toBe(true);
    });
  });

  describe('Consistency Tests', () => {
    it('should maintain fingerprint consistency across page reloads', async () => {
      const options: ProtectionOptions = {
        canvasRgba: [2, 2, 2, 2],
        hardwareConfig: {
          hardwareConcurrency: 12,
          deviceMemory: 16
        },
        features: { canvas: true, hardware: true }
      };

      await protectPage(page, options);

      // Get fingerprint before reload
      const fp1 = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.fillText('Test', 2, 2);
        return {
          canvas: canvas.toDataURL(),
          hardware: navigator.hardwareConcurrency,
          memory: (navigator as any).deviceMemory
        };
      });

      // Reload and protect again
      await page.reload();
      await protectPage(page, options);

      // Get fingerprint after reload
      const fp2 = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.fillText('Test', 2, 2);
        return {
          canvas: canvas.toDataURL(),
          hardware: navigator.hardwareConcurrency,
          memory: (navigator as any).deviceMemory
        };
      });

      // Should be the same
      expect(fp1.canvas).toBe(fp2.canvas);
      expect(fp1.hardware).toBe(fp2.hardware);
      expect(fp1.memory).toBe(fp2.memory);
    });
  });
});