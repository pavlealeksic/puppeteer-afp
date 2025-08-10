/**
 * Dynamic Profile System
 * Intelligent profile switching and optimization based on detection patterns
 */
import { ProtectionOptions } from '../types';
export interface ProfileMetrics {
    detectionScore: number;
    successRate: number;
    lastUsed: number;
    usageCount: number;
    sites: string[];
}
export interface DynamicProfile extends ProtectionOptions {
    id: string;
    name: string;
    category: 'stealth' | 'balanced' | 'aggressive';
    targetSites?: string[];
    metrics: ProfileMetrics;
}
export declare class DynamicProfileSystem {
    private profiles;
    private logger;
    private detectionHistory;
    constructor(enableLogging?: boolean);
    private initializeDefaultProfiles;
    selectProfileForSite(url: string, detectionRisk?: 'low' | 'medium' | 'high'): DynamicProfile;
    private findSiteSpecificProfile;
    private isProfileSuitableForRisk;
    private calculateProfileScore;
    private updateProfileUsage;
    recordDetection(profileId: string, hostname: string, detected: boolean): void;
    private optimizeProfile;
    createCustomProfile(name: string, baseProfileId: string, customizations: Partial<ProtectionOptions>): string;
    getProfileAnalytics(): {
        [profileId: string]: ProfileMetrics & {
            detectionHistory: {
                [site: string]: number[];
            };
        };
    };
    exportProfiles(): {
        [profileId: string]: DynamicProfile;
    };
    importProfiles(profiles: {
        [profileId: string]: DynamicProfile;
    }): void;
    getRecommendation(url: string, previousDetections?: number): {
        profileId: string;
        confidence: number;
        reasoning: string;
    };
    private assessSiteRisk;
    private generateReasoning;
}
//# sourceMappingURL=dynamic-profiles.d.ts.map