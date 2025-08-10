/**
 * Real-World Detection Service Test Suite
 * Tests our anti-fingerprinting plugin against actual detection services
 */
export interface DetectorTestResult {
    serviceName: string;
    url: string;
    passed: boolean;
    score?: number;
    detectionStatus: 'undetected' | 'suspicious' | 'detected' | 'error';
    details: any;
    errors?: string[];
    timeToComplete?: number;
}
export interface DetectorTestSuite {
    suiteName: string;
    results: DetectorTestResult[];
    overallScore: number;
    passedTests: number;
    totalTests: number;
    recommendations: string[];
}
export declare class RealWorldDetectorTester {
    private browser;
    private logger;
    constructor(enableLogging?: boolean);
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    testCreepJS(): Promise<DetectorTestResult>;
    testBrotector(): Promise<DetectorTestResult>;
    testPixelscan(): Promise<DetectorTestResult>;
    testFVision(): Promise<DetectorTestResult>;
    testCoverYourTracks(): Promise<DetectorTestResult>;
    testSannysoft(): Promise<DetectorTestResult>;
    testAudioFingerprint(): Promise<DetectorTestResult>;
    testCanvasTamperingDetection(): Promise<DetectorTestResult>;
    runAllTests(): Promise<DetectorTestSuite>;
    private generateRecommendations;
    exportResults(suite: DetectorTestSuite): string;
}
//# sourceMappingURL=real-world-detector-tests.d.ts.map