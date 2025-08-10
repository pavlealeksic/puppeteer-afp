import puppeteer, { Browser, Page } from 'puppeteer';
import { protectPage, protectedBrowser, generateRandomOptions, getProfile } from '../dist/index';
import { ProtectionOptions } from '../dist/types';

describe('Puppeteer AFP Protection', () => {
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

  describe('protectPage', () => {
    it('should protect a page with default options', async () => {
      const protectedPage = await protectPage(page);
      expect(protectedPage).toBeDefined();
      expect(typeof protectedPage.rotateFingerprint).toBe('function');
      expect(typeof protectedPage.getCurrentFingerprint).toBe('function');
    });

    it('should protect a page with custom options', async () => {
      const options: ProtectionOptions = {
        canvasRgba: [1, 2, 3, 4],
        webRTCProtect: true,
        enableLogging: true,
        logLevel: 'debug'
      };

      const protectedPage = await protectPage(page, options);
      expect(protectedPage).toBeDefined();
      
      const currentFingerprint = protectedPage.getCurrentFingerprint!();
      expect(currentFingerprint.canvasRgba).toEqual([1, 2, 3, 4]);
      expect(currentFingerprint.webRTCProtect).toBe(true);
    });

    it('should inject canvas protection', async () => {
      await protectPage(page, { features: { canvas: true } });
      
      const canvasFingerprint = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Test fingerprint', 2, 2);
        return canvas.toDataURL();
      });

      expect(canvasFingerprint).toMatch(/^data:image\/png;base64,/);
    });

    it('should inject WebGL protection', async () => {
      await protectPage(page, { features: { webgl: true } });
      
      const webglInfo = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl')!;
        if (!gl) return null;
        
        return {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION)
        };
      });

      expect(webglInfo).toBeDefined();
      if (webglInfo) {
        expect(typeof webglInfo.vendor).toBe('string');
        expect(typeof webglInfo.renderer).toBe('string');
        expect(typeof webglInfo.version).toBe('string');
      }
    });

    it('should inject hardware spoofing', async () => {
      const options: ProtectionOptions = {
        hardwareConfig: {
          hardwareConcurrency: 12,
          deviceMemory: 16
        },
        features: { hardware: true }
      };

      await protectPage(page, options);
      
      const hardwareInfo = await page.evaluate(() => ({
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory
      }));

      expect(hardwareInfo.hardwareConcurrency).toBe(12);
      expect(hardwareInfo.deviceMemory).toBe(16);
    });

    it('should inject screen spoofing', async () => {
      const options: ProtectionOptions = {
        screenConfig: {
          width: 2560,
          height: 1440,
          availWidth: 2560,
          availHeight: 1415,
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
        pixelDepth: screen.pixelDepth
      }));

      expect(screenInfo.width).toBe(2560);
      expect(screenInfo.height).toBe(1440);
      expect(screenInfo.colorDepth).toBe(30);
      expect(screenInfo.pixelDepth).toBe(30);
    });

    it('should remove webdriver property', async () => {
      await protectPage(page);
      
      const hasWebdriver = await page.evaluate(() => {
        return 'webdriver' in navigator;
      });

      expect(hasWebdriver).toBe(false);
    });

    it('should handle rotation', async () => {
      const protectedPage = await protectPage(page);
      
      // Test rotation function exists and can be called
      expect(typeof protectedPage.rotateFingerprint).toBe('function');
      await protectedPage.rotateFingerprint!();
      
      // Should not throw error
    });
  });

  describe('protectedBrowser', () => {
    it('should create a protected browser', async () => {
      const pBrowser = await protectedBrowser(browser);
      expect(typeof pBrowser.newProtectedPage).toBe('function');
      
      const pPage = await pBrowser.newProtectedPage();
      expect(pPage).toBeDefined();
      expect(typeof pPage.rotateFingerprint).toBe('function');
      
      await pPage.close();
    });

    it('should merge options correctly', async () => {
      const browserOptions: ProtectionOptions = {
        webRTCProtect: true,
        enableLogging: false
      };
      
      const pageOptions: ProtectionOptions = {
        enableLogging: true,
        canvasRgba: [1, 1, 1, 1]
      };

      const pBrowser = await protectedBrowser(browser, browserOptions);
      const pPage = await pBrowser.newProtectedPage(pageOptions);
      
      const fingerprint = pPage.getCurrentFingerprint!();
      expect(fingerprint.webRTCProtect).toBe(true);
      expect(fingerprint.enableLogging).toBe(true);
      expect(fingerprint.canvasRgba).toEqual([1, 1, 1, 1]);
      
      await pPage.close();
    });
  });

  describe('profiles', () => {
    it('should get Chrome profile', () => {
      const profile = getProfile('chrome');
      expect(profile.name).toBe('Chrome');
      expect(profile.options).toBeDefined();
      expect(profile.options.userAgentConfig).toBeDefined();
    });

    it('should get Firefox profile', () => {
      const profile = getProfile('firefox');
      expect(profile.name).toBe('Firefox');
      expect(profile.options).toBeDefined();
    });

    it('should get Safari profile', () => {
      const profile = getProfile('safari');
      expect(profile.name).toBe('Safari');
      expect(profile.options).toBeDefined();
    });

    it('should get Edge profile', () => {
      const profile = getProfile('edge');
      expect(profile.name).toBe('Edge');
      expect(profile.options).toBeDefined();
    });

    it('should throw error for invalid profile', () => {
      expect(() => {
        getProfile('invalid' as any);
      }).toThrow('Profile "invalid" not found');
    });
  });

  describe('generateRandomOptions', () => {
    it('should generate random options', () => {
      const options = generateRandomOptions();
      
      expect(options.canvasRgba).toHaveLength(4);
      expect(options.fontFingerprint).toBeDefined();
      expect(options.audioFingerprint).toBeDefined();
      expect(options.hardwareConfig).toBeDefined();
      expect(options.screenConfig).toBeDefined();
      expect(options.timezoneConfig).toBeDefined();
      expect(options.batteryConfig).toBeDefined();
      expect(options.languageConfig).toBeDefined();
    });

    it('should generate different random options on each call', () => {
      const options1 = generateRandomOptions();
      const options2 = generateRandomOptions();
      
      // At least one field should be different
      const isDifferent = JSON.stringify(options1) !== JSON.stringify(options2);
      expect(isDifferent).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should pass common fingerprinting detection tests', async () => {
      const options: ProtectionOptions = {
        enableLogging: false,
        features: {
          canvas: true,
          webgl: true,
          audio: true,
          font: true,
          webrtc: true,
          hardware: true,
          screen: true
        }
      };

      const protectedPage = await protectPage(page, options);
      
      // Test canvas fingerprint consistency
      const canvasTest = await protectedPage.evaluate(() => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const ctx1 = canvas1.getContext('2d')!;
        const ctx2 = canvas2.getContext('2d')!;
        
        const text = 'Fingerprint test 123';
        ctx1.textBaseline = 'top';
        ctx1.font = '14px Arial';
        ctx1.fillText(text, 2, 2);
        
        ctx2.textBaseline = 'top';
        ctx2.font = '14px Arial';
        ctx2.fillText(text, 2, 2);
        
        return {
          same: canvas1.toDataURL() === canvas2.toDataURL(),
          dataUrl: canvas1.toDataURL()
        };
      });
      
      expect(canvasTest.same).toBe(true);
      expect(canvasTest.dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle concurrent page protection', async () => {
      const pages = await Promise.all([
        browser.newPage(),
        browser.newPage(),
        browser.newPage()
      ]);

      const protectedPages = await Promise.all(
        pages.map(p => protectPage(p, { enableLogging: false }))
      );

      // All pages should be protected
      expect(protectedPages).toHaveLength(3);
      protectedPages.forEach(p => {
        expect(typeof p.rotateFingerprint).toBe('function');
        expect(typeof p.getCurrentFingerprint).toBe('function');
      });

      // Cleanup
      await Promise.all(protectedPages.map(p => p.close()));
    });
  });
});