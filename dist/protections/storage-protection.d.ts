/**
 * Storage Quota Fingerprinting Protection
 * Provides comprehensive protection against storage-based fingerprinting techniques
 */
export declare class StorageProtection {
    private static readonly normalizedQuotas;
    static getLocalStorageProtection(): string;
    static getIndexedDBProtection(): string;
    static getStorageEstimateProtection(): string;
    static getCacheStorageProtection(): string;
    static getWebSQLProtection(): string;
    static getAllStorageProtections(): string;
}
//# sourceMappingURL=storage-protection.d.ts.map