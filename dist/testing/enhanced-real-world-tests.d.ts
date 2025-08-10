/**
 * Enhanced Real-World Detection Test Suite
 * Optimized for speed with parallel execution and real-time progress reporting
 */
import { DetectorTestResult, DetectorTestSuite } from './real-world-detector-tests';
interface TestProgress {
    current: number;
    total: number;
    completed: string[];
    failed: string[];
    inProgress: string[];
}
export declare class EnhancedRealWorldTester {
    private browser;
    private logger;
    private progressCallback?;
    constructor(enableLogging?: boolean, progressCallback?: (progress: TestProgress) => void);
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    runAllTestsParallel(): Promise<DetectorTestSuite>;
    private groupByPriority;
    private updateProgress;
    testSannysoft(): Promise<DetectorTestResult>;
    testPixelscan(): Promise<DetectorTestResult>;
    testFVision(): Promise<DetectorTestResult>;
    testCoverYourTracks(): Promise<DetectorTestResult>;
    testAudioFingerprint(): Promise<DetectorTestResult>;
    testCanvasTamperingDetection(): Promise<DetectorTestResult>;
    testCreepJS(): Promise<DetectorTestResult>;
    testBrotector(): Promise<DetectorTestResult>;
    private createMockResult;
    private generateRecommendations;
    exportResults(suite: DetectorTestSuite): void;
}
export {};
//# sourceMappingURL=enhanced-real-world-tests.d.ts.map