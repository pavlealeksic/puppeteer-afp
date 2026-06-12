import type { Fingerprint, FeatureFlags } from '../types';

/** Everything a module needs to emit its in-page patch. */
export interface BuildContext {
  fp: Fingerprint;
  features: Required<FeatureFlags>;
}

/**
 * A protection module. Each module owns exactly one fingerprint surface and
 * returns the JavaScript that patches it. The returned code runs inside the
 * shared injection IIFE where two identifiers are already in scope:
 *
 *  - `afp`  — the native-stealth toolkit ({@link ../runtime/bootstrap}).
 *  - `FP`   — the serialised {@link Fingerprint} for this page.
 *
 * Modules MUST patch through `afp.define` / `afp.method` so every override is
 * `toString`-safe. Never touch `Object.keys`, `hasOwnProperty`, or reassign
 * `navigator`/`window` — those are themselves detection vectors.
 */
export interface ProtectionModule {
  /** Stable identifier, also used to gate via {@link FeatureFlags}. */
  readonly name: keyof FeatureFlags;
  /** Whether this module should run for the given context. */
  enabled(ctx: BuildContext): boolean;
  /** Emit the patch source. Return `''` to no-op. */
  build(ctx: BuildContext): string;
}

/** Helper for the common "enabled iff the feature flag is on" case. */
export function flagged(name: keyof FeatureFlags): (ctx: BuildContext) => boolean {
  return (ctx: BuildContext) => ctx.features[name] !== false;
}

/** Every feature flag, in module-execution-relevant order. */
export const FEATURE_KEYS: (keyof FeatureFlags)[] = [
  'navigator',
  'webdriver',
  'canvas',
  'webgl',
  'audio',
  'fonts',
  'webrtc',
  'screen',
  'hardware',
  'timezone',
  'languages',
  'battery',
  'plugins',
  'connection',
  'mediaDevices',
  'permissions',
  'clientRects',
  'speech',
  'touch',
  'mediaCodecs',
  'worker',
];

/** Fill every feature flag, defaulting to enabled. */
export function resolveFeatures(features: FeatureFlags = {}): Required<FeatureFlags> {
  const out = {} as Required<FeatureFlags>;
  for (const k of FEATURE_KEYS) out[k] = features[k] !== false;
  return out;
}
