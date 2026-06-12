import type { Fingerprint, FeatureFlags } from '../types';
import { bootstrapSource } from '../runtime/bootstrap';
import { type BuildContext, resolveFeatures } from './module';
import { buildWorkerScript } from './worker-script';
import { ALL_MODULES } from '../modules';

export { resolveFeatures };

/**
 * Compose the single injection script: a self-contained IIFE that leaks no
 * globals. `FP` (the fingerprint) and `afp` (the stealth toolkit) are in scope
 * for every module. Each module is wrapped in its own try/catch so one failure
 * can never abort the rest.
 */
export function buildInjectionScript(fp: Fingerprint, features: FeatureFlags = {}): string {
  const ctx: BuildContext = { fp, features: resolveFeatures(features) };
  const parts: string[] = [];

  for (const mod of ALL_MODULES) {
    if (!mod.enabled(ctx)) continue;
    let code = '';
    try {
      code = mod.build(ctx);
    } catch {
      code = '';
    }
    if (code && code.trim()) {
      // Each module runs in its own function so a top-level `return` (used for
      // early-exit) scopes to the module, never aborting the whole IIFE.
      parts.push(`/* ${mod.name} */\ntry {\n(function(){\n${code}\n})();\n} catch (e) {}`);
    }
  }

  const workerSrc = ctx.features.worker ? buildWorkerScript(fp) : '';

  return (
    `(function(){\n` +
    `'use strict';\n` +
    `var FP = ${JSON.stringify(fp)};\n` +
    `var afp = (function(){${bootstrapSource()}})();\n` +
    `var WORKER_SRC = ${JSON.stringify(workerSrc)};\n` +
    `${parts.join('\n')}\n` +
    `})();`
  );
}
