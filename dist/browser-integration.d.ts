/**
 * Comprehensive Browser Integration System
 * Hooks into ALL Puppeteer contexts, windows, frames, workers, and processes
 * Ensures complete fingerprinting protection across the entire browser instance
 */
import { Browser } from 'puppeteer';
import { ProtectionOptions, ProtectedBrowser } from './types';
export declare class BrowserIntegration {
    private browser;
    private protection;
    private logger;
    private protectedPages;
    private protectedFrames;
    private protectedWorkers;
    private cdpSessions;
    constructor(browser: Browser, options?: ProtectionOptions);
    private setupBrowserHooks;
    private protectPage;
    private protectFrame;
    private protectWorker;
    private protectBackgroundPage;
    private protectOtherTarget;
    private setupRequestInterception;
    private setupResponseInterception;
    private setupCDPHooks;
    private protectExecutionContext;
    private handleFrameNavigation;
    private analyzeNetworkRequest;
    private handleSecurityStateChange;
    private handleDialog;
    private reapplyProtection;
    private handleTargetChange;
    private protectBrowserTarget;
    private adaptToCSP;
    private isFingerprinter;
    private containsFingerprinting;
    private hasRestrictiveCSP;
    private sanitizeHeaders;
    createProtectedBrowser(): Promise<ProtectedBrowser>;
    cleanup(): void;
}
export declare function createProtectedBrowser(browser: Browser, options?: ProtectionOptions): Promise<ProtectedBrowser>;
//# sourceMappingURL=browser-integration.d.ts.map