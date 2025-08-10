/**
 * Real-World Fingerprinting Test Suite
 * Tests the plugin against actual fingerprinting services and techniques
 */
export interface FingerprintTestResult {
    testName: string;
    passed: boolean;
    score?: number;
    details: any;
    errors?: string[];
}
export declare class RealWorldTester {
    private browser;
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    testCreepJS(): Promise<FingerprintTestResult>;
    testFingerprintJS(): Promise<FingerprintTestResult>;
    testCanvasFingerprinting(): Promise<FingerprintTestResult>;
    testWebGLFingerprinting(): Promise<FingerprintTestResult>;
    testAudioFingerprinting(): Promise<FingerprintTestResult>;
    runAllTests(): Promise<FingerprintTestResult[]>;
    static generateReport(results: FingerprintTestResult[]): string;
}
//# sourceMappingURL=real-world-tests.d.ts.map