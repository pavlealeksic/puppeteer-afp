import winston from 'winston';

export class Logger {
  private logger: winston.Logger;
  private enabled: boolean;

  constructor(enabled: boolean = false, level: string = 'info') {
    this.enabled = enabled;
    this.logger = winston.createLogger({
      level: level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `[${timestamp}] ${level}: ${message} ${metaStr}`;
        })
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  debug(message: string, meta?: any): void {
    if (this.enabled) {
      this.logger.debug(message, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.enabled) {
      this.logger.info(message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.enabled) {
      this.logger.warn(message, meta);
    }
  }

  error(message: string, meta?: any): void {
    if (this.enabled) {
      this.logger.error(message, meta);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setLevel(level: string): void {
    this.logger.level = level;
  }
}