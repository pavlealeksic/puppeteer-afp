import { flagged, type ProtectionModule } from '../core/module';

/** WebGL identity (vendor/renderer) + sparse readPixels noise. */
export const webglModule: ProtectionModule = {
  name: 'webgl',
  enabled: flagged('webgl'),
  build() {
    return `
      var g = FP.gpu;
      var VENDOR = 0x1F00, RENDERER = 0x1F01;
      var UNMASKED_VENDOR = 0x9245, UNMASKED_RENDERER = 0x9246;

      function patchContext(proto) {
        if (!proto) return;
        afp.method(proto, 'getParameter', function (orig, self, args) {
          var p = args[0];
          if (p === UNMASKED_VENDOR) return g.unmaskedVendor;
          if (p === UNMASKED_RENDERER) return g.unmaskedRenderer;
          if (p === VENDOR) return g.vendor;
          if (p === RENDERER) return g.renderer;
          return orig.apply(self, args);
        });

        // Ensure the debug-renderer extension is always reported as present.
        afp.method(proto, 'getExtension', function (orig, self, args) {
          var ext = orig.apply(self, args);
          if (args[0] === 'WEBGL_debug_renderer_info' && !ext) {
            return { UNMASKED_VENDOR_WEBGL: UNMASKED_VENDOR, UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER };
          }
          return ext;
        });

        afp.method(proto, 'getSupportedExtensions', function (orig, self, args) {
          var list = orig.apply(self, args) || [];
          if (list.indexOf('WEBGL_debug_renderer_info') === -1) list.push('WEBGL_debug_renderer_info');
          return list;
        });

        // Sparse, deterministic readPixels noise.
        afp.method(proto, 'readPixels', function (orig, self, args) {
          var r = orig.apply(self, args);
          try {
            var px = args[6];
            if (px && px.length) {
              var rnd = afp.rng('webgl');
              var prob = 0.01 + FP.webglNoise * 0.01;
              for (var i = 0; i < px.length; i += 4) {
                if (rnd() < prob) {
                  var v = px[i] + (rnd() < 0.5 ? -1 : 1);
                  px[i] = v < 0 ? 0 : (v > 255 ? 255 : v);
                }
              }
            }
          } catch (e) {}
          return r;
        });
      }

      patchContext(typeof WebGLRenderingContext !== 'undefined' ? WebGLRenderingContext.prototype : null);
      patchContext(typeof WebGL2RenderingContext !== 'undefined' ? WebGL2RenderingContext.prototype : null);
    `;
  },
};
