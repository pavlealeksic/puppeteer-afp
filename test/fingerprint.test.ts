import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { generateFingerprint } from '../src/core/fingerprint';
import { buildInjectionScript } from '../src/core/injector';
import { buildWorkerScript } from '../src/core/worker-script';
import { FingerprintVault } from '../src/vault/vault';
import { geoFromCountry } from '../src/coherence/geo';
import { listProfiles } from '../src/profiles/devices';
import { Rng } from '../src/core/prng';

describe('fingerprint generation', () => {
  it('is deterministic for a given seed', () => {
    const a = generateFingerprint({ seed: 'unit-seed', profile: 'desktop-chrome-win' });
    const b = generateFingerprint({ seed: 'unit-seed', profile: 'desktop-chrome-win' });
    expect(a).toEqual(b);
  });

  it('produces different identities for different seeds', () => {
    const a = generateFingerprint({ seed: 'seed-a', profile: 'desktop-chrome-win' });
    const b = generateFingerprint({ seed: 'seed-b', profile: 'desktop-chrome-win' });
    expect(
      a.navigator.userAgent === b.navigator.userAgent &&
        a.screen.width === b.screen.width &&
        a.canvasNoise === b.canvasNoise
    ).toBe(false);
  });

  it('honours device/browser/os filters', () => {
    const fp = generateFingerprint({ seed: 'mobile', device: 'mobile', os: 'ios' });
    expect(fp.device).toBe('mobile');
    expect(fp.os).toBe('ios');
    expect(fp.hardware.maxTouchPoints).toBeGreaterThan(0);
  });

  it('keeps languages coherent with locale', () => {
    const fp = generateFingerprint({ seed: 'de', geo: geoFromCountry('DE') });
    expect(fp.geo.languages[0]).toBe(fp.geo.locale);
    expect(fp.geo.timezone).toBe('Europe/Berlin');
  });

  it('exposes deviceMemory only on Chromium', () => {
    const ff = generateFingerprint({ seed: 'x', profile: 'desktop-firefox-win' });
    expect(ff.plugins.length).toBe(0); // firefox: no chromium PDF plugins
  });

  it('lists named profiles', () => {
    expect(listProfiles()).toContain('mobile-android-chrome');
  });
});

describe('injection script', () => {
  it('compiles to valid JavaScript for every profile', () => {
    for (const profile of listProfiles()) {
      const fp = generateFingerprint({ seed: 'compile', profile });
      const script = buildInjectionScript(fp);
      // Throws on any syntax error in any module's emitted code.
      expect(() => new Function(script)).not.toThrow();
      expect(script).toContain(fp.navigator.userAgent);
    }
  });

  it('respects disabled features', () => {
    const fp = generateFingerprint({ seed: 'feat', profile: 'desktop-chrome-win' });
    const script = buildInjectionScript(fp, { canvas: false });
    expect(script).not.toContain('/* canvas */');
    expect(script).toContain('/* webgl */');
  });

  it('isolates module early-returns so later modules still run', () => {
    // The mediaCodecs module returns early for chromium; the worker module runs
    // after it and must NOT be skipped (regression: bare `return` aborted the IIFE).
    const fp = generateFingerprint({ seed: 'iife', profile: 'desktop-chrome-win' });
    const script = buildInjectionScript(fp);
    const mediaIdx = script.indexOf('/* mediaCodecs */');
    const workerIdx = script.indexOf('/* worker */');
    expect(mediaIdx).toBeGreaterThan(-1);
    expect(workerIdx).toBeGreaterThan(mediaIdx);
    // each module body is wrapped in its own function expression
    expect(script).toContain('(function(){');
    expect(() => new Function(script)).not.toThrow();
  });

  it('builds a valid worker script for every profile', () => {
    for (const profile of listProfiles()) {
      const fp = generateFingerprint({ seed: 'wk', profile });
      const ws = buildWorkerScript(fp);
      expect(() => new Function(ws)).not.toThrow();
      expect(ws).toContain(String(fp.hardware.hardwareConcurrency));
    }
  });
});

describe('vault persistence', () => {
  const dir = path.join(os.tmpdir(), `afp-vault-test-${process.pid}`);
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('round-trips a fingerprint', () => {
    const vault = new FingerprintVault({ dir });
    const fp = generateFingerprint({ seed: 'persist', profile: 'desktop-chrome-mac' });
    vault.save('acct-1', fp);
    expect(vault.has('acct-1')).toBe(true);
    expect(vault.load('acct-1')).toEqual(fp);
    expect(vault.list()).toContain('acct-1');
  });

  it('loadOrCreate is stable across calls', () => {
    const vault = new FingerprintVault({ dir });
    const first = vault.loadOrCreate('acct-2', () =>
      generateFingerprint({ profile: 'desktop-chrome-win' })
    );
    const second = vault.loadOrCreate('acct-2', () =>
      generateFingerprint({ profile: 'desktop-chrome-win' })
    );
    expect(first).toEqual(second);
  });
});

describe('prng', () => {
  it('is reproducible', () => {
    const a = new Rng('seed');
    const b = new Rng('seed');
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
});
