/**
 * Dynamic Profile System
 * Intelligent profile switching and optimization based on detection patterns
 */

import { ProtectionOptions } from '../types';
import { Logger } from '../logger';

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

export class DynamicProfileSystem {
  private profiles: Map<string, DynamicProfile> = new Map();
  private logger: Logger;
  private detectionHistory: Map<string, number[]> = new Map();
  
  constructor(enableLogging: boolean = false) {
    this.logger = new Logger(enableLogging);
    this.initializeDefaultProfiles();
  }

  private initializeDefaultProfiles(): void {
    // Stealth Profile - Maximum protection
    this.profiles.set('stealth', {
      id: 'stealth',
      name: 'Maximum Stealth',
      category: 'stealth',
      canvasRgba: [1, 1, 1, 1],
      webRTCProtect: true,
      features: {
        canvas: true,
        webgl: true,
        audio: true,
        font: true,
        screen: true,
        timezone: true,
        language: true,
        hardware: true,
        // webdriver: true,
        webrtc: true,
        battery: true,
        connection: true
      },
      engineEmulation: {
        javascript: true,
        css: true,
        dom: true,
        hardware: true,
        network: true
      },
      enableLogging: false,
      metrics: {
        detectionScore: 0,
        successRate: 100,
        lastUsed: 0,
        usageCount: 0,
        sites: []
      }
    });

    // Balanced Profile - Good protection with performance
    this.profiles.set('balanced', {
      id: 'balanced',
      name: 'Balanced Protection',
      category: 'balanced',
      canvasRgba: [0.5, 0.5, 0.5, 0.5],
      features: {
        canvas: true,
        webgl: true,
        audio: true,
        font: true,
        screen: true,
        // webdriver: true,
        hardware: true
      },
      engineEmulation: {
        javascript: true,
        css: true,
        dom: false,
        hardware: false,
        network: false
      },
      metrics: {
        detectionScore: 0,
        successRate: 85,
        lastUsed: 0,
        usageCount: 0,
        sites: []
      }
    });

    // Performance Profile - Minimal protection impact
    this.profiles.set('performance', {
      id: 'performance',
      name: 'High Performance',
      category: 'aggressive',
      features: {
        canvas: true,
        // webdriver: true,
        hardware: true
      },
      engineEmulation: {
        javascript: false,
        css: false,
        dom: false,
        hardware: false,
        network: false
      },
      metrics: {
        detectionScore: 0,
        successRate: 60,
        lastUsed: 0,
        usageCount: 0,
        sites: []
      }
    });

    this.logger.info('Dynamic profiles initialized');
  }

  selectProfileForSite(url: string, detectionRisk: 'low' | 'medium' | 'high' = 'medium'): DynamicProfile {
    const hostname = new URL(url).hostname;
    
    // Check for site-specific profiles
    const siteSpecificProfile = this.findSiteSpecificProfile(hostname);
    if (siteSpecificProfile) {
      this.updateProfileUsage(siteSpecificProfile.id, hostname);
      return siteSpecificProfile;
    }

    // Select based on detection risk and success rates
    const candidates = Array.from(this.profiles.values())
      .filter(profile => this.isProfileSuitableForRisk(profile, detectionRisk))
      .sort((a, b) => this.calculateProfileScore(b, hostname) - this.calculateProfileScore(a, hostname));

    const selectedProfile = candidates[0] || this.profiles.get('balanced')!;
    this.updateProfileUsage(selectedProfile.id, hostname);
    
    this.logger.debug(`Selected profile '${selectedProfile.name}' for ${hostname} (risk: ${detectionRisk})`);
    
    return selectedProfile;
  }

  private findSiteSpecificProfile(hostname: string): DynamicProfile | null {
    for (const profile of this.profiles.values()) {
      if (profile.targetSites && profile.targetSites.some(site => hostname.includes(site))) {
        return profile;
      }
    }
    return null;
  }

  private isProfileSuitableForRisk(profile: DynamicProfile, risk: 'low' | 'medium' | 'high'): boolean {
    switch (risk) {
      case 'low':
        return true; // Any profile works for low risk
      case 'medium':
        return profile.category !== 'aggressive' || profile.metrics.successRate > 70;
      case 'high':
        return profile.category === 'stealth' && profile.metrics.successRate > 80;
      default:
        return true;
    }
  }

  private calculateProfileScore(profile: DynamicProfile, hostname: string): number {
    let score = profile.metrics.successRate;
    
    // Bonus for site-specific experience
    if (profile.metrics.sites.includes(hostname)) {
      score += 20;
    }
    
    // Penalty for high detection scores
    score -= profile.metrics.detectionScore * 2;
    
    // Bonus for recent usage (indicates working well)
    const daysSinceLastUse = (Date.now() - profile.metrics.lastUsed) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUse < 7) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private updateProfileUsage(profileId: string, hostname: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    profile.metrics.lastUsed = Date.now();
    profile.metrics.usageCount++;
    
    if (!profile.metrics.sites.includes(hostname)) {
      profile.metrics.sites.push(hostname);
    }
  }

  recordDetection(profileId: string, hostname: string, detected: boolean): void {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    // Update detection history
    const historyKey = `${profileId}:${hostname}`;
    const history = this.detectionHistory.get(historyKey) || [];
    history.push(detected ? 1 : 0);
    
    // Keep only last 10 attempts
    if (history.length > 10) {
      history.shift();
    }
    
    this.detectionHistory.set(historyKey, history);

    // Update profile metrics
    const detectionRate = history.reduce((sum, val) => sum + val, 0) / history.length;
    profile.metrics.detectionScore = detectionRate * 100;
    profile.metrics.successRate = Math.max(0, 100 - profile.metrics.detectionScore);

    this.logger.info(`Updated profile '${profile.name}' metrics - Detection: ${profile.metrics.detectionScore.toFixed(1)}%, Success: ${profile.metrics.successRate.toFixed(1)}%`);

    // Auto-optimize profile if detection rate is too high
    if (detectionRate > 0.3) {
      this.optimizeProfile(profileId);
    }
  }

  private optimizeProfile(profileId: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) return;

    this.logger.info(`Auto-optimizing profile '${profile.name}' due to high detection rate`);

    // Increase protection strength
    if (profile.category === 'aggressive') {
      profile.category = 'balanced';
      if (profile.engineEmulation) {
        profile.engineEmulation.javascript = true;
        profile.engineEmulation.css = true;
      }
    } else if (profile.category === 'balanced') {
      profile.category = 'stealth';
      if (profile.engineEmulation) {
        profile.engineEmulation.dom = true;
        profile.engineEmulation.hardware = true;
        profile.engineEmulation.network = true;
      }
      profile.webRTCProtect = true;
    }

    // Reset metrics after optimization
    profile.metrics.detectionScore *= 0.5; // Give it another chance
    profile.metrics.successRate = Math.min(100, profile.metrics.successRate + 10);
  }

  createCustomProfile(name: string, baseProfileId: string, customizations: Partial<ProtectionOptions>): string {
    const baseProfile = this.profiles.get(baseProfileId);
    if (!baseProfile) {
      throw new Error(`Base profile '${baseProfileId}' not found`);
    }

    const customProfileId = `custom_${Date.now()}`;
    const customProfile: DynamicProfile = {
      ...baseProfile,
      ...customizations,
      id: customProfileId,
      name: name,
      metrics: {
        detectionScore: 0,
        successRate: 75,
        lastUsed: 0,
        usageCount: 0,
        sites: []
      }
    };

    this.profiles.set(customProfileId, customProfile);
    this.logger.info(`Created custom profile '${name}' based on '${baseProfile.name}'`);
    
    return customProfileId;
  }

  getProfileAnalytics(): { [profileId: string]: ProfileMetrics & { detectionHistory: { [site: string]: number[] } } } {
    const analytics: any = {};
    
    this.profiles.forEach((profile, id) => {
      const siteHistories: { [site: string]: number[] } = {};
      
      // Collect detection history for each site
      profile.metrics.sites.forEach(site => {
        const historyKey = `${id}:${site}`;
        siteHistories[site] = this.detectionHistory.get(historyKey) || [];
      });

      analytics[id] = {
        ...profile.metrics,
        detectionHistory: siteHistories
      };
    });

    return analytics;
  }

  exportProfiles(): { [profileId: string]: DynamicProfile } {
    const exported: { [profileId: string]: DynamicProfile } = {};
    this.profiles.forEach((profile, id) => {
      exported[id] = { ...profile };
    });
    return exported;
  }

  importProfiles(profiles: { [profileId: string]: DynamicProfile }): void {
    Object.entries(profiles).forEach(([id, profile]) => {
      this.profiles.set(id, profile);
    });
    this.logger.info(`Imported ${Object.keys(profiles).length} profiles`);
  }

  getRecommendation(url: string, previousDetections: number = 0): {
    profileId: string;
    confidence: number;
    reasoning: string;
  } {
    const hostname = new URL(url).hostname;
    const riskLevel = this.assessSiteRisk(hostname, previousDetections);
    const candidates = Array.from(this.profiles.values())
      .filter(p => this.isProfileSuitableForRisk(p, riskLevel))
      .map(p => ({
        profile: p,
        score: this.calculateProfileScore(p, hostname)
      }))
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const confidence = Math.min(100, best.score + (candidates.length > 1 ? Math.max(0, best.score - candidates[1].score) : 20));

    return {
      profileId: best.profile.id,
      confidence,
      reasoning: this.generateReasoning(best.profile, riskLevel, hostname)
    };
  }

  private assessSiteRisk(hostname: string, previousDetections: number): 'low' | 'medium' | 'high' {
    // High-risk sites (known for advanced fingerprinting)
    const highRiskPatterns = [
      'fingerprint', 'tracking', 'analytics', 'creep', 'detect',
      'bot', 'automation', 'test', 'cloudflare', 'captcha'
    ];
    
    const isHighRiskSite = highRiskPatterns.some(pattern => hostname.includes(pattern));
    
    if (isHighRiskSite || previousDetections > 2) {
      return 'high';
    } else if (previousDetections > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateReasoning(profile: DynamicProfile, risk: string, hostname: string): string {
    let reasoning = `Selected '${profile.name}' for ${risk} risk scenario`;
    
    if (profile.metrics.sites.includes(hostname)) {
      reasoning += ', has experience with this site';
    }
    
    if (profile.metrics.successRate > 90) {
      reasoning += ', excellent success rate';
    } else if (profile.metrics.successRate < 60) {
      reasoning += ', low success rate but may be optimized';
    }
    
    return reasoning;
  }
}