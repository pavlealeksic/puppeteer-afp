export declare class Logger {
    private logger;
    private enabled;
    constructor(enabled?: boolean, level?: string);
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
    setEnabled(enabled: boolean): void;
    setLevel(level: string): void;
}
//# sourceMappingURL=logger.d.ts.map