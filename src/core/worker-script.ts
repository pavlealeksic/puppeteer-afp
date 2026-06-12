import type { Fingerprint } from '../types';
import { bootstrapSource } from '../runtime/bootstrap';
import { type BuildContext, resolveFeatures } from './module';
import { navigatorModule } from '../modules/navigator';
import { hardwareModule } from '../modules/hardware';
import { languagesModule, timezoneModule } from '../modules/locale';
import { webglModule } from '../modules/webgl';

/**
 * OffscreenCanvas noise — the worker-scope equivalent of the canvas module.
 * Workers have no `document`/`HTMLCanvasElement`, so we patch the offscreen 2D
 * context readback that worker-based canvas fingerprinting relies on.
 */
const WORKER_CANVAS = `
  if (typeof OffscreenCanvasRenderingContext2D !== 'undefined') {
    var prob = 0.015 + FP.canvasNoise * 0.02;
    var clamp = function (v) { return v < 0 ? 0 : (v > 255 ? 255 : v); };
    var noisify = function (d) {
      var g = afp.rng('canvas');
      for (var i = 0; i < d.length; i += 4) {
        if (g() < prob) {
          d[i] = clamp(d[i] + (g() < 0.5 ? -1 : 1));
          d[i + 1] = clamp(d[i + 1] + (g() < 0.5 ? -1 : 1));
          d[i + 2] = clamp(d[i + 2] + (g() < 0.5 ? -1 : 1));
        }
      }
    };
    afp.method(OffscreenCanvasRenderingContext2D.prototype, 'getImageData', function (orig, self, args) {
      var r = orig.apply(self, args);
      try { noisify(r.data); } catch (e) {}
      return r;
    });
  }
`;

/**
 * Build the patch that runs *inside* Web Workers. A worker has its own realm
 * with a fresh `WorkerNavigator`, so detectors spin one up to read un-spoofed
 * values (notably `hardwareConcurrency`). We reuse the worker-safe modules —
 * each already references only `navigator`/`Intl`/`WebGLRenderingContext`, all
 * of which exist in workers — plus OffscreenCanvas noise. Modules touching
 * `window`/`document`/`screen` are excluded.
 */
export function buildWorkerScript(fp: Fingerprint): string {
  const ctx: BuildContext = { fp, features: resolveFeatures({}) };
  const parts = [
    navigatorModule.build(ctx),
    hardwareModule.build(ctx),
    languagesModule.build(ctx),
    timezoneModule.build(ctx),
    webglModule.build(ctx),
    WORKER_CANVAS,
  ];
  // Wrap each part in its own function so a top-level `return` scopes locally.
  const body = parts.map(p => `try {\n(function(){\n${p}\n})();\n} catch (e) {}`).join('\n');
  return (
    `(function(){\n` +
    `'use strict';\n` +
    `var FP = ${JSON.stringify(fp)};\n` +
    `var afp = (function(){${bootstrapSource()}})();\n` +
    `${body}\n` +
    `})();`
  );
}
