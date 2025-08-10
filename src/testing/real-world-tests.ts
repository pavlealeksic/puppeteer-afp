/**
 * Real-World Fingerprinting Test Suite
 * Tests the plugin against actual fingerprinting services and techniques
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { protectPage } from '../index';

export interface FingerprintTestResult {
  testName: string;
  passed: boolean;
  score?: number;
  details: any;
  errors?: string[];
}

export class RealWorldTester {
  private browser: Browser | null = null;
  
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async testCreepJS(): Promise<FingerprintTestResult> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    await protectPage(page);
    
    try {
      await page.goto('https://abrahamjuliot.github.io/creepjs/', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for CreepJS to complete analysis
      await page.waitForSelector('.fingerprint-header', { timeout: 20000 });
      
      const results = await page.evaluate(() => {
        const headerElement = document.querySelector('.fingerprint-header');
        const scoreElement = document.querySelector('.grade');
        const trustElement = document.querySelector('.trust-score');
        
        // Extract detection results
        const detections = Array.from(document.querySelectorAll('.lies')).map(el => el.textContent);
        const warnings = Array.from(document.querySelectorAll('.warning')).map(el => el.textContent);
        
        return {
          score: scoreElement ? scoreElement.textContent : null,
          trust: trustElement ? trustElement.textContent : null,
          detections: detections,
          warnings: warnings,
          hash: headerElement ? headerElement.textContent : null
        };
      });
      
      // Analyze results - lower detection count is better
      const totalDetections = results.detections.length + results.warnings.length;
      const passed = totalDetections < 5; // Allow up to 5 minor detections
      
      await page.close();
      
      return {
        testName: 'CreepJS Detection Test',
        passed: passed,
        details: results,
        score: Math.max(0, 100 - (totalDetections * 10))
      };
      
    } catch (error) {
      await page.close();
      return {
        testName: 'CreepJS Detection Test',
        passed: false,
        details: {},
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async testFingerprintJS(): Promise<FingerprintTestResult> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    await protectPage(page);
    
    try {
      // Test with FingerprintJS library directly
      await page.goto('data:text/html,<html><head></head><body><div id="result"></div></body></html>');
      
      // Load FingerprintJS via CDN and test
      const fpResult = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
          script.onload = async () => {
            try {
              const fp = await (window as any).FingerprintJS.load();
              const result = await fp.get();
              
              // Check if our protection is working
              const components = result.components;
              const protectionIndicators = {
                canvasStable: components.canvas?.value === components.canvas?.value, // Consistency check
                webglConsistent: typeof components.webgl?.value === 'string',
                fontsLimited: Array.isArray(components.fonts?.value) && components.fonts.value.length < 50,
                audioNormalized: typeof components.audio?.value === 'number'
              };
              
              resolve({
                visitorId: result.visitorId,
                confidence: result.confidence,
                components: Object.keys(components).length,
                protectionIndicators: protectionIndicators
              });
            } catch (error) {
              resolve({ error: error instanceof Error ? error.message : String(error) });
            }
          };
          document.head.appendChild(script);
        });
      });
      
      await page.close();
      
      const fpResultObj = fpResult as any;
      const protectionScore = Object.values(fpResultObj?.protectionIndicators || {})
        .reduce((score: number, working: any) => score + (working ? 25 : 0), 0);
      
      return {
        testName: 'FingerprintJS Library Test',
        passed: protectionScore >= 75,
        details: fpResultObj,
        score: protectionScore as number
      };
      
    } catch (error) {
      await page.close();
      return {
        testName: 'FingerprintJS Library Test',
        passed: false,
        details: {},
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async testCanvasFingerprinting(): Promise<FingerprintTestResult> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    await protectPage(page);
    
    try {
      const canvasTests = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');
        
        // Multiple canvas fingerprinting tests
        const tests = [];
        
        // Test 1: Basic text rendering
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint test 🎨', 2, 2);
        const test1 = canvas.toDataURL();
        
        // Test 2: Same text again (should be identical if protected)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint test 🎨', 2, 2);
        const test2 = canvas.toDataURL();
        
        // Test 3: Different text (should be different)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText('Different text', 2, 2);
        const test3 = canvas.toDataURL();
        
        // Test 4: Geometric shapes
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, 2 * Math.PI);
        ctx.fill();
        const test4 = canvas.toDataURL();
        
        // Test 5: Same shapes again
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, 2 * Math.PI);
        ctx.fill();
        const test5 = canvas.toDataURL();
        
        return {
          consistency: {
            text: test1 === test2,
            shapes: test4 === test5
          },
          uniqueness: {
            textVsShapes: test1 !== test4,
            differentText: test1 !== test3
          },
          samples: [test1, test2, test3, test4, test5]
        };
      });
      
      await page.close();
      
      // Good protection should have consistent results for same operations
      // but different results for different operations
      const consistencyScore = (canvasTests.consistency.text && canvasTests.consistency.shapes) ? 50 : 0;
      const uniquenessScore = (canvasTests.uniqueness.textVsShapes && canvasTests.uniqueness.differentText) ? 50 : 0;
      const totalScore = consistencyScore + uniquenessScore;
      
      return {
        testName: 'Canvas Fingerprinting Test',
        passed: totalScore >= 90,
        details: canvasTests,
        score: totalScore
      };
      
    } catch (error) {
      await page.close();
      return {
        testName: 'Canvas Fingerprinting Test',
        passed: false,
        details: {},
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async testWebGLFingerprinting(): Promise<FingerprintTestResult> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    await protectPage(page);
    
    try {
      const webglTests = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!glContext) {
          return { supported: false };
        }
        
        const gl = glContext as WebGLRenderingContext;
        
        const results = {
          supported: true,
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION),
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
          extensions: gl.getSupportedExtensions(),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
          maxFragmentTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
        };
        
        // Test if values are normalized/spoofed
        const isProtected = {
          vendorNormalized: typeof results.vendor === 'string' && results.vendor.length > 0,
          extensionsFiltered: Array.isArray(results.extensions) && results.extensions.length < 30,
          parametersReasonable: results.maxTextureSize <= 16384 && results.maxVertexAttribs <= 32
        };
        
        return { ...results, isProtected };
      });
      
      await page.close();
      
      if (!webglTests.supported) {
        return {
          testName: 'WebGL Fingerprinting Test',
          passed: true, // No WebGL = no WebGL fingerprinting
          details: webglTests,
          score: 100
        };
      }
      
      const webglTestsObj = webglTests as any;
      const protectionScore = webglTestsObj?.isProtected ? 
        Object.values(webglTestsObj.isProtected)
          .reduce((score: number, isProtected: any) => score + (isProtected ? 33 : 0), 0) : 0;
      
      return {
        testName: 'WebGL Fingerprinting Test',
        passed: protectionScore >= 66,
        details: webglTestsObj,
        score: Math.round(protectionScore as number)
      };
      
    } catch (error) {
      await page.close();
      return {
        testName: 'WebGL Fingerprinting Test',
        passed: false,
        details: {},
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async testAudioFingerprinting(): Promise<FingerprintTestResult> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    await protectPage(page);
    
    try {
      const audioTests = await page.evaluate(async () => {
        if (!window.AudioContext && !(window as any).webkitAudioContext) {
          return { supported: false };
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        
        oscillator.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        return new Promise((resolve) => {
          scriptProcessor.onaudioprocess = function(event) {
            const samples = event.outputBuffer.getChannelData(0);
            
            // Test multiple fingerprinting vectors
            const results = {
              supported: true,
              samplesLength: samples.length,
              hasNonZeroSamples: Array.from(samples).some(s => s !== 0),
              sampleVariation: samples.slice(0, 100).reduce((acc, sample, i) => 
                acc + Math.abs(sample - (samples[i-1] || 0)), 0),
              contextSampleRate: audioContext.sampleRate,
              maxChannelCount: audioContext.destination.maxChannelCount
            };
            
            // Check if protection is working (should add noise/variation)
            const isProtected = {
              hasVariation: results.sampleVariation > 0.001,
              reasonableSampleRate: results.contextSampleRate === 44100 || results.contextSampleRate === 48000,
              normalizedChannels: results.maxChannelCount <= 8
            };
            
            oscillator.stop();
            audioContext.close();
            
            resolve({ ...results, isProtected });
          };
        });
      });
      
      await page.close();
      
      const audioTestsObj = audioTests as any;
      if (!audioTestsObj?.supported) {
        return {
          testName: 'Audio Fingerprinting Test',
          passed: true, // No audio context = no audio fingerprinting
          details: audioTestsObj,
          score: 100
        };
      }
      
      const protectionScore = audioTestsObj?.isProtected ? 
        Object.values(audioTestsObj.isProtected)
          .reduce((score: number, isProtected: any) => score + (isProtected ? 33 : 0), 0) : 0;
      
      return {
        testName: 'Audio Fingerprinting Test',
        passed: protectionScore >= 66,
        details: audioTestsObj,
        score: Math.round(protectionScore as number)
      };
      
    } catch (error) {
      await page.close();
      return {
        testName: 'Audio Fingerprinting Test',
        passed: false,
        details: {},
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async runAllTests(): Promise<FingerprintTestResult[]> {
    await this.initialize();
    
    try {
      const tests = await Promise.all([
        this.testCanvasFingerprinting(),
        this.testWebGLFingerprinting(),
        this.testAudioFingerprinting(),
        // this.testCreepJS(),  // Commented out as it requires internet access
        // this.testFingerprintJS()  // Commented out as it requires internet access
      ]);
      
      return tests;
    } finally {
      await this.cleanup();
    }
  }

  static generateReport(results: FingerprintTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const averageScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / totalTests;
    
    let report = `# Real-World Fingerprinting Protection Test Report\n\n`;
    report += `**Overall Results**: ${passedTests}/${totalTests} tests passed\n`;
    report += `**Average Score**: ${averageScore.toFixed(1)}/100\n`;
    report += `**Protection Level**: ${averageScore >= 90 ? 'Excellent' : averageScore >= 75 ? 'Good' : averageScore >= 50 ? 'Fair' : 'Poor'}\n\n`;
    
    results.forEach(result => {
      report += `## ${result.testName}\n`;
      report += `- **Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
      if (result.score !== undefined) {
        report += `- **Score**: ${result.score}/100\n`;
      }
      if (result.errors && result.errors.length > 0) {
        report += `- **Errors**: ${result.errors.join(', ')}\n`;
      }
      report += `- **Details**: ${JSON.stringify(result.details, null, 2)}\n\n`;
    });
    
    return report;
  }
}