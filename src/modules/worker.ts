import { flagged, type ProtectionModule } from '../core/module';

/**
 * Web Worker realm propagation.
 *
 * A worker runs in a fresh realm with its own `WorkerNavigator`, so values we
 * patch only in the page (hardwareConcurrency, deviceMemory, …) leak their true
 * machine values inside a worker — a standard detector probe. We wrap the
 * `Worker`/`SharedWorker` constructors so the worker-scope patch (`WORKER_SRC`,
 * embedded by the injector) runs first, via a blob shim that `importScripts()`
 * the original. Module-type workers can't use `importScripts`, so they pass
 * through unmodified (best-effort).
 */
export const workerModule: ProtectionModule = {
  name: 'worker',
  enabled: flagged('worker'),
  build() {
    return `
      if (typeof WORKER_SRC !== 'string' || !WORKER_SRC) return;
      var baseHref = (self.location && self.location.href) || (typeof location !== 'undefined' ? location.href : '');

      function wrap(OrigCtor, label) {
        if (typeof OrigCtor !== 'function') return OrigCtor;
        var P = new Proxy(OrigCtor, {
          construct: function (target, args) {
            var url = args[0], opts = args[1];
            try {
              if (opts && opts.type === 'module') return new target(url, opts);
              var abs = String(new URL(url, baseHref));
              var glue = WORKER_SRC + '\\ntry{importScripts(' + JSON.stringify(abs) + ');}catch(e){}';
              var burl = URL.createObjectURL(new Blob([glue], { type: 'application/javascript' }));
              return new target(burl, opts);
            } catch (e) {
              return new target(url, opts);
            }
          },
        });
        afp.native(P, label);
        return P;
      }

      try { window.Worker = wrap(window.Worker, 'Worker'); } catch (e) {}
      try { window.SharedWorker = wrap(window.SharedWorker, 'SharedWorker'); } catch (e) {}
    `;
  },
};
