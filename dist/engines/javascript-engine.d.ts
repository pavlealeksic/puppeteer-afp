/**
 * JavaScript Engine Fingerprinting Emulation
 * Replicates V8, SpiderMonkey, and JavaScriptCore characteristics
 */
export interface JSEngineConfig {
    engine: 'v8' | 'spidermonkey' | 'javascriptcore';
    version: string;
    features: string[];
    optimizations: JSOptimizationConfig;
    gcBehavior: GCBehaviorConfig;
    errorPatterns: ErrorPatternConfig;
}
export interface JSOptimizationConfig {
    jitThreshold: number;
    inlineThreshold: number;
    optimizationTier: 'baseline' | 'optimized' | 'deoptimized';
    hotSpotDetection: boolean;
    speculativeOptimization: boolean;
}
export interface GCBehaviorConfig {
    algorithm: 'mark-sweep' | 'generational' | 'incremental';
    heapSize: number;
    gcPressure: number;
    allocationPattern: 'linear' | 'fragmented' | 'pooled';
    pauseTime: number;
}
export interface ErrorPatternConfig {
    stackTraceFormat: 'v8' | 'spidermonkey' | 'jsc';
    errorMessageStyle: 'chromium' | 'firefox' | 'safari';
    sourceMapSupport: boolean;
    asyncStackTraces: boolean;
}
export declare class JavaScriptEngineEmulator {
    private config;
    private performanceMetrics;
    private gcScheduler;
    private optimizationCounters;
    constructor(config: JSEngineConfig);
    private initializePerformanceMetrics;
    private getEngineMultipliers;
    private setupGarbageCollectionSimulation;
    private calculateGCInterval;
    private simulateGarbageCollection;
    private applyPostGCEffects;
    getInjectionScript(): string;
    private getErrorPatternScript;
    private getPerformanceAPIScript;
    private getFunctionOptimizationScript;
    private getObjectMethodScript;
    private getArrayOptimizationScript;
    private getStringImplementationScript;
    private getRegExpScript;
    private getJSONScript;
    private getPromiseScript;
    private getWeakReferenceScript;
    private getProxyScript;
    private getSymbolScript;
    private getMemoryPressureScript;
    private getJITSimulationScript;
    destroy(): void;
}
export declare const engineConfigs: Record<string, JSEngineConfig>;
//# sourceMappingURL=javascript-engine.d.ts.map