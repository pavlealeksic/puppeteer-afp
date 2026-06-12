import type { Browser, Page } from 'puppeteer';
import type { AfpOptions, ProtectedBrowser, ProtectedPage } from '../types';
import { Afp } from '../core/afp';
import { decorate } from './page';
import { logger } from '../util/logger';

/**
 * Wrap a browser so every page — existing, future `newPage()`, and pages opened
 * by the site (`window.open`, pop-ups) — shares one coherent identity. Pass a
 * per-call options object to {@link ProtectedBrowser.newProtectedPage} to give a
 * specific page its own identity instead.
 */
export async function protectedBrowser(
  browser: Browser,
  options: AfpOptions = {}
): Promise<ProtectedBrowser> {
  const shared = await Afp.create(options);

  for (const page of await browser.pages()) {
    await shared
      .applyToPage(page)
      .catch(e => logger.debug('apply existing page failed:', e.message));
  }

  // Auto-protect site-opened targets (pop-ups, OAuth windows, etc.).
  browser.on('targetcreated', async target => {
    try {
      const page = await target.page();
      if (page) await shared.applyToPage(page);
    } catch (err) {
      logger.debug('targetcreated apply failed:', (err as Error).message);
    }
  });

  const pb = browser as ProtectedBrowser;
  Object.defineProperty(pb, 'fingerprint', {
    value: shared.fingerprint,
    enumerable: true,
    configurable: true,
    writable: false,
  });

  pb.newProtectedPage = async (perPage?: AfpOptions): Promise<ProtectedPage> => {
    const page: Page = await browser.newPage();
    if (perPage) {
      const afp = await Afp.create(perPage);
      await afp.applyToPage(page);
      return decorate(page, afp);
    }
    await shared.applyToPage(page);
    return decorate(page, shared);
  };

  return pb;
}
