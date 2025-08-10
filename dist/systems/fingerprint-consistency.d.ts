/**
 * Fingerprint Consistency System
 * Ensures all fingerprinting APIs return consistent, correlated values
 */
import { ProtectionOptions } from '../types';
export interface ConsistentFingerprint {
    hardwareConcurrency: number;
    deviceMemory: number;
    maxTouchPoints: number;
    screenWidth: number;
    screenHeight: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    devicePixelRatio: number;
    canvasFingerprint: string;
    webglVendor: string;
    webglRenderer: string;
    webglVersion: string;
    audioContext: {
        sampleRate: number;
        maxChannelCount: number;
        baseLatency: number;
    };
    availableFonts: string[];
    fontFingerprint: string;
    platform: string;
    userAgent: string;
    languages: string[];
    timezone: string;
    webrtcLocalIP: string;
    webrtcPublicIP: string;
    performanceTiming: {
        connectTime: number;
        domainLookupTime: number;
        loadEventTime: number;
    };
}
export declare class FingerprintConsistencyManager {
    private logger;
    private consistentFingerprint;
    private fingerprintSeed;
    constructor(options: ProtectionOptions, enableLogging?: boolean);
    private generateSeed;
    private seededRandom;
    private generateConsistentFingerprint;
    private selectFromArray;
    private correlateMemoryWithCores;
    private correlateTouchPoints;
    private generateCorrelatedScreenResolution;
    private generateCanvasFingerprint;
    private generateConsistentWebGL;
    private generateConsistentAudio;
    private generateConsistentFonts;
    private generateConsistentPlatform;
    private generateConsistentWebRTC;
    private generateConsistentPerformance;
    getConsistentFingerprint(): ConsistentFingerprint;
    getConsistentValue(key: keyof ConsistentFingerprint): any;
    getConsistencyInjectionScript(): string;
    destroy(): void;
}
//# sourceMappingURL=fingerprint-consistency.d.ts.map