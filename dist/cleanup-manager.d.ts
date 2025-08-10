/**
 * Global cleanup manager for interval/timeout cleanup in injected scripts
 * This prevents memory leaks from setInterval calls in browser context
 */
export declare function getCleanupManagerScript(): string;
export declare function wrapSetIntervalCalls(script: string): string;
//# sourceMappingURL=cleanup-manager.d.ts.map