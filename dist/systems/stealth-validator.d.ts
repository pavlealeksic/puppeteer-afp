/**
 * Stealth Validation System
 * Automated detection of when protection fails and self-healing mechanisms
 */
import { Page } from 'puppeteer';
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
export declare class StealthValidator {
    private logger;
    constructor(enableLogging?: boolean);
    validateStealth(page: Page, options?: ProtectionOptions): Promise<StealthReport>;
    private validateWebDriverDetection;
    private validateCanvasProtection;
    private validateWebGLProtection;
    private validateAudioProtection;
    private validateNavigatorProperties;
    private validateTimingConsistency;
    private validatePermissionHandling;
    private validateErrorPatterns;
    private validateBehavioralConsistency;
    private validateAdvancedDetection;
    private generateReport;
    selfHeal(page: Page, report: StealthReport): Promise<boolean>;
    private attemptHealIssue;
}
//# sourceMappingURL=stealth-validator.d.ts.map