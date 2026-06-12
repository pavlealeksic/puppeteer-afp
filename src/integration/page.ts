import type { Page } from 'puppeteer';
import type { AfpOptions, ProtectedPage } from '../types';
import { Afp } from '../core/afp';

/**
 * Apply a coherent anti-fingerprint identity to a single Puppeteer page.
 *
 * @example
 * const page = await browser.newPage();
 * await protectPage(page, { seed: 'my-stable-seed', profile: 'desktop-chrome-win' });
 */
export async function protectPage(page: Page, options: AfpOptions = {}): Promise<ProtectedPage> {
  const afp = await Afp.create(options);
  await afp.applyToPage(page);
  return decorate(page, afp);
}

/** Attach the read-only fingerprint + rotate helper to a page. */
export function decorate(page: Page, afp: Afp): ProtectedPage {
  const p = page as ProtectedPage;
  Object.defineProperty(p, 'fingerprint', {
    value: afp.fingerprint,
    enumerable: true,
    configurable: true,
    writable: false,
  });
  p.rotateFingerprint = () => afp.rotateFingerprint(page);
  return p;
}
