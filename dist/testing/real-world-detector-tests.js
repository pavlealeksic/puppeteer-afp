"use strict";
/**
 * Real-World Detection Service Test Suite
 * Tests our anti-fingerprinting plugin against actual detection services
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealWorldDetectorTester = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const index_1 = require("../index");
const logger_1 = require("../logger");
class RealWorldDetectorTester {
    constructor(enableLogging = true) {
        this.browser = null;
        this.logger = new logger_1.Logger(enableLogging);
    }
    async initialize() {
        this.browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--ignore-ssl-errors',
                '--allow-running-insecure-content'
            ]
        });
    }
    async destroy() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    // CreepJS - Advanced detector that analyzes many fingerprinting vectors
    async testCreepJS() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            await page.goto('https://abrahamjuliot.github.io/creepjs/', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            // Wait for CreepJS to complete analysis
            await new Promise(resolve => setTimeout(resolve, 15000));
            const result = await page.evaluate(() => {
                // CreepJS stores results in specific DOM elements
                const trustScore = document.querySelector('#fingerprint-data .trust-score')?.textContent;
                const lies = document.querySelector('#fingerprint-data .lies')?.textContent;
                const bot = document.querySelector('#fingerprint-data .bot')?.textContent;
                const grade = document.querySelector('#fingerprint-data .grade')?.textContent;
                // Get detailed fingerprint data
                const fingerprintData = Array.from(document.querySelectorAll('#fingerprint-data .data-item')).map(item => ({
                    name: item.querySelector('.name')?.textContent,
                    value: item.querySelector('.value')?.textContent,
                    grade: item.querySelector('.grade')?.textContent
                }));
                return {
                    trustScore: trustScore ? parseFloat(trustScore.replace('%', '')) : 0,
                    lies: lies ? parseInt(lies) : 0,
                    isBot: bot?.includes('true') || false,
                    grade: grade,
                    fingerprintData,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const score = result.trustScore || 0;
            const passed = score >= 70 && result.lies <= 5 && !result.isBot;
            return {
                serviceName: 'CreepJS',
                url: 'https://abrahamjuliot.github.io/creepjs/',
                passed,
                score,
                detectionStatus: result.isBot ? 'detected' : score >= 70 ? 'undetected' : 'suspicious',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'CreepJS',
                url: 'https://abrahamjuliot.github.io/creepjs/',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Brotector - Advanced automation detector
    async testBrotector() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            // Enhanced retry logic for Brotector
            let navigationSuccess = false;
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    this.logger.debug(`Brotector navigation attempt ${attempt}/${maxRetries}`);
                    // Progressive timeout and different strategies
                    const waitUntilOptions = ['domcontentloaded', 'networkidle2', 'networkidle0'];
                    const timeout = 15000 + (attempt * 7500); // 15s, 22.5s, 30s
                    await page.goto('https://kaliiiiiiiiii.github.io/brotector/', {
                        waitUntil: waitUntilOptions[attempt - 1],
                        timeout
                    });
                    navigationSuccess = true;
                    break;
                }
                catch (navError) {
                    this.logger.debug(`Brotector navigation attempt ${attempt} failed: ${navError instanceof Error ? navError.message : String(navError)}`);
                    if (attempt === maxRetries) {
                        // Try one more time with just load event
                        try {
                            await page.goto('https://kaliiiiiiiiii.github.io/brotector/', {
                                waitUntil: 'load',
                                timeout: 10000
                            });
                            navigationSuccess = true;
                        }
                        catch (finalError) {
                            throw navError; // Throw original error
                        }
                    }
                    else {
                        // Wait before retry with exponential backoff
                        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
                    }
                }
            }
            if (!navigationSuccess) {
                throw new Error('Failed to navigate to Brotector after all attempts');
            }
            // Wait for Brotector analysis
            await new Promise(resolve => setTimeout(resolve, 10000));
            const result = await page.evaluate(() => {
                // Look for Brotector results
                const resultElement = document.querySelector('#result, .result, .detection-result');
                const statusElement = document.querySelector('.status, .detection-status');
                const scoreElement = document.querySelector('.score, .detection-score');
                const resultText = resultElement?.textContent?.toLowerCase() || '';
                const statusText = statusElement?.textContent?.toLowerCase() || '';
                const scoreText = scoreElement?.textContent || '';
                const isDetected = resultText.includes('detected') ||
                    resultText.includes('automation') ||
                    statusText.includes('detected') ||
                    statusText.includes('bot');
                const score = scoreText ? parseFloat(scoreText.replace(/[^\d.]/g, '')) :
                    (isDetected ? 0 : 100);
                return {
                    isDetected,
                    resultText,
                    statusText,
                    score,
                    url: window.location.href,
                    detectionMethods: Array.from(document.querySelectorAll('.detection-method, .test-result')).map(el => ({
                        name: el.querySelector('.name, .test-name')?.textContent,
                        status: el.querySelector('.status, .result')?.textContent,
                        passed: !el.textContent?.toLowerCase().includes('fail')
                    }))
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const passed = !result.isDetected && result.score >= 80;
            return {
                serviceName: 'Brotector',
                url: 'https://kaliiiiiiiiii.github.io/brotector/',
                passed,
                score: result.score,
                detectionStatus: result.isDetected ? 'detected' : passed ? 'undetected' : 'suspicious',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'Brotector',
                url: 'https://kaliiiiiiiiii.github.io/brotector/',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Pixelscan - Simple fingerprint checker
    async testPixelscan() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            await page.goto('https://pixelscan.net/', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            // Wait for scan to complete
            await new Promise(resolve => setTimeout(resolve, 8000));
            const result = await page.evaluate(() => {
                // Look for Pixelscan results
                const consistencyElement = document.querySelector('.consistency-score, #consistency-score');
                const fingerprintElement = document.querySelector('.fingerprint-result, #fingerprint');
                const scoreElements = document.querySelectorAll('.score, .test-score');
                let consistencyScore = 0;
                if (consistencyElement) {
                    const text = consistencyElement.textContent || '';
                    const match = text.match(/(\d+(?:\.\d+)?)/);
                    consistencyScore = match ? parseFloat(match[1]) : 0;
                }
                const tests = Array.from(document.querySelectorAll('.test-item, .fingerprint-test')).map(item => ({
                    name: item.querySelector('.test-name, .name')?.textContent,
                    status: item.querySelector('.test-status, .status')?.textContent,
                    value: item.querySelector('.test-value, .value')?.textContent
                }));
                return {
                    consistencyScore,
                    fingerprintHash: fingerprintElement?.textContent,
                    tests,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const score = result.consistencyScore;
            const passed = score >= 80;
            return {
                serviceName: 'Pixelscan',
                url: 'https://pixelscan.net/',
                passed,
                score,
                detectionStatus: passed ? 'undetected' : score >= 60 ? 'suspicious' : 'detected',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'Pixelscan',
                url: 'https://pixelscan.net/',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // F.vision - Privacy checker
    async testFVision() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            await page.goto('https://fv.pro/check-privacy/general', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            // Wait for analysis
            await new Promise(resolve => setTimeout(resolve, 8000));
            const result = await page.evaluate(() => {
                const scoreElement = document.querySelector('.privacy-score, .score');
                const testsElements = document.querySelectorAll('.test-result, .check-item');
                const tests = Array.from(testsElements).map(test => ({
                    name: test.querySelector('.test-name, .name')?.textContent,
                    status: test.querySelector('.test-status, .status')?.textContent,
                    passed: test.classList.contains('passed') ||
                        test.querySelector('.pass, .success')?.textContent
                }));
                const passedCount = tests.filter(t => t.passed).length;
                const score = tests.length > 0 ? (passedCount / tests.length) * 100 : 0;
                return {
                    score,
                    tests,
                    passedCount,
                    totalCount: tests.length,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const passed = result.score >= 75;
            return {
                serviceName: 'F.vision',
                url: 'https://fv.pro/check-privacy/general',
                passed,
                score: result.score,
                detectionStatus: passed ? 'undetected' : result.score >= 50 ? 'suspicious' : 'detected',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'F.vision',
                url: 'https://fv.pro/check-privacy/general',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Cover Your Tracks - EFF fingerprinting test
    async testCoverYourTracks() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            await page.goto('https://coveryourtracks.eff.org/', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            // Click the test button if present
            try {
                await page.waitForSelector('.test-button, #test-fp', { timeout: 5000 });
                await page.click('.test-button, #test-fp');
            }
            catch {
                // Button might not be present, continue
            }
            // Wait for test completion
            await new Promise(resolve => setTimeout(resolve, 15000));
            const result = await page.evaluate(() => {
                const resultElement = document.querySelector('.results, .test-results, #results');
                const protectionElements = document.querySelectorAll('.protection-level, .result-item');
                let fingerprintingBlocked = false;
                let trackingBlocked = false;
                let uniqueness = 'unknown';
                const resultText = resultElement?.textContent?.toLowerCase() || '';
                if (resultText.includes('fingerprinting') && resultText.includes('protected')) {
                    fingerprintingBlocked = true;
                }
                if (resultText.includes('tracking') && resultText.includes('protected')) {
                    trackingBlocked = true;
                }
                // Check protection details
                const protectionDetails = Array.from(protectionElements).map(el => ({
                    test: el.querySelector('.test-name')?.textContent,
                    result: el.querySelector('.test-result')?.textContent,
                    protected: el.textContent?.toLowerCase().includes('protected') ||
                        el.classList.contains('protected')
                }));
                const score = protectionDetails.length > 0 ?
                    (protectionDetails.filter(p => p.protected).length / protectionDetails.length) * 100 :
                    (fingerprintingBlocked && trackingBlocked ? 100 : 50);
                return {
                    fingerprintingBlocked,
                    trackingBlocked,
                    uniqueness,
                    score,
                    protectionDetails,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const passed = result.fingerprintingBlocked && result.score >= 80;
            return {
                serviceName: 'Cover Your Tracks',
                url: 'https://coveryourtracks.eff.org/',
                passed,
                score: result.score,
                detectionStatus: passed ? 'undetected' : result.score >= 60 ? 'suspicious' : 'detected',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'Cover Your Tracks',
                url: 'https://coveryourtracks.eff.org/',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Sannysoft - Bot detection test
    async testSannysoft() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            // Retry logic with multiple navigation strategies
            let navigationSuccess = false;
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    this.logger.debug(`Sannysoft navigation attempt ${attempt}/${maxRetries}`);
                    // Different strategies for each attempt
                    const waitUntilOptions = [
                        'networkidle0',
                        'networkidle2',
                        'domcontentloaded'
                    ];
                    await page.goto('https://bot.sannysoft.com/', {
                        waitUntil: waitUntilOptions[attempt - 1],
                        timeout: 20000 + (attempt * 5000) // Increasing timeout
                    });
                    navigationSuccess = true;
                    break;
                }
                catch (navError) {
                    this.logger.debug(`Navigation attempt ${attempt} failed: ${navError instanceof Error ? navError.message : String(navError)}`);
                    if (attempt === maxRetries) {
                        throw navError; // Re-throw on final attempt
                    }
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                }
            }
            if (!navigationSuccess) {
                throw new Error('Failed to navigate after all retry attempts');
            }
            // Wait for tests to complete
            await new Promise(resolve => setTimeout(resolve, 5000));
            const result = await page.evaluate(() => {
                const testRows = Array.from(document.querySelectorAll('tr')).slice(1); // Skip header
                const tests = testRows.map(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const testName = cells[0]?.textContent?.trim();
                        const testResult = cells[1]?.textContent?.trim();
                        const passed = !testResult?.toLowerCase().includes('failed') &&
                            !testResult?.toLowerCase().includes('detected') &&
                            !testResult?.toLowerCase().includes('yes');
                        return {
                            name: testName,
                            result: testResult,
                            passed
                        };
                    }
                    return null;
                }).filter(Boolean);
                const passedCount = tests.filter(t => t?.passed).length;
                const totalCount = tests.length;
                const score = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
                const botDetected = tests.some(t => t?.name?.toLowerCase().includes('webdriver') && !t.passed);
                return {
                    tests,
                    passedCount,
                    totalCount,
                    score,
                    botDetected,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const passed = !result.botDetected && result.score >= 80;
            return {
                serviceName: 'Sannysoft',
                url: 'https://bot.sannysoft.com/',
                passed,
                score: result.score,
                detectionStatus: result.botDetected ? 'detected' : passed ? 'undetected' : 'suspicious',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'Sannysoft',
                url: 'https://bot.sannysoft.com/',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Audio Fingerprint Test
    async testAudioFingerprint() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            // Handle SSL certificate issues
            await page.setBypassCSP(true);
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                // Allow the request to continue normally
                request.continue();
            });
            try {
                await page.goto('https://audiofingerprint.openwpm.com/', {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });
            }
            catch (navError) {
                // Try with ignore HTTPS errors
                await page.goto('https://audiofingerprint.openwpm.com/', {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000
                });
            }
            // Wait for audio analysis
            await new Promise(resolve => setTimeout(resolve, 10000));
            const result = await page.evaluate(() => {
                const fingerprintElement = document.querySelector('#audio-fingerprint, .fingerprint-result');
                const consistencyElement = document.querySelector('.consistency, .variation');
                const fingerprintValue = fingerprintElement?.textContent;
                const hasFingerprint = fingerprintValue && fingerprintValue.length > 10;
                // Check if multiple runs produce the same result (good for us)
                const isConsistent = consistencyElement?.textContent?.includes('consistent');
                return {
                    fingerprintValue,
                    hasFingerprint,
                    isConsistent,
                    protected: !hasFingerprint || isConsistent,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const passed = result.protected ?? false;
            const score = passed ? 100 : 0;
            return {
                serviceName: 'Audio Fingerprint',
                url: 'https://audiofingerprint.openwpm.com/',
                passed,
                score,
                detectionStatus: passed ? 'undetected' : 'detected',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'Audio Fingerprint',
                url: 'https://audiofingerprint.openwpm.com/',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Canvas Tampering Detection
    async testCanvasTamperingDetection() {
        if (!this.browser)
            throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        const startTime = Date.now();
        try {
            await (0, index_1.protectPage)(page);
            await page.goto('https://kkapsner.github.io/CanvasBlocker/test/detectionTest.html', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            // Wait for detection tests
            await new Promise(resolve => setTimeout(resolve, 8000));
            const result = await page.evaluate(() => {
                const testElements = document.querySelectorAll('.test, .detection-test');
                const tests = Array.from(testElements).map(test => {
                    const name = test.querySelector('.test-name, h3, h4')?.textContent;
                    const result = test.querySelector('.test-result, .result')?.textContent;
                    const passed = result?.toLowerCase().includes('not detected') ||
                        result?.toLowerCase().includes('protected') ||
                        result?.toLowerCase().includes('blocked');
                    return { name, result, passed };
                });
                // Look for overall detection status
                const detectionElement = document.querySelector('.detection-status, #detection-result');
                const overallDetected = detectionElement?.textContent?.toLowerCase().includes('detected') || false;
                const passedCount = tests.filter(t => t.passed).length;
                const score = tests.length > 0 ? (passedCount / tests.length) * 100 : (overallDetected ? 0 : 100);
                return {
                    tests,
                    passedCount,
                    totalCount: tests.length,
                    score,
                    overallDetected,
                    url: window.location.href
                };
            });
            await page.close();
            const timeToComplete = Date.now() - startTime;
            const passed = !result.overallDetected && result.score >= 80;
            return {
                serviceName: 'Canvas Tampering Detection',
                url: 'https://kkapsner.github.io/CanvasBlocker/test/detectionTest.html',
                passed,
                score: result.score,
                detectionStatus: result.overallDetected ? 'detected' : passed ? 'undetected' : 'suspicious',
                details: result,
                timeToComplete
            };
        }
        catch (error) {
            await page.close();
            return {
                serviceName: 'Canvas Tampering Detection',
                url: 'https://kkapsner.github.io/CanvasBlocker/test/detectionTest.html',
                passed: false,
                detectionStatus: 'error',
                details: { error: error instanceof Error ? error.message : String(error) },
                errors: [error instanceof Error ? error.message : String(error)],
                timeToComplete: Date.now() - startTime
            };
        }
    }
    // Run all detector tests
    async runAllTests() {
        this.logger.info('Starting comprehensive real-world detector tests...');
        const results = [];
        // Run tests sequentially to avoid overwhelming services
        const tests = [
            () => this.testSannysoft(),
            () => this.testPixelscan(),
            () => this.testFVision(),
            () => this.testCoverYourTracks(),
            () => this.testAudioFingerprint(),
            () => this.testCanvasTamperingDetection(),
            // More demanding tests last
            () => this.testCreepJS(),
            () => this.testBrotector()
        ];
        for (const test of tests) {
            try {
                this.logger.info(`Running ${test.name} test...`);
                const result = await test();
                results.push(result);
                this.logger.info(`${result.serviceName}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.detectionStatus})`);
                // Wait between tests to be respectful
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            catch (error) {
                this.logger.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        // Calculate overall metrics
        const passedTests = results.filter(r => r.passed).length;
        const totalTests = results.length;
        const overallScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / totalTests;
        // Generate recommendations
        const recommendations = this.generateRecommendations(results);
        const suite = {
            suiteName: 'Real-World Detection Services',
            results,
            overallScore: Math.round(overallScore),
            passedTests,
            totalTests,
            recommendations
        };
        this.logger.info(`Detection test suite completed: ${passedTests}/${totalTests} passed, overall score: ${suite.overallScore}%`);
        return suite;
    }
    generateRecommendations(results) {
        const recommendations = [];
        const failedTests = results.filter(r => !r.passed);
        if (failedTests.length === 0) {
            recommendations.push('Excellent! All detection tests passed. Your protection is working perfectly.');
            return recommendations;
        }
        // Analyze failures
        const detectedTests = failedTests.filter(r => r.detectionStatus === 'detected');
        const suspiciousTests = failedTests.filter(r => r.detectionStatus === 'suspicious');
        if (detectedTests.length > 0) {
            recommendations.push(`${detectedTests.length} services detected automation. Consider strengthening protection.`);
        }
        if (suspiciousTests.length > 0) {
            recommendations.push(`${suspiciousTests.length} services found suspicious patterns. Fine-tune fingerprint consistency.`);
        }
        // Service-specific recommendations
        const creepJSResult = results.find(r => r.serviceName === 'CreepJS');
        if (creepJSResult && !creepJSResult.passed) {
            recommendations.push('CreepJS detection failed - improve JavaScript engine emulation and reduce lies count');
        }
        const brotectorResult = results.find(r => r.serviceName === 'Brotector');
        if (brotectorResult && !brotectorResult.passed) {
            recommendations.push('Brotector detected automation - enhance behavioral patterns and browser signatures');
        }
        const sannysoftResult = results.find(r => r.serviceName === 'Sannysoft');
        if (sannysoftResult && !sannysoftResult.passed) {
            recommendations.push('Sannysoft bot detection - focus on WebDriver property hiding and navigator object consistency');
        }
        return recommendations;
    }
    // Export results to file
    exportResults(suite) {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            summary: {
                suiteName: suite.suiteName,
                overallScore: suite.overallScore,
                passedTests: suite.passedTests,
                totalTests: suite.totalTests,
                successRate: `${Math.round((suite.passedTests / suite.totalTests) * 100)}%`
            },
            results: suite.results.map(result => ({
                serviceName: result.serviceName,
                url: result.url,
                passed: result.passed,
                score: result.score,
                detectionStatus: result.detectionStatus,
                timeToComplete: result.timeToComplete,
                errors: result.errors
            })),
            recommendations: suite.recommendations
        };
        return JSON.stringify(report, null, 2);
    }
}
exports.RealWorldDetectorTester = RealWorldDetectorTester;
//# sourceMappingURL=real-world-detector-tests.js.map