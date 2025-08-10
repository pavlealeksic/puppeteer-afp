import puppeteer, { Browser, Page } from 'puppeteer';
import { protectPage, getProfile } from '../dist/index';

describe('Basic Functionality', () => {
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

  it('should protect a page', async () => {
    const protectedPage = await protectPage(page);
    expect(protectedPage).toBeDefined();
    expect(typeof protectedPage.rotateFingerprint).toBe('function');
    expect(typeof protectedPage.getCurrentFingerprint).toBe('function');
  });

  it('should get profile', () => {
    const profile = getProfile('chrome');
    expect(profile.name).toBe('Chrome');
    expect(profile.options).toBeDefined();
  });

  it('should inject basic protection', async () => {
    await protectPage(page);
    
    // Navigate to a basic page to test injection
    await page.setContent('<html><body><h1>Test</h1></body></html>');
    
    const hasChrome = await page.evaluate(() => {
      return !!(window as any).chrome;
    });
    
    expect(hasChrome).toBe(true);
  });
});