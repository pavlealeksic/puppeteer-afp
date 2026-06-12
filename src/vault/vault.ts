import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { Fingerprint, VaultOptions } from '../types';
import { FINGERPRINT_VERSION } from '../core/fingerprint';
import { logger } from '../util/logger';

/**
 * Persistent fingerprint store. Because a {@link Fingerprint} is fully
 * serialisable and re-applied verbatim, saving one and reloading it in a later
 * session reproduces the exact same browser identity — the key capability that
 * the previous version lacked. Files are plain JSON named `<id>.json`.
 */
export class FingerprintVault {
  readonly dir: string;

  constructor(options: VaultOptions = {}) {
    this.dir = options.dir || path.join(os.homedir(), '.puppeteer-afp');
  }

  private file(id: string): string {
    const safe = id.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(this.dir, `${safe}.json`);
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  /** Persist a fingerprint under `id`. */
  save(id: string, fingerprint: Fingerprint): void {
    this.ensureDir();
    fs.writeFileSync(this.file(id), JSON.stringify(fingerprint, null, 2), 'utf8');
    logger.debug(`vault: saved '${id}' -> ${this.file(id)}`);
  }

  /** Load a fingerprint, or `null` if absent / unreadable. */
  load(id: string): Fingerprint | null {
    const f = this.file(id);
    if (!fs.existsSync(f)) return null;
    try {
      const fp = JSON.parse(fs.readFileSync(f, 'utf8')) as Fingerprint;
      if (fp.version !== FINGERPRINT_VERSION) {
        logger.warn(
          `vault: '${id}' is version ${fp.version}, current is ${FINGERPRINT_VERSION}; using as-is`
        );
      }
      return fp;
    } catch (err) {
      logger.warn(`vault: failed to read '${id}':`, (err as Error).message);
      return null;
    }
  }

  has(id: string): boolean {
    return fs.existsSync(this.file(id));
  }

  /** Load `id` if present, otherwise generate via `factory`, persist, and return. */
  loadOrCreate(id: string, factory: () => Fingerprint): Fingerprint {
    const existing = this.load(id);
    if (existing) return existing;
    const created = factory();
    this.save(id, created);
    return created;
  }

  delete(id: string): void {
    const f = this.file(id);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  /** List stored fingerprint ids. */
  list(): string[] {
    if (!fs.existsSync(this.dir)) return [];
    return fs
      .readdirSync(this.dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.slice(0, -'.json'.length));
  }
}
