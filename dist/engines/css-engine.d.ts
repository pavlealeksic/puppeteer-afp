/**
 * CSS Engine Fingerprinting Emulation
 * Replicates Blink, Gecko, and WebKit CSS rendering differences
 */
export interface CSSEngineConfig {
    engine: 'blink' | 'gecko' | 'webkit';
    version: string;
    features: string[];
    rendering: CSSRenderingConfig;
    layout: LayoutEngineConfig;
    parsing: CSSParsingConfig;
    computedStyles: ComputedStyleConfig;
}
export interface CSSRenderingConfig {
    antialiasing: 'subpixel' | 'grayscale' | 'none';
    fontSmoothing: 'auto' | 'never' | 'always';
    textRendering: 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision';
    colorProfile: 'srgb' | 'display-p3' | 'rec2020';
    pixelRatio: number;
    layoutFlushBehavior: 'sync' | 'async' | 'batched';
}
export interface LayoutEngineConfig {
    boxModel: 'standard' | 'quirks';
    flexboxVersion: 'old' | 'new' | 'hybrid';
    gridSupport: 'full' | 'partial' | 'none';
    scrollBehavior: 'auto' | 'smooth';
    zIndexStacking: 'standard' | 'webkit-transforms';
    containment: 'strict' | 'layout' | 'style' | 'paint';
}
export interface CSSParsingConfig {
    vendorPrefixes: string[];
    customProperties: boolean;
    atRuleSupport: string[];
    selectorParsing: 'strict' | 'quirks';
    errorRecovery: 'aggressive' | 'conservative';
    unicodeSupport: 'full' | 'basic';
}
export interface ComputedStyleConfig {
    inheritanceRules: Record<string, boolean>;
    defaultValues: Record<string, string>;
    computationOrder: string[];
    caching: 'aggressive' | 'conservative' | 'none';
    precision: number;
}
export declare class CSSEngineEmulator {
    private config;
    private styleCache;
    private computedStyleTimings;
    private layoutTimings;
    constructor(config: CSSEngineConfig);
    private initializeStyleTimings;
    private getEngineMultipliers;
    getInjectionScript(): string;
    private getComputedStyleScript;
    private getStyleSheetScript;
    private getCSSRuleScript;
    private getAnimationScript;
    private getLayoutScript;
    private getFontLoadingScript;
    private getMediaQueryScript;
    private getCustomPropertiesScript;
    private getSelectorAPIScript;
    private getPaintingAPIScript;
    private getTransformFilterScript;
    private getViewportScript;
}
export declare const cssEngineConfigs: Record<string, CSSEngineConfig>;
//# sourceMappingURL=css-engine.d.ts.map