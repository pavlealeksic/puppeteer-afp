import type { Page } from 'puppeteer';
import type { AfpOptions, Fingerprint } from '../types';
import { generateFingerprint } from './fingerprint';
import { buildInjectionScript, resolveFeatures } from './injector';
import { geoForProxy } from '../coherence/proxy';
import { Rng } from './prng';
import { logger } from '../util/logger';

/**
 * Orchestrates a single fingerprint identity: it pairs robust CDP-level
 * emulation (user-agent + client hints at the network layer, timezone,
 * geolocation, viewport) with the in-page JS patch script. Doing both is what
 * makes the spoof coherent end-to-end — e.g. the UA HTTP header matches
 * `navigator.userAgent`, and `Intl` matches the CDP timezone.
 */
export class Afp {
  private script: string;
  private features: ReturnType<typeof resolveFeatures>;

  private constructor(
    public fingerprint: Fingerprint,
    options: AfpOptions
  ) {
    this.features = resolveFeatures(options.features);
    if (options.logLevel) logger.setLevel(options.logLevel);
    this.script = buildInjectionScript(this.fingerprint, options.features);
  }

  /**
   * Build an identity from options, resolving proxy → geo coherence first when
   * a proxy is supplied without an explicit geo.
   */
  static async create(options: AfpOptions = {}): Promise<Afp> {
    const opts: AfpOptions = { ...options };
    if (opts.proxy && !opts.geo && !opts.fingerprint) {
      try {
        opts.geo = await geoForProxy(opts.proxy);
        logger.info(`coherence: proxy resolved to ${opts.geo.countryCode} / ${opts.geo.timezone}`);
      } catch (err) {
        logger.warn('coherence: proxy geo resolution failed:', (err as Error).message);
      }
    }
    const fp = generateFingerprint(opts);
    if (fp.geo.ip && !fp.webrtc.publicIp) fp.webrtc.publicIp = fp.geo.ip;
    logger.info(`fingerprint: ${fp.device}/${fp.browser}/${fp.os} seed=${fp.seed}`);
    return new Afp(fp, options);
  }

  /** Apply every protection layer to a page. */
  async applyToPage(page: Page): Promise<void> {
    const fp = this.fingerprint;

    // Network-layer UA + Client Hints so HTTP headers match the JS surface.
    try {
      const meta = fp.navigator.brands
        ? {
            brands: fp.navigator.brands,
            fullVersion: fp.navigator.uaFullVersion,
            platform: fp.navigator.uaPlatform || '',
            platformVersion: fp.os === 'windows' ? '15.0.0' : fp.os === 'macos' ? '14.6.1' : '',
            architecture: fp.device === 'mobile' ? '' : 'x86',
            model: '',
            mobile: !!fp.navigator.uaMobile,
          }
        : undefined;
      // puppeteer accepts an optional metadata arg on Chromium.
      await (page.setUserAgent as (ua: string, meta?: unknown) => Promise<void>)(
        fp.navigator.userAgent,
        meta
      );
    } catch (err) {
      logger.debug('setUserAgent failed:', (err as Error).message);
    }

    try {
      await page.setViewport({
        width: fp.screen.innerWidth,
        height: fp.screen.innerHeight,
        deviceScaleFactor: fp.screen.devicePixelRatio,
        isMobile: fp.device === 'mobile',
        hasTouch: fp.hardware.maxTouchPoints > 0,
      });
    } catch (err) {
      logger.debug('setViewport failed:', (err as Error).message);
    }

    if (this.features.timezone) {
      try {
        await page.emulateTimezone(fp.geo.timezone);
      } catch (err) {
        logger.debug('emulateTimezone failed:', (err as Error).message);
      }
    }

    if (this.features.languages) {
      try {
        await page.setExtraHTTPHeaders({ 'Accept-Language': fp.geo.languages.join(',') });
      } catch (err) {
        logger.debug('setExtraHTTPHeaders failed:', (err as Error).message);
      }
    }

    if (fp.geo.latitude != null && fp.geo.longitude != null) {
      try {
        await page.setGeolocation({
          latitude: fp.geo.latitude,
          longitude: fp.geo.longitude,
          accuracy: fp.geo.accuracy || 100,
        });
      } catch (err) {
        logger.debug('setGeolocation failed:', (err as Error).message);
      }
    }

    // The in-page patch, applied before any page script runs.
    try {
      await page.evaluateOnNewDocument(this.script);
    } catch (err) {
      logger.warn('evaluateOnNewDocument failed:', (err as Error).message);
    }
  }

  /**
   * Re-randomise volatile noise (canvas/audio/webgl) without changing the stable
   * identity, and re-inject. Takes effect on the next navigation.
   */
  async rotateFingerprint(page: Page): Promise<void> {
    const rng = new Rng(`${this.fingerprint.seed}:${Date.now()}`);
    this.fingerprint.canvasNoise = rng.float(0.4, 1);
    this.fingerprint.audioNoise = rng.float(0.0001, 0.0008);
    this.fingerprint.webglNoise = rng.float(0.4, 1);
    this.script = buildInjectionScript(this.fingerprint, { ...this.features });
    try {
      await page.evaluateOnNewDocument(this.script);
    } catch (err) {
      logger.warn('rotateFingerprint re-inject failed:', (err as Error).message);
    }
  }
}
