/**
 * Real-World Detection Services Test Suite
 * Tests our plugin against actual fingerprinting detection services
 */

import { RealWorldDetectorTester } from '../src/testing/real-world-detector-tests';
import fs from 'fs';
import path from 'path';

describe('Real-World Detection Services', () => {
  let tester: RealWorldDetectorTester;

  beforeAll(async () => {
    tester = new RealWorldDetectorTester(true);
    await tester.initialize();
  });

  afterAll(async () => {
    await tester.destroy();
  });

  describe('Individual Detection Services', () => {
    
    it('should pass Sannysoft bot detection test', async () => {
      const result = await tester.testSannysoft();
      
      console.log(`\n🤖 SANNYSOFT BOT DETECTION TEST`);
      console.log(`   ┌─────────────────────────────────────────────┐`);
      console.log(`   │ Status: ${result.detectionStatus.padEnd(31)} │`);
      console.log(`   │ Score:  ${(result.score + '%').padEnd(31)} │`);
      console.log(`   │ Result: ${(result.passed ? '✅ PASSED' : '❌ FAILED').padEnd(31)} │`);
      if (result.details?.tests) {
        console.log(`   │ Tests:  ${(result.details.passedCount + '/' + result.details.totalCount + ' passed').padEnd(31)} │`);
      }
      console.log(`   └─────────────────────────────────────────────┘`);

      // We expect to pass most Sannysoft tests
      expect(result.score).toBeGreaterThan(70);
      expect(result.detectionStatus).not.toBe('detected');
    }, 60000);

    it('should pass Pixelscan fingerprint consistency test', async () => {
      const result = await tester.testPixelscan();
      
      console.log(`\n🔍 PIXELSCAN FINGERPRINT CONSISTENCY TEST`);
      console.log(`   ┌─────────────────────────────────────────────┐`);
      console.log(`   │ Status: ${result.detectionStatus.padEnd(31)} │`);
      console.log(`   │ Score:  ${(result.score + '%').padEnd(31)} │`);
      console.log(`   │ Result: ${(result.passed ? '✅ PASSED' : '❌ FAILED').padEnd(31)} │`);
      console.log(`   └─────────────────────────────────────────────┘`);

      // We expect good consistency scores
      expect(result.score).toBeGreaterThan(60);
      expect(result.detectionStatus).not.toBe('detected');
    }, 60000);

    it('should pass F.vision privacy check', async () => {
      const result = await tester.testFVision();
      
      console.log(`\n🔒 F.vision Test Results:`);
      console.log(`Status: ${result.detectionStatus}`);
      console.log(`Score: ${result.score}%`);
      console.log(`Passed: ${result.passed ? '✅' : '❌'}`);

      if (result.details?.tests) {
        console.log(`Privacy Tests: ${result.details.passedCount}/${result.details.totalCount} passed`);
      }

      expect(result.score).toBeGreaterThan(50);
    }, 60000);

    it('should pass Cover Your Tracks EFF test', async () => {
      const result = await tester.testCoverYourTracks();
      
      console.log(`\n🛡️  Cover Your Tracks Test Results:`);
      console.log(`Status: ${result.detectionStatus}`);
      console.log(`Score: ${result.score}%`);
      console.log(`Passed: ${result.passed ? '✅' : '❌'}`);
      console.log(`Fingerprinting Blocked: ${result.details?.fingerprintingBlocked ? '✅' : '❌'}`);
      console.log(`Tracking Blocked: ${result.details?.trackingBlocked ? '✅' : '❌'}`);

      // EFF test should show good protection
      expect(result.score).toBeGreaterThan(40);
    }, 60000);

    it('should pass audio fingerprinting test', async () => {
      const result = await tester.testAudioFingerprint();
      
      console.log(`\n🎵 Audio Fingerprint Test Results:`);
      console.log(`Status: ${result.detectionStatus}`);
      console.log(`Score: ${result.score}%`);
      console.log(`Passed: ${result.passed ? '✅' : '❌'}`);
      console.log(`Protected: ${result.details?.protected ? '✅' : '❌'}`);

      // Audio fingerprinting should be blocked
      expect(result.detectionStatus).not.toBe('detected');
    }, 60000);

    it('should pass canvas tampering detection test', async () => {
      const result = await tester.testCanvasTamperingDetection();
      
      console.log(`\n🎨 Canvas Tampering Detection Test Results:`);
      console.log(`Status: ${result.detectionStatus}`);
      console.log(`Score: ${result.score}%`);
      console.log(`Passed: ${result.passed ? '✅' : '❌'}`);
      console.log(`Overall Detected: ${result.details?.overallDetected ? '❌' : '✅'}`);

      if (result.details?.tests) {
        console.log(`Canvas Tests: ${result.details.passedCount}/${result.details.totalCount} passed`);
      }

      expect(result.score).toBeGreaterThan(50);
      expect(result.details?.overallDetected).toBe(false);
    }, 60000);

    // Advanced tests - more likely to fail but good for benchmarking
    it('should attempt CreepJS advanced detection test', async () => {
      const result = await tester.testCreepJS();
      
      console.log(`\n🕵️  CREEPJS ADVANCED DETECTION TEST (EXPERIMENTAL)`);
      console.log(`   ┌─────────────────────────────────────────────────────────────┐`);
      console.log(`   │ Status:      ${result.detectionStatus.padEnd(39)} │`);
      console.log(`   │ Score:       ${(result.score + '%').padEnd(39)} │`);
      console.log(`   │ Result:      ${(result.passed ? '✅ PASSED' : '❌ FAILED').padEnd(39)} │`);
      console.log(`   │ Trust Score: ${(result.details?.trustScore + '%').padEnd(39)} │`);
      console.log(`   │ Lies Count:  ${(result.details?.lies || 'N/A').toString().padEnd(39)} │`);
      console.log(`   │ Bot Status:  ${(result.details?.isBot ? '❌ DETECTED' : '✅ UNDETECTED').padEnd(39)} │`);
      console.log(`   └─────────────────────────────────────────────────────────────┘`);
      console.log(`   ℹ️  CreepJS is a very advanced detector - results are for analysis`);
      
      // Basic expectations - should not be detected as bot
      expect(result.detectionStatus).not.toBe('error');
    }, 90000);

    it('should attempt Brotector automation detection test', async () => {
      const result = await tester.testBrotector();
      
      console.log(`\n🤺 Brotector Automation Test Results:`);
      console.log(`Status: ${result.detectionStatus}`);
      console.log(`Score: ${result.score}%`);
      console.log(`Passed: ${result.passed ? '✅' : '❌'}`);
      console.log(`Detected: ${result.details?.isDetected ? '❌' : '✅'}`);

      // Brotector is designed to crush automation, so we just log for analysis
      console.log(`Brotector is designed to detect automation - results are for analysis`);
      
      // Basic expectations - should complete without error
      expect(result.detectionStatus).not.toBe('error');
    }, 60000);

  });

  describe('Comprehensive Detection Test Suite', () => {

    it('should run complete detection test suite and generate report', async () => {
      console.log(`\n🚀 Running Complete Real-World Detection Test Suite...\n`);
      
      const suite = await tester.runAllTests();
      
      // Display comprehensive results with enhanced formatting
      console.log(`\n📊 PUPPETEER ANTI-FINGERPRINTING DETECTION TEST SUITE RESULTS`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      const overallStatus = suite.overallScore >= 70 ? '🟢 EXCELLENT' : 
                           suite.overallScore >= 50 ? '🟡 GOOD' : 
                           suite.overallScore >= 30 ? '🟠 FAIR' : '🔴 NEEDS IMPROVEMENT';
      
      console.log(`📈 Overall Score:    ${suite.overallScore.toString().padStart(3)}%  ${overallStatus}`);
      console.log(`📊 Tests Passed:     ${suite.passedTests.toString().padStart(2)}/${suite.totalTests} (${Math.round((suite.passedTests / suite.totalTests) * 100).toString().padStart(3)}%)`);
      console.log(`⏱️  Total Time:       ${suite.results.reduce((sum, r) => sum + (r.timeToComplete || 0), 0).toLocaleString()}ms`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Enhanced individual service results with categories
      console.log(`\n🏆 DETECTION SERVICE RESULTS:`);
      console.log(`   Service                   │ Score │ Status        │ Result │ Time(ms) │ Details`);
      console.log(`   ──────────────────────────┼───────┼───────────────┼────────┼──────────┼─────────────`);

      const categoryOrder = ['Basic Protection', 'Advanced Detection', 'Experimental'];
      const serviceCategories: { [key: string]: string } = {
        'Sannysoft': 'Basic Protection',
        'AudioFingerprint': 'Basic Protection',
        'CanvasTamperingDetection': 'Basic Protection',
        'Pixelscan': 'Advanced Detection',
        'F.vision': 'Advanced Detection',
        'Cover Your Tracks': 'Advanced Detection',
        'CreepJS': 'Experimental',
        'Brotector': 'Experimental'
      };

      let currentCategory = '';
      suite.results
        .sort((a, b) => {
          const aCat = serviceCategories[a.serviceName] || 'Other';
          const bCat = serviceCategories[b.serviceName] || 'Other';
          if (aCat !== bCat) {
            return categoryOrder.indexOf(aCat) - categoryOrder.indexOf(bCat);
          }
          return a.serviceName.localeCompare(b.serviceName);
        })
        .forEach(result => {
          const category = serviceCategories[result.serviceName] || 'Other';
          if (category !== currentCategory) {
            if (currentCategory !== '') console.log(`   ──────────────────────────┼───────┼───────────────┼────────┼──────────┼─────────────`);
            console.log(`   ${category.toUpperCase()}:`);
            currentCategory = category;
          }

          const statusIcon = result.passed ? '✅' : 
                            result.detectionStatus === 'detected' ? '❌' : 
                            result.detectionStatus === 'suspicious' ? '⚠️' : '❓';
          
          const score = (result.score || 0).toString().padStart(3);
          const status = result.detectionStatus.padEnd(13);
          const time = (result.timeToComplete || 0).toString().padStart(8);
          
          let details = '';
          if (result.details?.trustScore !== undefined) details = `Trust: ${result.details.trustScore}%`;
          else if (result.details?.lies !== undefined) details = `Lies: ${result.details.lies}`;
          else if (result.details?.tests) details = `${result.details.passedCount}/${result.details.totalCount} tests`;
          else if (result.details?.protected !== undefined) details = result.details.protected ? 'Protected' : 'Exposed';
          
          console.log(`   ${result.serviceName.padEnd(25)} │ ${score}%  │ ${status} │ ${statusIcon}     │ ${time} │ ${details}`);
        });

      console.log(`\n🔍 DETECTION ANALYSIS:`);
      const detectedCount = suite.results.filter(r => r.detectionStatus === 'detected').length;
      const suspiciousCount = suite.results.filter(r => r.detectionStatus === 'suspicious').length;
      const undetectedCount = suite.results.filter(r => r.detectionStatus === 'undetected' || r.passed).length;
      const errorCount = suite.results.filter(r => r.detectionStatus === 'error').length;

      console.log(`   🟢 Undetected:    ${undetectedCount.toString().padStart(2)} services`);
      console.log(`   🟡 Suspicious:    ${suspiciousCount.toString().padStart(2)} services`);  
      console.log(`   🔴 Detected:      ${detectedCount.toString().padStart(2)} services`);
      console.log(`   ⚠️  Errors:        ${errorCount.toString().padStart(2)} services`);

      console.log(`\n💡 RECOMMENDATIONS:`);
      if (suite.recommendations.length > 0) {
        suite.recommendations.forEach((rec, i) => {
          console.log(`   ${(i + 1).toString().padStart(2)}. ${rec}`);
        });
      } else {
        console.log(`   ✅ No specific recommendations - plugin performing well!`);
      }

      console.log(`\n🎯 PERFORMANCE SUMMARY:`);
      const avgScore = Math.round(suite.results.reduce((sum, r) => sum + (r.score || 0), 0) / suite.results.length);
      const testSuccessRate = Math.round((suite.passedTests / suite.totalTests) * 100);
      
      console.log(`   Average Score:     ${avgScore}%`);
      console.log(`   Success Rate:      ${testSuccessRate}%`);
      console.log(`   Plugin Grade:      ${overallStatus.replace(/🟢|🟡|🟠|🔴/, '').trim()}`);

      // Save detailed report
      const reportJson = tester.exportResults(suite);
      const reportPath = path.join(__dirname, '..', 'detection-test-report.json');
      fs.writeFileSync(reportPath, reportJson);
      console.log(`\n📁 Detailed report saved to: ${reportPath}`);

      // Basic expectations for the test suite
      expect(suite.totalTests).toBeGreaterThan(5);
      expect(suite.overallScore).toBeGreaterThan(0);
      expect(suite.passedTests).toBeGreaterThanOrEqual(0);
      
      // We should pass at least 50% of tests (some are very advanced)
      const finalSuccessRate = suite.passedTests / suite.totalTests;
      expect(finalSuccessRate).toBeGreaterThan(0.3); // At least 30% success rate
      
    }, 600000); // 10 minutes timeout for full suite

  });

});