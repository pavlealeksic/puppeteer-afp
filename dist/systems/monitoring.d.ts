/**
 * Monitoring & Analytics System
 * Real-time protection monitoring, metrics collection, and performance analytics
 */
export interface ProtectionMetrics {
    fingerprintingAttempts: number;
    blockedAttempts: number;
    detectionRate: number;
    performanceImpact: number;
    memoryUsage: number;
    successRate: number;
    lastUpdated: number;
}
export interface FingerprintingAttempt {
    timestamp: number;
    type: string;
    url: string;
    blocked: boolean;
    method: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
}
export interface AnalyticsReport {
    timeframe: {
        start: number;
        end: number;
        duration: number;
    };
    summary: {
        totalAttempts: number;
        blockedAttempts: number;
        blockRate: number;
        topVectors: string[];
        riskLevel: 'low' | 'medium' | 'high';
    };
    trends: {
        hourlyAttempts: number[];
        vectorDistribution: {
            [key: string]: number;
        };
        successRateHistory: number[];
    };
    recommendations: string[];
}
export declare class MonitoringSystem {
    private logger;
    private metrics;
    private attempts;
    private performanceObserver;
    private memoryMonitor;
    private readonly maxAttempts;
    constructor(enableLogging?: boolean);
    private initializeMetrics;
    private startMonitoring;
    recordFingerprintingAttempt(attempt: Omit<FingerprintingAttempt, 'timestamp'>): void;
    private updateMetrics;
    private updateMemoryMetrics;
    private analyzePerformanceEntries;
    private triggerAlert;
    getMetrics(): ProtectionMetrics;
    getRecentAttempts(timeframe?: number): FingerprintingAttempt[];
    generateAnalyticsReport(timeframeDays?: number): AnalyticsReport;
    private generateRecommendations;
    exportData(): {
        metrics: ProtectionMetrics;
        recentAttempts: FingerprintingAttempt[];
        systemInfo: any;
    };
    reset(): void;
    destroy(): void;
    getInjectionScript(): string;
}
//# sourceMappingURL=monitoring.d.ts.map