import { flagged, type ProtectionModule } from '../core/module';

/**
 * Canvas 2D fingerprint protection. Adds sparse ±1 noise to pixel data, seeded
 * by the fingerprint so the canvas hashes to a *stable but unique* value: two
 * reads of the same canvas match (detectors compare), yet two identities differ.
 */
export const canvasModule: ProtectionModule = {
  name: 'canvas',
  enabled: flagged('canvas'),
  build() {
    return `
      var C2D = CanvasRenderingContext2D.prototype;
      var origGID = C2D.getImageData;
      var prob = 0.015 + FP.canvasNoise * 0.02;

      function clamp(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }
      function noisify(d) {
        var g = afp.rng('canvas');
        for (var i = 0; i < d.length; i += 4) {
          if (g() < prob) {
            d[i]     = clamp(d[i]     + (g() < 0.5 ? -1 : 1));
            d[i + 1] = clamp(d[i + 1] + (g() < 0.5 ? -1 : 1));
            d[i + 2] = clamp(d[i + 2] + (g() < 0.5 ? -1 : 1));
          }
        }
      }

      afp.method(C2D, 'getImageData', function (orig, self, args) {
        var res = orig.apply(self, args);
        try { noisify(res.data); } catch (e) {}
        return res;
      });

      function noisyClone(self) {
        var w = self.width, h = self.height;
        var copy = document.createElement('canvas');
        copy.width = w; copy.height = h;
        var src = self.getContext('2d');
        var dst = copy.getContext('2d');
        if (src && dst) {
          var img = origGID.call(src, 0, 0, w, h);
          noisify(img.data);
          dst.putImageData(img, 0, 0);
        }
        return copy;
      }

      afp.method(HTMLCanvasElement.prototype, 'toDataURL', function (orig, self, args) {
        try {
          if (self.width > 0 && self.height > 0 && self.getContext('2d')) {
            return orig.apply(noisyClone(self), args);
          }
        } catch (e) {}
        return orig.apply(self, args);
      });

      afp.method(HTMLCanvasElement.prototype, 'toBlob', function (orig, self, args) {
        try {
          if (self.width > 0 && self.height > 0 && self.getContext('2d')) {
            return orig.apply(noisyClone(self), args);
          }
        } catch (e) {}
        return orig.apply(self, args);
      });

      // isPointInPath / measureText left intact: perturbing them breaks layout
      // without meaningfully changing the canvas hash.
    `;
  },
};
