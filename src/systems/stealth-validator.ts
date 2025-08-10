/**
 * Stealth Validation System
 * Automated detection of when protection fails and self-healing mechanisms
 */

import { Page } from 'puppeteer';
import { Logger } from '../logger';
import { ProtectionOptions } from '../types';

export interface ValidationResult {
  category: string;
  test: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
  recommendation?: string;
}

export interface StealthReport {
  overallScore: number;
  totalTests: number;
  passedTests: number;
  criticalFailures: number;
  results: ValidationResult[];
  recommendations: string[];
}

export class StealthValidator {
  private logger: Logger;
  
  constructor(enableLogging: boolean = false) {
    this.logger = new Logger(enableLogging);
  }

  async validateStealth(page: Page, options: ProtectionOptions = {}): Promise<StealthReport> {
    this.logger.info('Starting comprehensive stealth validation');
    
    const results: ValidationResult[] = [];
    
    // Run all validation categories
    results.push(...await this.validateWebDriverDetection(page));
    results.push(...await this.validateCanvasProtection(page));
    results.push(...await this.validateWebGLProtection(page));
    results.push(...await this.validateAudioProtection(page));
    results.push(...await this.validateNavigatorProperties(page));
    results.push(...await this.validateTimingConsistency(page));
    results.push(...await this.validatePermissionHandling(page));
    results.push(...await this.validateErrorPatterns(page));
    results.push(...await this.validateBehavioralConsistency(page));
    results.push(...await this.validateAdvancedDetection(page));
    
    return this.generateReport(results);
  }

  private async validateWebDriverDetection(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      // Test 1: webdriver property
      results.push({
        category: 'WebDriver Detection',
        test: 'navigator.webdriver property',
        passed: !('webdriver' in navigator) || navigator.webdriver === undefined,
        severity: 'critical',
        details: { hasProperty: 'webdriver' in navigator, value: (navigator as any).webdriver },
        recommendation: 'webdriver property should be undefined or removed'
      });
      
      // Test 2: Chrome runtime
      results.push({
        category: 'WebDriver Detection', 
        test: 'Chrome runtime presence',
        passed: !!(window as any).chrome?.runtime,
        severity: 'high',
        details: { hasChromeRuntime: !!(window as any).chrome?.runtime },
        recommendation: 'Chrome runtime should be present for Chrome profiles'
      });
      
      // Test 3: Permission API consistency
      results.push({
        category: 'WebDriver Detection',
        test: 'Permissions API behavior',
        passed: typeof navigator.permissions?.query === 'function',
        severity: 'medium',
        details: { hasPermissionsAPI: typeof navigator.permissions?.query === 'function' },
        recommendation: 'Permissions API should be available and functional'
      });
      
      // Test 4: Plugin list consistency
      results.push({
        category: 'WebDriver Detection',
        test: 'Navigator plugins length',
        passed: navigator.plugins.length > 0,
        severity: 'high',
        details: { pluginCount: navigator.plugins.length },
        recommendation: 'Should have realistic number of plugins (1-5 typical)'
      });
      
      return results;
    });
  }

  private async validateCanvasProtection(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Test 1: Canvas fingerprint consistency
        const testText = 'Stealth validation test 🔒';
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText(testText, 2, 2);
        const fp1 = canvas.toDataURL();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText(testText, 2, 2);
        const fp2 = canvas.toDataURL();
        
        results.push({
          category: 'Canvas Protection',
          test: 'Canvas fingerprint consistency',
          passed: fp1 === fp2,
          severity: 'high',
          details: { consistent: fp1 === fp2, length1: fp1.length, length2: fp2.length },
          recommendation: 'Canvas fingerprints should be consistent for identical operations'
        });
        
        // Test 2: Canvas data URL format
        results.push({
          category: 'Canvas Protection',
          test: 'Canvas data URL format',
          passed: fp1.startsWith('data:image/png;base64,'),
          severity: 'low',
          details: { format: fp1.substring(0, 50) },
          recommendation: 'Canvas should produce valid PNG data URLs'
        });
        
        // Test 3: Canvas noise injection detection
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 10, 10);
        const solidBlack = canvas.toDataURL();
        
        // Check if noise was added (fingerprint shouldn't be pure black)
        const hasVariation = solidBlack !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAADl0RVh0U29mdHdhcmUAbWF0cGxvdGxpYiB2ZXJzaW9uIDMuMC4yLCBodHRwOi8vbWF0cGxvdGxpYi5vcmcvOIA7rQAAA4lJREFUeJzt2DEBAAAIw8B/phEcAAA=';
        
        results.push({
          category: 'Canvas Protection',
          test: 'Canvas noise injection',
          passed: hasVariation,
          severity: 'medium',
          details: { hasNoise: hasVariation },
          recommendation: 'Canvas should have subtle noise injection to prevent exact fingerprinting'
        });
        
      } catch (error) {
        results.push({
          category: 'Canvas Protection',
          test: 'Canvas API availability',
          passed: false,
          severity: 'critical',
          details: { error: error instanceof Error ? error.message : String(error) },
          recommendation: 'Canvas API should be available and functional'
        });
      }
      
      return results;
    });
  }

  private async validateWebGLProtection(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
          results.push({
            category: 'WebGL Protection',
            test: 'WebGL availability',
            passed: true, // No WebGL is also protection
            severity: 'low',
            details: { available: false },
            recommendation: 'WebGL unavailable - no WebGL fingerprinting possible'
          });
          return results;
        }
        
        // Test 1: Vendor and renderer spoofing
        const webgl = gl as WebGLRenderingContext;
        const vendor = webgl.getParameter(webgl.VENDOR);
        const renderer = webgl.getParameter(webgl.RENDERER);
        
        results.push({
          category: 'WebGL Protection',
          test: 'WebGL vendor/renderer spoofing',
          passed: typeof vendor === 'string' && typeof renderer === 'string',
          severity: 'high',
          details: { vendor, renderer },
          recommendation: 'WebGL vendor and renderer should be spoofed to common values'
        });
        
        // Test 2: Extension filtering
        const extensions = webgl.getSupportedExtensions() || [];
        results.push({
          category: 'WebGL Protection',
          test: 'WebGL extension filtering',
          passed: extensions.length > 0 && extensions.length < 30,
          severity: 'medium',
          details: { extensionCount: extensions.length, extensions: extensions.slice(0, 5) },
          recommendation: 'WebGL extensions should be filtered to common subset'
        });
        
        // Test 3: Parameter normalization
        const maxTextureSize = webgl.getParameter(webgl.MAX_TEXTURE_SIZE);
        const maxVertexAttribs = webgl.getParameter(webgl.MAX_VERTEX_ATTRIBS);
        
        results.push({
          category: 'WebGL Protection',
          test: 'WebGL parameter normalization',
          passed: maxTextureSize <= 16384 && maxVertexAttribs <= 32,
          severity: 'medium',
          details: { maxTextureSize, maxVertexAttribs },
          recommendation: 'WebGL parameters should be normalized to reasonable ranges'
        });
        
      } catch (error) {
        results.push({
          category: 'WebGL Protection',
          test: 'WebGL error handling',
          passed: true, // Errors can be protective
          severity: 'low',
          details: { error: error instanceof Error ? error.message : String(error) },
          recommendation: 'WebGL errors properly handled'
        });
      }
      
      return results;
    });
  }

  private async validateAudioProtection(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(async () => {
      const results: ValidationResult[] = [];
      
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        results.push({
          category: 'Audio Protection',
          test: 'AudioContext availability',
          passed: true,
          severity: 'low',
          details: { available: false },
          recommendation: 'No AudioContext - no audio fingerprinting possible'
        });
        return results;
      }
      
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Test 1: Context properties
        results.push({
          category: 'Audio Protection',
          test: 'AudioContext sample rate normalization',
          passed: audioContext.sampleRate === 44100 || audioContext.sampleRate === 48000,
          severity: 'medium',
          details: { sampleRate: audioContext.sampleRate },
          recommendation: 'Sample rate should be normalized to common values'
        });
        
        // Test 2: Destination channel count
        results.push({
          category: 'Audio Protection',
          test: 'Audio destination channels',
          passed: audioContext.destination.maxChannelCount <= 8,
          severity: 'low',
          details: { maxChannelCount: audioContext.destination.maxChannelCount },
          recommendation: 'Channel count should be normalized'
        });
        
        audioContext.close();
        
      } catch (error) {
        results.push({
          category: 'Audio Protection',
          test: 'AudioContext creation',
          passed: false,
          severity: 'medium',
          details: { error: error instanceof Error ? error.message : String(error) },
          recommendation: 'AudioContext should be createable or properly blocked'
        });
      }
      
      return results;
    });
  }

  private async validateNavigatorProperties(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      // Test 1: User agent consistency
      results.push({
        category: 'Navigator Properties',
        test: 'User agent format',
        passed: navigator.userAgent.includes('Mozilla') && navigator.userAgent.length > 50,
        severity: 'high',
        details: { userAgent: navigator.userAgent.substring(0, 100) },
        recommendation: 'User agent should be realistic and properly formatted'
      });
      
      // Test 2: Platform consistency
      results.push({
        category: 'Navigator Properties', 
        test: 'Platform property',
        passed: typeof navigator.platform === 'string' && navigator.platform.length > 0,
        severity: 'medium',
        details: { platform: navigator.platform },
        recommendation: 'Platform should match user agent'
      });
      
      // Test 3: Language properties
      results.push({
        category: 'Navigator Properties',
        test: 'Language consistency',
        passed: Array.isArray(navigator.languages) && navigator.languages.length > 0,
        severity: 'medium',
        details: { 
          language: navigator.language, 
          languages: navigator.languages?.slice(0, 3) 
        },
        recommendation: 'Languages should be realistic array'
      });
      
      // Test 4: Hardware concurrency
      results.push({
        category: 'Navigator Properties',
        test: 'Hardware concurrency',
        passed: typeof navigator.hardwareConcurrency === 'number' && 
               navigator.hardwareConcurrency >= 1 && navigator.hardwareConcurrency <= 32,
        severity: 'medium',
        details: { hardwareConcurrency: navigator.hardwareConcurrency },
        recommendation: 'Hardware concurrency should be realistic (1-32 cores)'
      });
      
      return results;
    });
  }

  private async validateTimingConsistency(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      // Test 1: Performance.now() precision
      const start = performance.now();
      const end = performance.now();
      const precision = end - start;
      
      results.push({
        category: 'Timing Consistency',
        test: 'Performance timing precision',
        passed: precision >= 0 && precision < 1,
        severity: 'low',
        details: { precision },
        recommendation: 'Timing should have realistic precision'
      });
      
      // Test 2: Date.now() vs performance.now() consistency
      const dateNow = Date.now();
      const perfNow = performance.now();
      const timeOrigin = performance.timeOrigin || dateNow - perfNow;
      const difference = Math.abs(dateNow - (timeOrigin + perfNow));
      
      results.push({
        category: 'Timing Consistency',
        test: 'Time origin consistency',
        passed: difference < 1000, // Within 1 second
        severity: 'low',
        details: { difference, timeOrigin: Math.round(timeOrigin) },
        recommendation: 'Time measurements should be consistent'
      });
      
      return results;
    });
  }

  private async validatePermissionHandling(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(async () => {
      const results: ValidationResult[] = [];
      
      if (navigator.permissions) {
        try {
          // Test notification permission
          const notificationPerm = await navigator.permissions.query({ name: 'notifications' as any });
          results.push({
            category: 'Permission Handling',
            test: 'Notification permission query',
            passed: notificationPerm.state === 'denied' || notificationPerm.state === 'prompt',
            severity: 'low',
            details: { state: notificationPerm.state },
            recommendation: 'Permissions should default to denied/default for privacy'
          });
        } catch (error) {
          results.push({
            category: 'Permission Handling',
            test: 'Permission query error handling',
            passed: true,
            severity: 'low',
            details: { error: error instanceof Error ? error.message : String(error) },
            recommendation: 'Permission errors handled correctly'
          });
        }
      }
      
      return results;
    });
  }

  private async validateErrorPatterns(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      // Test error stack trace normalization
      try {
        throw new Error('Test error for validation');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        const hasNormalizedStack = !errorObj.stack?.includes('file:///') && 
                                 !errorObj.stack?.includes('chrome-extension://');
        
        results.push({
          category: 'Error Patterns',
          test: 'Stack trace normalization',
          passed: hasNormalizedStack,
          severity: 'low',
          details: { stackPreview: errorObj.stack?.split('\n')[0] },
          recommendation: 'Error stack traces should not reveal file paths or extensions'
        });
      }
      
      return results;
    });
  }

  private async validateBehavioralConsistency(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      // Test 1: Event timing consistency
      let mouseEventFired = false;
      const mouseHandler = () => { mouseEventFired = true; };
      
      document.addEventListener('mousemove', mouseHandler);
      
      // Simulate mouse event
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
      document.dispatchEvent(event);
      
      results.push({
        category: 'Behavioral Consistency',
        test: 'Mouse event handling',
        passed: mouseEventFired,
        severity: 'low',
        details: { eventFired: mouseEventFired },
        recommendation: 'Mouse events should be handled normally'
      });
      
      document.removeEventListener('mousemove', mouseHandler);
      
      // Test 2: Focus behavior
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      
      results.push({
        category: 'Behavioral Consistency',
        test: 'Focus behavior',
        passed: document.activeElement === input,
        severity: 'low',
        details: { focusWorking: document.activeElement === input },
        recommendation: 'Focus should work normally'
      });
      
      document.body.removeChild(input);
      
      return results;
    });
  }

  private async validateAdvancedDetection(page: Page): Promise<ValidationResult[]> {
    return await page.evaluate(() => {
      const results: ValidationResult[] = [];
      
      // Test 1: Iframe behavior
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const hasIframeContentWindow = iframe.contentWindow !== null;
      results.push({
        category: 'Advanced Detection',
        test: 'Iframe content window access',
        passed: hasIframeContentWindow,
        severity: 'low',
        details: { hasContentWindow: hasIframeContentWindow },
        recommendation: 'Iframes should behave normally'
      });
      
      document.body.removeChild(iframe);
      
      // Test 2: Property descriptor consistency
      const descriptor = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
      const hasProperDescriptor = descriptor && descriptor.configurable !== undefined;
      
      results.push({
        category: 'Advanced Detection',
        test: 'Property descriptor consistency',
        passed: hasProperDescriptor ?? false,
        severity: 'medium',
        details: { hasDescriptor: hasProperDescriptor },
        recommendation: 'Property descriptors should be realistic'
      });
      
      return results;
    });
  }

  private generateReport(results: ValidationResult[]): StealthReport {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'critical').length;
    
    // Calculate weighted score
    let totalWeight = 0;
    let earnedWeight = 0;
    
    results.forEach(result => {
      const weight = {
        'low': 1,
        'medium': 2,
        'high': 3,
        'critical': 5
      }[result.severity];
      
      totalWeight += weight;
      if (result.passed) {
        earnedWeight += weight;
      }
    });
    
    const overallScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    
    // Generate recommendations
    const recommendations = results
      .filter(r => !r.passed && r.recommendation)
      .map(r => r.recommendation!)
      .slice(0, 5); // Top 5 recommendations
    
    this.logger.info(`Stealth validation complete: ${passedTests}/${totalTests} tests passed, score: ${overallScore}/100`);
    
    return {
      overallScore,
      totalTests,
      passedTests,
      criticalFailures,
      results,
      recommendations
    };
  }

  async selfHeal(page: Page, report: StealthReport): Promise<boolean> {
    if ((report.criticalFailures ?? 0) === 0 && report.overallScore >= 80) {
      this.logger.info('No self-healing needed - stealth level acceptable');
      return true;
    }

    this.logger.info(`Attempting self-healing for stealth issues (score: ${report.overallScore})`);
    
    let healingAttempts = 0;
    const criticalIssues = report.results.filter(r => !r.passed && r.severity === 'critical');
    
    for (const issue of criticalIssues) {
      try {
        const healed = await this.attemptHealIssue(page, issue);
        if (healed) {
          healingAttempts++;
        }
      } catch (error) {
        this.logger.error(`Failed to heal issue: ${issue.test}`, error);
      }
    }
    
    this.logger.info(`Self-healing completed: ${healingAttempts} issues addressed`);
    return healingAttempts > 0;
  }

  private async attemptHealIssue(page: Page, issue: ValidationResult): Promise<boolean> {
    // Implement specific healing strategies based on issue type
    if (issue.category === 'WebDriver Detection' && issue.test.includes('webdriver')) {
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });
      });
      return true;
    }
    
    if (issue.category === 'Navigator Properties' && issue.test.includes('plugins')) {
      await page.evaluate(() => {
        // Re-inject plugins if missing
        const pluginArray = [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' }
        ];
        Object.defineProperty(navigator, 'plugins', {
          get: () => pluginArray
        });
      });
      return true;
    }
    
    return false;
  }
}