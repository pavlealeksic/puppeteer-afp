/**
 * DOM Implementation Fingerprinting Emulation
 * Replicates browser-specific DOM method behaviors and characteristics
 */
export interface DOMEngineConfig {
    engine: 'blink' | 'gecko' | 'webkit';
    version: string;
    features: DOMFeatureConfig;
    api: DOMAPIConfig;
    events: DOMEventConfig;
    mutations: DOMMutationConfig;
    traversal: DOMTraversalConfig;
}
export interface DOMFeatureConfig {
    customElements: boolean;
    shadowDOM: boolean;
    webComponents: boolean;
    intersectionObserver: boolean;
    mutationObserver: boolean;
    resizeObserver: boolean;
    performanceObserver: boolean;
    adoptedStyleSheets: boolean;
}
export interface DOMAPIConfig {
    stringifyOrder: 'alphabetical' | 'insertion' | 'random';
    attributeNormalization: 'strict' | 'lenient';
    textContentBehavior: 'standard' | 'legacy';
    nodeListType: 'live' | 'static';
    documentReadyState: 'loading' | 'interactive' | 'complete';
    baseURI: string;
}
export interface DOMEventConfig {
    bubbling: boolean;
    capturing: boolean;
    passive: boolean;
    once: boolean;
    eventTiming: number;
    customEvents: boolean;
    eventOrder: 'fifo' | 'lifo' | 'priority';
}
export interface DOMMutationConfig {
    observerTiming: number;
    batchSize: number;
    throttling: boolean;
    subtreeModification: boolean;
    characterData: boolean;
    attributes: boolean;
    childList: boolean;
}
export interface DOMTraversalConfig {
    nodeIteratorFilter: 'show_all' | 'show_element' | 'custom';
    treeWalkerFilter: 'accept' | 'reject' | 'skip';
    traversalOrder: 'document' | 'reverse';
    whitespaceHandling: 'preserve' | 'normalize' | 'ignore';
}
export declare class DOMEngineEmulator {
    private config;
    private mutationObservers;
    private eventTimings;
    private nodeCounters;
    constructor(config: DOMEngineConfig);
    private initializeEventTimings;
    private getEngineMultipliers;
    getInjectionScript(): string;
    private getDocumentScript;
    private getElementScript;
    private getNodeScript;
    private getEventScript;
    private getMutationObserverScript;
    private getTraversalScript;
    private getAttributeScript;
    private getTextContentScript;
    private getDOMManipulationScript;
    private getCustomElementsScript;
    private getShadowDOMScript;
    private getSelectionScript;
    private getRangeScript;
}
export declare const domEngineConfigs: Record<string, DOMEngineConfig>;
//# sourceMappingURL=dom-engine.d.ts.map