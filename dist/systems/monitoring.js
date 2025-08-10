"use strict";
/**
 * Monitoring & Analytics System
 * Real-time protection monitoring, metrics collection, and performance analytics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringSystem = void 0;
const logger_1 = require("../logger");
class MonitoringSystem {
    constructor(enableLogging = false) {
        this.attempts = [];
        this.memoryMonitor = null;
        this.maxAttempts = 1000; // Keep last 1000 attempts
        this.logger = new logger_1.Logger(enableLogging);
        this.metrics = this.initializeMetrics();
        this.startMonitoring();
    }
    initializeMetrics() {
        return {
            fingerprintingAttempts: 0,
            blockedAttempts: 0,
            detectionRate: 0,
            performanceImpact: 0,
            memoryUsage: 0,
            successRate: 100,
            lastUpdated: Date.now()
        };
    }
    startMonitoring() {
        // Start memory monitoring
        this.memoryMonitor = setInterval(() => {
            this.updateMemoryMetrics();
        }, 30000); // Every 30 seconds
        // Start performance monitoring if available
        if (typeof performance !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    this.analyzePerformanceEntries(list.getEntries());
                });
                this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
            }
            catch (error) {
                this.logger.debug('Performance monitoring not available:', error);
            }
        }
        this.logger.info('Protection monitoring started');
    }
    recordFingerprintingAttempt(attempt) {
        const fullAttempt = {
            ...attempt,
            timestamp: Date.now()
        };
        this.attempts.push(fullAttempt);
        // Keep only recent attempts
        if (this.attempts.length > this.maxAttempts) {
            this.attempts.shift();
        }
        // Update metrics
        this.metrics.fingerprintingAttempts++;
        if (fullAttempt.blocked) {
            this.metrics.blockedAttempts++;
        }
        this.updateMetrics();
        this.logger.debug(`Fingerprinting attempt recorded: ${attempt.type} from ${attempt.url} (${attempt.blocked ? 'blocked' : 'allowed'})`);
        // Trigger alerts for high-severity attempts
        if (attempt.severity === 'high' && !attempt.blocked) {
            this.triggerAlert('High-severity fingerprinting attempt not blocked', fullAttempt);
        }
    }
    updateMetrics() {
        const now = Date.now();
        const recentAttempts = this.attempts.filter(a => now - a.timestamp < 3600000); // Last hour
        if (recentAttempts.length > 0) {
            const blockedRecent = recentAttempts.filter(a => a.blocked).length;
            this.metrics.detectionRate = ((recentAttempts.length - blockedRecent) / recentAttempts.length) * 100;
            this.metrics.successRate = (blockedRecent / recentAttempts.length) * 100;
        }
        this.metrics.lastUpdated = now;
    }
    updateMemoryMetrics() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memUsage = process.memoryUsage();
            this.metrics.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
        }
        else if (typeof performance !== 'undefined' && performance.memory) {
            const memInfo = performance.memory;
            this.metrics.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
        }
    }
    analyzePerformanceEntries(entries) {
        entries.forEach(entry => {
            if (entry.name.includes('afp') || entry.name.includes('protection')) {
                // Track protection-related performance impact
                this.metrics.performanceImpact = Math.max(this.metrics.performanceImpact, entry.duration);
            }
        });
    }
    triggerAlert(message, attempt) {
        this.logger.warn(`ALERT: ${message}`, {
            type: attempt.type,
            url: attempt.url,
            method: attempt.method,
            details: attempt.details
        });
        // In a real implementation, this could trigger notifications, emails, etc.
    }
    getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    getRecentAttempts(timeframe = 3600000) {
        const cutoff = Date.now() - timeframe;
        return this.attempts.filter(attempt => attempt.timestamp >= cutoff);
    }
    generateAnalyticsReport(timeframeDays = 1) {
        const timeframeMs = timeframeDays * 24 * 60 * 60 * 1000;
        const end = Date.now();
        const start = end - timeframeMs;
        const relevantAttempts = this.attempts.filter(a => a.timestamp >= start && a.timestamp <= end);
        const totalAttempts = relevantAttempts.length;
        const blockedAttempts = relevantAttempts.filter(a => a.blocked).length;
        // Calculate hourly distribution
        const hourlyAttempts = new Array(24).fill(0);
        relevantAttempts.forEach(attempt => {
            const hour = new Date(attempt.timestamp).getHours();
            hourlyAttempts[hour]++;
        });
        // Calculate vector distribution
        const vectorDistribution = {};
        relevantAttempts.forEach(attempt => {
            vectorDistribution[attempt.type] = (vectorDistribution[attempt.type] || 0) + 1;
        });
        // Get top vectors
        const topVectors = Object.entries(vectorDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([vector]) => vector);
        // Calculate risk level
        const blockRate = totalAttempts > 0 ? (blockedAttempts / totalAttempts) * 100 : 100;
        const riskLevel = blockRate < 70 ? 'high' :
            blockRate < 85 ? 'medium' : 'low';
        // Generate recommendations
        const recommendations = this.generateRecommendations(relevantAttempts, blockRate);
        return {
            timeframe: { start, end, duration: timeframeMs },
            summary: {
                totalAttempts,
                blockedAttempts,
                blockRate,
                topVectors,
                riskLevel
            },
            trends: {
                hourlyAttempts,
                vectorDistribution,
                successRateHistory: [blockRate] // Could be expanded for historical tracking
            },
            recommendations
        };
    }
    generateRecommendations(attempts, blockRate) {
        const recommendations = [];
        if (blockRate < 70) {
            recommendations.push('Protection effectiveness is low - consider upgrading to stealth profile');
        }
        if (blockRate < 85) {
            recommendations.push('Consider enabling additional protection features');
        }
        // Analyze top unblocked vectors
        const unblockedAttempts = attempts.filter(a => !a.blocked);
        const unblockedVectors = {};
        unblockedAttempts.forEach(attempt => {
            unblockedVectors[attempt.type] = (unblockedVectors[attempt.type] || 0) + 1;
        });
        const topUnblockedVector = Object.entries(unblockedVectors)
            .sort(([, a], [, b]) => b - a)[0];
        if (topUnblockedVector && topUnblockedVector[1] > 5) {
            recommendations.push(`High unblocked attempts for ${topUnblockedVector[0]} - review protection for this vector`);
        }
        // Performance recommendations
        if (this.metrics.performanceImpact > 100) {
            recommendations.push('High performance impact detected - consider optimizing protection settings');
        }
        if (this.metrics.memoryUsage > 100) {
            recommendations.push('High memory usage - consider cleanup or lighter protection profile');
        }
        if (recommendations.length === 0) {
            recommendations.push('Protection is performing well - no immediate actions needed');
        }
        return recommendations;
    }
    exportData() {
        return {
            metrics: this.getMetrics(),
            recentAttempts: this.getRecentAttempts(),
            systemInfo: {
                timestamp: Date.now(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
            }
        };
    }
    reset() {
        this.metrics = this.initializeMetrics();
        this.attempts = [];
        this.logger.info('Monitoring data reset');
    }
    destroy() {
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
            this.memoryMonitor = null;
        }
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        this.logger.info('Protection monitoring stopped');
    }
    // Real-time monitoring methods for injection into page
    getInjectionScript() {
        return `
      // Real-time Protection Monitoring
      window.__afpMonitoring = {
        attempts: [],
        
        recordAttempt: function(type, method, details = {}) {
          const attempt = {
            timestamp: Date.now(),
            type: type,
            url: window.location.href,
            blocked: true, // Assume blocked if we're recording it
            method: method,
            severity: this.assessSeverity(type, method),
            details: details
          };
          
          this.attempts.push(attempt);
          
          // Keep only recent attempts (client-side memory management)
          if (this.attempts.length > 100) {
            this.attempts.shift();
          }
          
          // Log for debugging
          console.debug('[AFP Monitor]', type, method, details);
        },
        
        assessSeverity: function(type, method) {
          const highSeverityTypes = ['canvas', 'webgl', 'audio', 'webrtc'];
          const highSeverityMethods = ['getImageData', 'toDataURL', 'getChannelData', 'getParameter'];
          
          if (highSeverityTypes.includes(type.toLowerCase()) || 
              highSeverityMethods.some(m => method.includes(m))) {
            return 'high';
          }
          
          return 'medium';
        },
        
        getStats: function() {
          const now = Date.now();
          const recent = this.attempts.filter(a => now - a.timestamp < 300000); // Last 5 minutes
          
          return {
            total: recent.length,
            byType: recent.reduce((acc, a) => {
              acc[a.type] = (acc[a.type] || 0) + 1;
              return acc;
            }, {}),
            avgPerMinute: recent.length / 5
          };
        }
      };
      
      // Inject monitoring into common fingerprinting APIs
      if (typeof HTMLCanvasElement !== 'undefined') {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
          window.__afpMonitoring.recordAttempt('canvas', 'toDataURL', { args: args.length });
          return originalToDataURL.apply(this, args);
        };
        
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
          if (contextType === '2d' || contextType === 'webgl' || contextType === 'experimental-webgl') {
            window.__afpMonitoring.recordAttempt('canvas', 'getContext', { contextType });
          }
          return originalGetContext.apply(this, [contextType, ...args]);
        };
      }
      
      if (typeof AudioContext !== 'undefined') {
        const OriginalAudioContext = AudioContext;
        AudioContext = function(...args) {
          window.__afpMonitoring.recordAttempt('audio', 'AudioContext', { args: args.length });
          return new OriginalAudioContext(...args);
        };
      }
    `;
    }
}
exports.MonitoringSystem = MonitoringSystem;
//# sourceMappingURL=monitoring.js.map