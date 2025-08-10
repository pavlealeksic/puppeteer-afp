import { protectPage, getProfile, generateRandomOptions } from '../dist';
import puppeteer, { Browser, Page } from 'puppeteer';

describe('Simple Functionality Tests', () => {
  describe('Utility Functions', () => {
    it('should get Chrome profile', () => {
      const profile = getProfile('chrome');
      expect(profile.name).toBe('Chrome');
      expect(profile.options).toBeDefined();
      expect(profile.options.userAgentConfig).toBeDefined();
    });

    it('should generate random options', () => {
      const options = generateRandomOptions();
      expect(options).toBeDefined();
      expect(options.canvasRgba).toHaveLength(4);
      expect(options.hardwareConfig).toBeDefined();
      expect(options.screenConfig).toBeDefined();
    });
  });

  describe('Page Protection', () => {
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
      if (page && !page.isClosed()) {
        await page.close();
      }
    });

    afterAll(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('should create protected page with methods', async () => {
      const protectedPage = await protectPage(page);
      
      expect(protectedPage).toBeDefined();
      expect(typeof protectedPage.rotateFingerprint).toBe('function');
      expect(typeof protectedPage.getCurrentFingerprint).toBe('function');
    });

    it('should return current fingerprint options', async () => {
      const options = {
        canvasRgba: [1, 2, 3, 4],
        webRTCProtect: true,
        enableLogging: false
      };

      const protectedPage = await protectPage(page, options);
      const currentFingerprint = protectedPage.getCurrentFingerprint!();
      
      expect(currentFingerprint.canvasRgba).toEqual([1, 2, 3, 4]);
      expect(currentFingerprint.webRTCProtect).toBe(true);
      expect(currentFingerprint.enableLogging).toBe(false);
    });

    it('should inject protection script successfully', async () => {
      await protectPage(page, { enableLogging: false });
      
      await page.setContent('<html><body><h1>Test Page</h1></body></html>');
      
      // Check if Chrome object was injected
      const hasChromeObject = await page.evaluate(() => {
        return !!(window as any).chrome && !!(window as any).chrome.runtime;
      });
      
      expect(hasChromeObject).toBe(true);
    });

    it('should handle page navigation after protection', async () => {
      const protectedPage = await protectPage(page);
      
      await protectedPage.goto('data:text/html,<html><body>Test</body></html>');
      
      const title = await protectedPage.evaluate(() => document.body.textContent);
      expect(title).toBe('Test');
    });

    it('should allow manual fingerprint rotation', async () => {
      const protectedPage = await protectPage(page);
      
      // Should not throw error
      await protectedPage.rotateFingerprint!();
      
      // Page should still be functional
      await protectedPage.setContent('<html><body>Rotated</body></html>');
      const content = await protectedPage.evaluate(() => document.body.textContent);
      expect(content).toBe('Rotated');
    });
  });
});