"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
class Logger {
    constructor(enabled = false, level = 'info') {
        this.enabled = enabled;
        this.logger = winston_1.default.createLogger({
            level: level,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `[${timestamp}] ${level}: ${message} ${metaStr}`;
            })),
            transports: [
                new winston_1.default.transports.Console()
            ]
        });
    }
    debug(message, meta) {
        if (this.enabled) {
            this.logger.debug(message, meta);
        }
    }
    info(message, meta) {
        if (this.enabled) {
            this.logger.info(message, meta);
        }
    }
    warn(message, meta) {
        if (this.enabled) {
            this.logger.warn(message, meta);
        }
    }
    error(message, meta) {
        if (this.enabled) {
            this.logger.error(message, meta);
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    setLevel(level) {
        this.logger.level = level;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map