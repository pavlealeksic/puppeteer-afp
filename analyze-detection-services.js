const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DetectionServiceAnalyzer {
  constructor() {
    this.services = [
      {
        name: 'Sannysoft',
        url: 'https://bot.sannysoft.com/',
        description: 'Bot detection service'
      },
      {
        name: 'Pixelscan',
        url: 'https://pixelscan.net/',
        description: 'Fingerprint consistency checker'
      },
      {
        name: 'F.vision',
        url: 'https://f.vision/',
        description: 'Privacy and fingerprinting test'
      },
      {
        name: 'Cover Your Tracks',
        url: 'https://coveryourtracks.eff.org/kcarter',
        description: 'EFF fingerprinting test'
      },
      {
        name: 'CreepJS',
        url: 'https://abrahamjuliot.github.io/creepjs/',
        description: 'Advanced browser fingerprinting'
      },
      {
        name: 'BrowserLeaks WebRTC',
        url: 'https://browserleaks.com/webrtc',
        description: 'WebRTC leak test'
      },
      {
        name: 'BrowserLeaks Canvas',
        url: 'https://browserleaks.com/canvas',
        description: 'Canvas fingerprinting test'
      },
      {
        name: 'Audio Fingerprint',
        url: 'https://audiofingerprint.openwpm.com/',
        description: 'Audio context fingerprinting'
      }
    ];
  }

  async analyzeService(service) {
    console.log(`\n🔍 ANALYZING: ${service.name}`);
    console.log(`📍 URL: ${service.url}`);
    console.log(`📝 Description: ${service.description}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const browser = await puppeteer.launch({ 
      headless: false,  // Show browser to see what's happening
      devtools: true,   // Open devtools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      // Set up comprehensive monitoring
      const detectedTests = [];
      const jsExecutions = [];
      const apiCalls = [];

      // Monitor console messages
      page.on('console', msg => {
        const text = msg.text();
        console.log(`[CONSOLE] ${text}`);
        
        // Look for fingerprinting-related messages
        if (text.toLowerCase().includes('fingerprint') || 
            text.toLowerCase().includes('bot') ||
            text.toLowerCase().includes('detect') ||
            text.toLowerCase().includes('canvas') ||
            text.toLowerCase().includes('webgl') ||
            text.toLowerCase().includes('audio')) {
          detectedTests.push({
            type: 'console',
            message: text,
            timestamp: Date.now()
          });
        }
      });

      // Monitor network requests
      page.on('request', request => {
        const url = request.url();
        console.log(`[REQUEST] ${request.method()} ${url}`);
      });

      // Monitor API calls by injecting monitoring scripts
      await page.evaluateOnNewDocument(() => {
        // Store original functions
        const originals = {
          getContext: HTMLCanvasElement.prototype.getContext,
          toDataURL: HTMLCanvasElement.prototype.toDataURL,
          getImageData: CanvasRenderingContext2D.prototype.getImageData,
          createAnalyser: window.AudioContext ? window.AudioContext.prototype.createAnalyser : null,
          getUserMedia: navigator.mediaDevices ? navigator.mediaDevices.getUserMedia : null,
          getTimezoneOffset: Date.prototype.getTimezoneOffset
        };

        window.__detectionAnalysis = {
          apiCalls: [],
          tests: [],
          fingerprints: {}
        };

        // Monitor Canvas
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          window.__detectionAnalysis.apiCalls.push({
            api: 'Canvas',
            method: 'getContext',
            args: [type, ...args],
            timestamp: Date.now()
          });
          return originals.getContext.call(this, type, ...args);
        };

        HTMLCanvasElement.prototype.toDataURL = function(...args) {
          const result = originals.toDataURL.call(this, ...args);
          window.__detectionAnalysis.apiCalls.push({
            api: 'Canvas',
            method: 'toDataURL',
            result: result.substring(0, 100) + '...',
            timestamp: Date.now()
          });
          window.__detectionAnalysis.fingerprints.canvas = result;
          return result;
        };

        if (originals.getImageData) {
          CanvasRenderingContext2D.prototype.getImageData = function(...args) {
            const result = originals.getImageData.call(this, ...args);
            window.__detectionAnalysis.apiCalls.push({
              api: 'Canvas',
              method: 'getImageData',
              args: args,
              timestamp: Date.now()
            });
            return result;
          };
        }

        // Monitor Audio
        if (window.AudioContext && originals.createAnalyser) {
          window.AudioContext.prototype.createAnalyser = function(...args) {
            const result = originals.createAnalyser.call(this, ...args);
            window.__detectionAnalysis.apiCalls.push({
              api: 'Audio',
              method: 'createAnalyser',
              timestamp: Date.now()
            });
            return result;
          };
        }

        // Monitor Navigator properties access
        const navigatorProps = ['userAgent', 'platform', 'hardwareConcurrency', 'deviceMemory', 
                               'languages', 'language', 'cookieEnabled', 'onLine', 'plugins'];
        
        navigatorProps.forEach(prop => {
          if (prop in navigator) {
            let accessed = false;
            const original = navigator[prop];
            try {
              Object.defineProperty(navigator, prop, {
                get: function() {
                  if (!accessed) {
                    window.__detectionAnalysis.apiCalls.push({
                      api: 'Navigator',
                      method: `get ${prop}`,
                      timestamp: Date.now()
                    });
                    accessed = true;
                  }
                  return original;
                },
                configurable: true
              });
            } catch(e) {
              // Some properties can't be redefined, skip them
            }
          }
        });

        // Monitor Screen properties
        const screenProps = ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'];
        screenProps.forEach(prop => {
          if (prop in screen) {
            let accessed = false;
            const original = screen[prop];
            try {
              Object.defineProperty(screen, prop, {
                get: function() {
                  if (!accessed) {
                    window.__detectionAnalysis.apiCalls.push({
                      api: 'Screen',
                      method: `get ${prop}`,
                      timestamp: Date.now()
                    });
                    accessed = true;
                  }
                  return original;
                },
                configurable: true
              });
            } catch(e) {
              // Some properties can't be redefined, skip them
            }
          }
        });

        console.log('🔍 Detection analysis monitoring initialized');
      });

      // Navigate to the service
      console.log(`⏳ Navigating to ${service.url}...`);
      await page.goto(service.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for page to load and execute tests
      console.log(`⏳ Waiting for tests to complete...`);
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Try to find test results or indicators
      const pageContent = await page.content();
      const detectionResults = await page.evaluate(() => {
        const analysis = window.__detectionAnalysis || { apiCalls: [], tests: [], fingerprints: {} };
        
        // Look for common detection indicators in the DOM
        const indicators = [];
        
        // Look for bot/automation detection messages
        const textContent = document.body.textContent.toLowerCase();
        if (textContent.includes('bot') || textContent.includes('automated') || 
            textContent.includes('selenium') || textContent.includes('webdriver')) {
          indicators.push('Bot detection indicators found');
        }

        // Look for fingerprinting results
        if (textContent.includes('fingerprint') || textContent.includes('unique')) {
          indicators.push('Fingerprinting results displayed');
        }

        // Check for specific test result elements
        const resultElements = document.querySelectorAll('[class*="result"], [class*="test"], [class*="score"], [class*="status"]');
        const results = Array.from(resultElements).map(el => ({
          className: el.className,
          textContent: el.textContent.trim(),
          id: el.id
        })).filter(r => r.textContent && r.textContent.length < 200);

        return {
          analysis,
          indicators,
          results,
          totalApiCalls: analysis.apiCalls.length,
          uniqueApis: [...new Set(analysis.apiCalls.map(call => call.api))],
          pageTitle: document.title,
          hasCanvas: analysis.apiCalls.some(call => call.api === 'Canvas'),
          hasAudio: analysis.apiCalls.some(call => call.api === 'Audio'),
          hasNavigator: analysis.apiCalls.some(call => call.api === 'Navigator'),
          hasScreen: analysis.apiCalls.some(call => call.api === 'Screen')
        };
      });

      // Display analysis results
      console.log(`\n📊 ANALYSIS RESULTS for ${service.name}:`);
      console.log(`   Page Title: ${detectionResults.pageTitle}`);
      console.log(`   Total API Calls: ${detectionResults.totalApiCalls}`);
      console.log(`   APIs Used: ${detectionResults.uniqueApis.join(', ')}`);
      console.log(`   Canvas Detection: ${detectionResults.hasCanvas ? '✅' : '❌'}`);
      console.log(`   Audio Detection: ${detectionResults.hasAudio ? '✅' : '❌'}`);
      console.log(`   Navigator Detection: ${detectionResults.hasNavigator ? '✅' : '❌'}`);
      console.log(`   Screen Detection: ${detectionResults.hasScreen ? '✅' : '❌'}`);

      if (detectionResults.indicators.length > 0) {
        console.log(`   Detection Indicators:`);
        detectionResults.indicators.forEach(indicator => {
          console.log(`     - ${indicator}`);
        });
      }

      if (detectionResults.results.length > 0) {
        console.log(`   Test Results Found:`);
        detectionResults.results.slice(0, 10).forEach(result => {
          console.log(`     - ${result.className}: ${result.textContent}`);
        });
      }

      // Save detailed analysis
      const analysisData = {
        service: service,
        timestamp: new Date().toISOString(),
        detectionResults,
        pageContent: pageContent.substring(0, 50000), // Limit size
        recommendations: []
      };

      // Generate recommendations based on findings
      if (detectionResults.hasCanvas) {
        analysisData.recommendations.push('Implement canvas fingerprint protection');
      }
      if (detectionResults.hasAudio) {
        analysisData.recommendations.push('Implement audio context protection');
      }
      if (detectionResults.hasNavigator) {
        analysisData.recommendations.push('Enhance navigator property protection');
      }
      if (detectionResults.hasScreen) {
        analysisData.recommendations.push('Implement screen property protection');
      }

      const analysisFile = path.join(__dirname, `analysis-${service.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      fs.writeFileSync(analysisFile, JSON.stringify(analysisData, null, 2));
      console.log(`📁 Detailed analysis saved to: ${analysisFile}`);

      return analysisData;

    } catch (error) {
      console.log(`❌ Error analyzing ${service.name}: ${error.message}`);
      return null;
    } finally {
      await browser.close();
    }
  }

  async analyzeServiceWithPlugin(service, protectPage) {
    console.log(`\n🔍 ANALYZING WITH PLUGIN: ${service.name}`);
    console.log(`📍 URL: ${service.url}`);
    console.log(`📝 Description: ${service.description}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const browser = await puppeteer.launch({ 
      headless: false,  // Show browser to see what's happening
      devtools: true,   // Open devtools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Apply our protection with random settings
      const options = {
        canvasRgba: [
          Math.floor(Math.random() * 10) - 5,
          Math.floor(Math.random() * 10) - 5,
          Math.floor(Math.random() * 10) - 5,
          Math.floor(Math.random() * 10) - 5
        ],
        fontFingerprint: {
          noise: Math.floor(Math.random() * 4) - 1,
          sign: Math.random() < 0.5 ? -1 : 1
        },
        hardwareConfig: {
          hardwareConcurrency: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
          deviceMemory: [2, 4, 8, 16][Math.floor(Math.random() * 4)]
        },
        languageConfig: {
          languages: [['en-US', 'en'], ['en-GB', 'en'], ['en-CA', 'en']][Math.floor(Math.random() * 3)],
          language: ['en-US', 'en-GB', 'en-CA'][Math.floor(Math.random() * 3)],
          platform: ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)]
        },
        webRTCProtect: true,
        enableLogging: true
      };
      
      console.log(`🛡️  Applying protection with options:`, JSON.stringify(options, null, 2));
      
      await protectPage(page, options);

      // Set up comprehensive monitoring
      const detectedTests = [];
      const jsExecutions = [];
      const apiCalls = [];

      // Monitor console messages
      page.on('console', msg => {
        const text = msg.text();
        console.log(`[CONSOLE] ${text}`);
        
        // Look for fingerprinting-related messages
        if (text.toLowerCase().includes('fingerprint') || 
            text.toLowerCase().includes('bot') ||
            text.toLowerCase().includes('detect') ||
            text.toLowerCase().includes('canvas') ||
            text.toLowerCase().includes('webgl') ||
            text.toLowerCase().includes('audio')) {
          detectedTests.push({
            type: 'console',
            message: text,
            timestamp: Date.now()
          });
        }
      });

      // Monitor network requests
      page.on('request', request => {
        const url = request.url();
        console.log(`[REQUEST] ${request.method()} ${url}`);
      });

      // Navigate to the service
      console.log(`⏳ Navigating to ${service.url}...`);
      await page.goto(service.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for page to load and execute tests
      console.log(`⏳ Waiting for tests to complete...`);
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Try to find test results or indicators
      const pageContent = await page.content();
      const detectionResults = await page.evaluate(() => {
        // Look for common detection indicators in the DOM
        const indicators = [];
        
        // Look for bot/automation detection messages
        const textContent = document.body.textContent.toLowerCase();
        if (textContent.includes('bot') || textContent.includes('automated') || 
            textContent.includes('selenium') || textContent.includes('webdriver')) {
          indicators.push('Bot detection indicators found');
        }

        // Look for fingerprinting results
        if (textContent.includes('fingerprint') || textContent.includes('unique')) {
          indicators.push('Fingerprinting results displayed');
        }

        // Check for specific test result elements
        const resultElements = document.querySelectorAll('[class*="result"], [class*="test"], [class*="score"], [class*="status"]');
        const results = Array.from(resultElements).map(el => ({
          className: el.className,
          textContent: el.textContent.trim(),
          id: el.id
        })).filter(r => r.textContent && r.textContent.length < 200);

        // Look for failed tests specifically
        const failedElements = document.querySelectorAll('.failed, [class*="fail"], [class*="detected"]');
        const failedTests = Array.from(failedElements).map(el => ({
          className: el.className,
          textContent: el.textContent.trim(),
          id: el.id
        })).filter(r => r.textContent && r.textContent.length < 200);

        return {
          indicators,
          results,
          failedTests,
          pageTitle: document.title,
          totalTests: results.length,
          failedCount: failedTests.length,
          passedCount: results.length - failedTests.length
        };
      });

      // Display analysis results
      console.log(`\n📊 ANALYSIS RESULTS WITH PLUGIN for ${service.name}:`);
      console.log(`   Page Title: ${detectionResults.pageTitle}`);
      console.log(`   Total Tests Found: ${detectionResults.totalTests}`);
      console.log(`   Failed Tests: ${detectionResults.failedCount}`);
      console.log(`   Passed Tests: ${detectionResults.passedCount}`);
      console.log(`   Success Rate: ${detectionResults.totalTests > 0 ? Math.round((detectionResults.passedCount / detectionResults.totalTests) * 100) : 0}%`);

      if (detectionResults.indicators.length > 0) {
        console.log(`   Detection Indicators:`);
        detectionResults.indicators.forEach(indicator => {
          console.log(`     - ${indicator}`);
        });
      }

      if (detectionResults.failedTests.length > 0) {
        console.log(`   ❌ FAILED TESTS:`);
        detectionResults.failedTests.slice(0, 10).forEach(result => {
          console.log(`     - ${result.id || result.className}: ${result.textContent}`);
        });
      }

      if (detectionResults.results.length > 0) {
        console.log(`   📋 ALL TEST RESULTS:`);
        detectionResults.results.slice(0, 15).forEach(result => {
          const status = result.className.includes('failed') || result.className.includes('fail') ? '❌' : '✅';
          console.log(`     ${status} ${result.id || result.className}: ${result.textContent}`);
        });
      }

      // Save detailed analysis with plugin
      const analysisData = {
        service: service,
        timestamp: new Date().toISOString(),
        protectionEnabled: true,
        protectionOptions: options,
        detectionResults,
        pageContent: pageContent.substring(0, 50000), // Limit size
        recommendations: []
      };

      // Generate specific recommendations based on failures
      if (detectionResults.failedTests.length > 0) {
        analysisData.recommendations.push(`Fix ${detectionResults.failedTests.length} failing detection tests`);
        
        detectionResults.failedTests.forEach(test => {
          if (test.textContent.toLowerCase().includes('webdriver')) {
            analysisData.recommendations.push('Enhance WebDriver property hiding');
          }
          if (test.textContent.toLowerCase().includes('canvas')) {
            analysisData.recommendations.push('Improve canvas fingerprint protection');
          }
          if (test.textContent.toLowerCase().includes('webgl')) {
            analysisData.recommendations.push('Enhance WebGL fingerprint protection');
          }
          if (test.textContent.toLowerCase().includes('audio')) {
            analysisData.recommendations.push('Implement audio fingerprint protection');
          }
        });
      }

      const analysisFile = path.join(__dirname, `analysis-with-plugin-${service.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      fs.writeFileSync(analysisFile, JSON.stringify(analysisData, null, 2));
      console.log(`📁 Detailed analysis saved to: ${analysisFile}`);

      return analysisData;

    } catch (error) {
      console.log(`❌ Error analyzing ${service.name}: ${error.message}`);
      return null;
    } finally {
      await browser.close();
    }
  }

  async analyzeAll() {
    console.log(`🚀 STARTING COMPREHENSIVE DETECTION SERVICE ANALYSIS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const results = [];
    
    for (const service of this.services) {
      try {
        const result = await this.analyzeService(service);
        if (result) {
          results.push(result);
        }
        
        // Wait between services to be respectful
        console.log(`⏳ Waiting 5 seconds before next service...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.log(`❌ Failed to analyze ${service.name}: ${error.message}`);
      }
    }

    // Generate comprehensive report
    console.log(`\n📋 COMPREHENSIVE ANALYSIS SUMMARY:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const allRecommendations = new Set();
    const apiUsage = {};
    
    results.forEach(result => {
      if (result && result.detectionResults) {
        result.recommendations.forEach(rec => allRecommendations.add(rec));
        result.detectionResults.uniqueApis.forEach(api => {
          apiUsage[api] = (apiUsage[api] || 0) + 1;
        });
      }
    });

    console.log(`\n🎯 PRIORITY IMPROVEMENTS NEEDED:`);
    [...allRecommendations].forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });

    console.log(`\n📊 MOST COMMONLY TESTED APIS:`);
    Object.entries(apiUsage)
      .sort(([,a], [,b]) => b - a)
      .forEach(([api, count]) => {
        console.log(`   ${api}: tested by ${count}/${results.length} services`);
      });

    // Save master report
    const masterReport = {
      timestamp: new Date().toISOString(),
      totalServices: this.services.length,
      analyzedServices: results.length,
      priorityImprovements: [...allRecommendations],
      apiUsage,
      results
    };

    const reportFile = path.join(__dirname, 'detection-services-master-analysis.json');
    fs.writeFileSync(reportFile, JSON.stringify(masterReport, null, 2));
    console.log(`\n📁 Master analysis report saved to: ${reportFile}`);

    return masterReport;
  }
}

// Run the analysis
async function main() {
  const analyzer = new DetectionServiceAnalyzer();
  
  console.log(`Select analysis mode:`);
  console.log(`1. Analyze all services (comprehensive)`);
  console.log(`2. Analyze specific service`);
  
  // Test with our plugin enabled
  console.log(`\n🧪 TESTING WITH PLUGIN ENABLED`);
  const { protectPage } = require('./dist/index.js');
  
  // Test multiple services to see what we're missing
  const testServices = [
    {
      name: 'Sannysoft',
      url: 'https://bot.sannysoft.com/',
      description: 'Bot detection service'
    },
    {
      name: 'Pixelscan',
      url: 'https://pixelscan.net/',
      description: 'Fingerprint consistency checker'
    },
    {
      name: 'CreepJS',
      url: 'https://abrahamjuliot.github.io/creepjs/',
      description: 'Advanced browser fingerprinting'
    }
  ];
  
  for (const service of testServices) {
    console.log(`\n🧪 TESTING: ${service.name} with AFP plugin`);
    await analyzer.analyzeServiceWithPlugin(service, protectPage);
    
    // Wait between services
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DetectionServiceAnalyzer;