import { flagged, type ProtectionModule } from '../core/module';

/**
 * Font fingerprint protection. Adds deterministic sub-pixel noise to
 * `measureText` (keyed by text+font so it is stable per identity) and makes
 * `document.fonts.check` agree with the FP.fonts whitelist.
 */
export const fontsModule: ProtectionModule = {
  name: 'fonts',
  enabled: flagged('fonts'),
  build() {
    return `
      var installed = {};
      (FP.fonts || []).forEach(function (f) { installed[f.toLowerCase()] = true; });

      if (typeof CanvasRenderingContext2D !== 'undefined') {
        afp.method(CanvasRenderingContext2D.prototype, 'measureText', function (orig, self, args) {
          var m = orig.apply(self, args);
          try {
            var key = String(args[0]) + '|' + self.font;
            var rnd = afp.rng('font:' + afp.hash(key));
            var delta = (rnd() * 2 - 1) * 0.02;
            var w = m.width + delta;
            // Return a thin proxy so .width reflects the noised value.
            return new Proxy(m, {
              get: function (t, p) { return p === 'width' ? w : t[p]; }
            });
          } catch (e) {}
          return m;
        });
      }

      if (document.fonts && document.fonts.check) {
        afp.method(document.fonts, 'check', function (orig, self, args) {
          try {
            var spec = String(args[0] || '');
            var fam = (args[1] !== undefined ? String(args[1]) : spec).toLowerCase();
            // crude family extraction from a CSS font shorthand
            var m = fam.match(/['\"]?([a-z0-9 \\-]+)['\"]?$/);
            var name = m ? m[1].trim() : fam;
            if (name && installed[name] !== undefined) return installed[name];
          } catch (e) {}
          return orig.apply(self, args);
        });
      }
    `;
  },
};
