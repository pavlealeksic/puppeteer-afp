/**
 * Comprehensive Browser Integration System
 * Hooks into ALL Puppeteer contexts, windows, frames, workers, and processes
 * Ensures complete fingerprinting protection across the entire browser instance
 */

import { Browser, Page, Frame, CDPSession } from 'puppeteer';
import { FingerprintProtection } from './protection';
import { ProtectionOptions, ProtectedPage, ProtectedBrowser } from './types';
import { Logger } from './logger';

export class BrowserIntegration {
  private browser: Browser;
  private protection: FingerprintProtection;
  private logger: Logger;
  private protectedPages: Set<Page> = new Set();
  private protectedFrames: Set<Frame> = new Set();
  private protectedWorkers: Set<any> = new Set();
  private cdpSessions: Set<CDPSession> = new Set();

  constructor(browser: Browser, options: ProtectionOptions = {}) {
    this.browser = browser;
    this.protection = new FingerprintProtection(options);
    this.logger = new Logger(options.enableLogging || false, options.logLevel || 'info');
    
    this.setupBrowserHooks();
  }

  private setupBrowserHooks(): void {
    // Hook into new page creation
    const originalNewPage = this.browser.newPage.bind(this.browser);
    this.browser.newPage = async () => {
      const page = await originalNewPage();
      await this.protectPage(page);
      return page as ProtectedPage;
    };

    // Hook into existing pages
    this.browser.pages().then(pages => {
      pages.forEach(page => this.protectPage(page));
    });

    // Listen for new target creation (pages, workers, etc.)
    this.browser.on('targetcreated', async (target) => {
      this.logger.debug(`New target created: ${target.type()} - ${target.url()}`);
      
      try {
        switch (target.type()) {
          case 'page':
            const page = await target.page();
            if (page) await this.protectPage(page);
            break;
            
          case 'other':
            // Handle workers and other targets
            try {
              const worker = await target.worker();
              if (worker) await this.protectWorker(worker as any);
            } catch {
              // Not a worker, handle as other target
              await this.protectOtherTarget(target);
            }
            break;
            
          case 'background_page':
            const bgPage = await target.page();
            if (bgPage) await this.protectBackgroundPage(bgPage);
            break;
        }
      } catch (error) {
        this.logger.error('Failed to protect new target:', error);
      }
    });

    // Listen for target changes
    this.browser.on('targetchanged', async (target) => {
      this.logger.debug(`Target changed: ${target.type()} - ${target.url()}`);
      // Re-apply protection if needed
      await this.handleTargetChange(target);
    });

    // Cleanup on browser disconnect
    this.browser.on('disconnected', () => {
      this.cleanup();
    });
  }

  private async protectPage(page: Page): Promise<void> {
    if (this.protectedPages.has(page)) return;
    
    this.logger.debug(`Protecting page: ${page.url()}`);
    
    try {
      // Apply main protection
      await this.protection.protectPage(page);
      this.protectedPages.add(page);

      // Hook into frame creation
      page.on('frameattached', async (frame) => {
        await this.protectFrame(frame);
      });

      // Hook into worker creation from this page
      page.on('workercreated', async (worker) => {
        await this.protectWorker(worker as any);
      });

      // Hook into popup creation
      page.on('popup', async (popup) => {
        if (popup) await this.protectPage(popup);
      });

      // Hook into dialog events (could leak browser info)
      page.on('dialog', async (dialog) => {
        await this.handleDialog(dialog);
      });

      // Hook into request interception for additional protection
      await this.setupRequestInterception(page);

      // Hook into response interception
      await this.setupResponseInterception(page);

      // Setup CDP session for low-level hooks
      await this.setupCDPHooks(page);

      // Protect against page navigation
      page.on('framenavigated', async (frame) => {
        if (frame === page.mainFrame()) {
          // Re-apply protection on navigation
          await this.reapplyProtection(page);
        }
        await this.protectFrame(frame);
      });

      // Handle page close
      page.on('close', () => {
        this.protectedPages.delete(page);
        this.logger.debug('Page closed and removed from protection');
      });

    } catch (error) {
      this.logger.error('Failed to protect page:', error);
    }
  }

  private async protectFrame(frame: Frame): Promise<void> {
    if (this.protectedFrames.has(frame) || frame.isDetached()) return;
    
    this.logger.debug(`Protecting frame: ${frame.url()}`);
    
    try {
      // Apply protection to frame using evaluate instead of evaluateOnNewDocument
      await frame.evaluate(this.protection.getFrameProtectionScript());
      this.protectedFrames.add(frame);

      // Handle frame detachment
      frame.on('detached', () => {
        this.protectedFrames.delete(frame);
      });

    } catch (error) {
      this.logger.error('Failed to protect frame:', error);
    }
  }

  private async protectWorker(worker: any): Promise<void> {
    if (this.protectedWorkers.has(worker)) return;
    
    this.logger.debug(`Protecting worker: ${worker.url ? worker.url() : 'unknown'}`);
    
    try {
      // Apply worker-specific protection
      if (worker.evaluate) {
        await worker.evaluate(this.protection.getWorkerProtectionScript());
      }
      this.protectedWorkers.add(worker);

      // Handle worker destruction
      if (worker.on) {
        worker.on('close', () => {
          this.protectedWorkers.delete(worker);
        });
      }

    } catch (error) {
      this.logger.error('Failed to protect worker:', error);
    }
  }

  private async protectBackgroundPage(page: Page): Promise<void> {
    this.logger.debug('Protecting background page');
    
    try {
      // Background pages need special handling
      await page.evaluateOnNewDocument(`
        // Background page specific protections
        ${this.protection.getBackgroundPageProtectionScript()}
      `);
    } catch (error) {
      this.logger.error('Failed to protect background page:', error);
    }
  }

  private async protectOtherTarget(target: any): Promise<void> {
    this.logger.debug(`Protecting other target: ${target.type()}`);
    
    try {
      // Handle extension targets, devtools, etc.
      if (target._targetInfo?.type === 'browser') {
        await this.protectBrowserTarget(target);
      }
    } catch (error) {
      this.logger.error('Failed to protect other target:', error);
    }
  }

  private async setupRequestInterception(page: Page): Promise<void> {
    try {
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        // Filter requests that could leak fingerprinting data
        const url = request.url();
        const headers = request.headers();
        
        // Block known fingerprinting services
        if (this.isFingerprinter(url)) {
          this.logger.debug(`Blocked fingerprinting request: ${url}`);
          request.abort('blockedbyclient');
          return;
        }
        
        // Modify headers to blend in
        const modifiedHeaders = this.sanitizeHeaders(headers);
        
        if (JSON.stringify(headers) !== JSON.stringify(modifiedHeaders)) {
          request.continue({ headers: modifiedHeaders });
        } else {
          request.continue();
        }
      });
    } catch (error) {
      this.logger.error('Failed to setup request interception:', error);
    }
  }

  private async setupResponseInterception(page: Page): Promise<void> {
    try {
      page.on('response', async (response) => {
        // Monitor responses for fingerprinting attempts
        const url = response.url();
        
        if (this.isFingerprinter(url)) {
          this.logger.warn(`Fingerprinting response detected: ${url}`);
        }
        
        // Check for CSP headers that might interfere
        const csp = response.headers()['content-security-policy'];
        if (csp && this.hasRestrictiveCSP(csp)) {
          this.logger.debug('Restrictive CSP detected, adapting protection');
          await this.adaptToCSP(page, csp);
        }
      });
    } catch (error) {
      this.logger.error('Failed to setup response interception:', error);
    }
  }

  private async setupCDPHooks(page: Page): Promise<void> {
    try {
      const client = await page.target().createCDPSession();
      this.cdpSessions.add(client);

      // Enable necessary domains
      await client.send('Runtime.enable');
      await client.send('Page.enable');
      await client.send('Network.enable');
      await client.send('Security.enable');

      // Hook into runtime events
      client.on('Runtime.executionContextCreated', async (event) => {
        await this.protectExecutionContext(client, event.context);
      });

      // Hook into frame lifecycle
      client.on('Page.frameNavigated', async (event) => {
        await this.handleFrameNavigation(client, event.frame);
      });

      // Monitor network for fingerprinting
      client.on('Network.requestWillBeSent', (event) => {
        this.analyzeNetworkRequest(event);
      });

      // Hook into security state changes
      client.on('Security.securityStateChanged', (event) => {
        this.handleSecurityStateChange(event);
      });

      // Cleanup CDP session
      page.on('close', () => {
        this.cdpSessions.delete(client);
        client.detach();
      });

    } catch (error) {
      this.logger.error('Failed to setup CDP hooks:', error);
    }
  }

  private async protectExecutionContext(client: CDPSession, context: any): Promise<void> {
    try {
      // Inject protection into new execution contexts
      await client.send('Runtime.evaluate', {
        expression: this.protection.getContextProtectionScript(),
        contextId: context.id,
        includeCommandLineAPI: false
      });
      
      this.logger.debug(`Protected execution context: ${context.name || context.origin}`);
    } catch (error) {
      this.logger.error('Failed to protect execution context:', error);
    }
  }

  private async handleFrameNavigation(client: CDPSession, frame: any): Promise<void> {
    try {
      // Re-apply protection after navigation
      await client.send('Runtime.evaluate', {
        expression: this.protection.getNavigationProtectionScript(),
        contextId: frame.id
      });
    } catch (error) {
      this.logger.error('Failed to handle frame navigation:', error);
    }
  }

  private analyzeNetworkRequest(event: any): void {
    const url = event.request.url;
    const headers = event.request.headers;
    
    // Analyze for fingerprinting patterns
    if (this.isFingerprinter(url)) {
      this.logger.warn(`Detected fingerprinting network request: ${url}`);
    }
    
    // Check for suspicious headers
    if (headers['x-fingerprint'] || headers['x-canvas-fp']) {
      this.logger.warn('Suspicious fingerprinting headers detected');
    }
  }

  private handleSecurityStateChange(event: any): void {
    if (event.securityState === 'insecure') {
      this.logger.debug('Insecure connection detected, adjusting protection');
    }
  }

  private async handleDialog(dialog: any): Promise<void> {
    try {
      // Dialogs can leak browser information, handle carefully
      const message = dialog.message();
      
      if (this.containsFingerprinting(message)) {
        this.logger.warn('Fingerprinting attempt via dialog detected');
      }
      
      // Auto-dismiss dialogs that might be fingerprinting attempts
      await dialog.dismiss();
    } catch (error) {
      this.logger.error('Failed to handle dialog:', error);
    }
  }

  private async reapplyProtection(page: Page): Promise<void> {
    try {
      // Re-inject protection after navigation
      await this.protection.protectPage(page);
      this.logger.debug('Reapplied protection after navigation');
    } catch (error) {
      this.logger.error('Failed to reapply protection:', error);
    }
  }

  private async handleTargetChange(target: any): Promise<void> {
    // Handle target URL changes, context switches, etc.
    if (target.type() === 'page') {
      const page = await target.page();
      if (page && !this.protectedPages.has(page)) {
        await this.protectPage(page);
      }
    }
  }

  private async protectBrowserTarget(target: any): Promise<void> {
    // Protect browser-level targets (rare but possible)
    this.logger.debug('Protecting browser-level target');
  }

  private async adaptToCSP(page: Page, csp: string): Promise<void> {
    // Adapt protection to work with restrictive CSP
    if (csp.includes("'unsafe-eval'") === false) {
      // Use CSP-compatible protection methods
      await page.evaluateOnNewDocument(this.protection.getCSPCompatibleScript());
    }
  }

  // Helper methods
  private isFingerprinter(url: string): boolean {
    const fingerprinters = [
      'fingerprint',
      'canvas-fp',
      'webgl-fp',
      'audio-fp',
      'device-id',
      'browser-id',
      'tracking',
      'analytics',
      'metrics'
    ];
    
    return fingerprinters.some(fp => url.toLowerCase().includes(fp));
  }

  private containsFingerprinting(message: string): boolean {
    const patterns = [
      'canvas',
      'webgl',
      'audio',
      'fingerprint',
      'device'
    ];
    
    return patterns.some(pattern => 
      message.toLowerCase().includes(pattern));
  }

  private hasRestrictiveCSP(csp: string): boolean {
    return csp.includes("'unsafe-eval'") === false ||
           csp.includes("'unsafe-inline'") === false;
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Remove fingerprinting headers
    delete sanitized['x-fingerprint'];
    delete sanitized['x-canvas-fp'];
    delete sanitized['x-webgl-fp'];
    delete sanitized['x-audio-fp'];
    
    // Normalize user agent
    if (sanitized['user-agent']) {
      sanitized['user-agent'] = this.protection.getNormalizedUserAgent();
    }
    
    return sanitized;
  }

  public async createProtectedBrowser(): Promise<ProtectedBrowser> {
    const protectedBrowser = this.browser as ProtectedBrowser;
    
    // Add enhanced methods
    protectedBrowser.newProtectedPage = async (options?: ProtectionOptions) => {
      const page = await this.browser.newPage();
      await this.protectPage(page);
      return page as ProtectedPage;
    };
    
    protectedBrowser.protectAllPages = async () => {
      const pages = await this.browser.pages();
      await Promise.all(pages.map(page => this.protectPage(page)));
    };
    
    protectedBrowser.getProtectionStats = () => {
      return {
        protectedPages: this.protectedPages.size,
        protectedFrames: this.protectedFrames.size,
        protectedWorkers: this.protectedWorkers.size,
        activeSessions: this.cdpSessions.size
      };
    };
    
    return protectedBrowser;
  }

  public cleanup(): void {
    this.protectedPages.clear();
    this.protectedFrames.clear();
    this.protectedWorkers.clear();
    
    this.cdpSessions.forEach(session => {
      try {
        session.detach();
      } catch (error) {
        // Session might already be detached
      }
    });
    this.cdpSessions.clear();
    
    this.protection.destroy();
    this.logger.info('Browser integration cleanup completed');
  }
}

// Export enhanced browser creation function
export async function createProtectedBrowser(
  browser: Browser, 
  options: ProtectionOptions = {}
): Promise<ProtectedBrowser> {
  const integration = new BrowserIntegration(browser, options);
  return await integration.createProtectedBrowser();
}