/**
 * puppeteer-afp — coherent, persistable anti-fingerprinting for Puppeteer.
 *
 * Core idea: a single `seed` deterministically produces one internally-coherent
 * {@link Fingerprint}. Persist the seed (or the whole fingerprint via the
 * {@link FingerprintVault}) to reproduce the exact same browser identity in a
 * later session. The coherence engine derives timezone/locale/WebRTC-IP from a
 * proxy's egress IP so nothing contradicts.
 *
 * @example Basic
 * ```ts
 * import puppeteer from 'puppeteer';
 * import { protectPage } from 'puppeteer-afp';
 *
 * const browser = await puppeteer.launch();
 * const page = await browser.newPage();
 * await protectPage(page, { profile: 'desktop-chrome-win' });
 * await page.goto('https://abrahamjuliot.github.io/creepjs/');
 * ```
 *
 * @example Persistent identity + proxy coherence
 * ```ts
 * import { protectPage, FingerprintVault, generateFingerprint } from 'puppeteer-afp';
 *
 * const vault = new FingerprintVault();
 * const fingerprint = vault.loadOrCreate('account-42', () =>
 *   generateFingerprint({ seed: 'account-42', profile: 'desktop-chrome-mac' }),
 * );
 * await protectPage(page, { fingerprint, proxy: 'http://user:pass@host:8080' });
 * ```
 */

// Public API
export { protectPage, decorate } from './integration/page';
export { protectedBrowser } from './integration/browser';
export { Afp } from './core/afp';

// Fingerprint generation + injection
export { generateFingerprint, FINGERPRINT_VERSION } from './core/fingerprint';
export { buildInjectionScript } from './core/injector';
export { Rng, randomSeed, hashSeed } from './core/prng';

// Persistence
export { FingerprintVault } from './vault/vault';

// Coherence
export { geoFromCountry, resolveGeoFromIp } from './coherence/geo';
export { geoForProxy, egressIpThroughProxy, parseProxy } from './coherence/proxy';

// Profiles
export { DEVICE_PROFILES, findProfile, listProfiles } from './profiles/devices';
export type { DeviceProfile } from './profiles/devices';

// Logging
export { logger, Logger } from './util/logger';

// Types
export type {
  AfpOptions,
  Fingerprint,
  FeatureFlags,
  GeoProfile,
  ScreenSpec,
  HardwareSpec,
  GpuSpec,
  NavigatorSpec,
  BatterySpec,
  ConnectionSpec,
  WebRtcSpec,
  WebRtcPolicy,
  PluginSpec,
  MimeTypeSpec,
  VaultOptions,
  ProtectedPage,
  ProtectedBrowser,
  DeviceCategory,
  BrowserName,
  OSName,
  LogLevel,
} from './types';
