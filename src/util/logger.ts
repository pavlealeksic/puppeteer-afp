import type { LogLevel } from '../types';

const ORDER: Record<LogLevel, number> = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

/** Minimal zero-dependency leveled logger. */
export class Logger {
  constructor(private level: LogLevel = 'warn') {}

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private should(level: LogLevel): boolean {
    return ORDER[level] <= ORDER[this.level];
  }

  private emit(level: LogLevel, args: unknown[]): void {
    if (!this.should(level)) return;
    const tag = `[puppeteer-afp:${level}]`;
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(tag, ...args);
  }

  error(...args: unknown[]): void {
    this.emit('error', args);
  }
  warn(...args: unknown[]): void {
    this.emit('warn', args);
  }
  info(...args: unknown[]): void {
    this.emit('info', args);
  }
  debug(...args: unknown[]): void {
    this.emit('debug', args);
  }
}

export const logger = new Logger();
