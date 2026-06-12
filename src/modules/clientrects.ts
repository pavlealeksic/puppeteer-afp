import { flagged, type ProtectionModule } from '../core/module';

/**
 * getClientRects fingerprint protection. Adds tiny deterministic sub-pixel
 * noise to bounding rectangles, keyed by geometry so it stays consistent across
 * reads of the same element within an identity.
 */
export const clientRectsModule: ProtectionModule = {
  name: 'clientRects',
  enabled: flagged('clientRects'),
  build() {
    return `
      function jitter(seedStr, n) {
        var rnd = afp.rng('rect:' + afp.hash(seedStr));
        return n + (rnd() * 2 - 1) * 0.0002 * (n || 1);
      }
      function noisyRect(rect, tag) {
        var key = tag + ':' + rect.x + ',' + rect.y + ',' + rect.width + ',' + rect.height;
        var x = jitter(key + 'x', rect.x);
        var y = jitter(key + 'y', rect.y);
        var w = jitter(key + 'w', rect.width);
        var hgt = jitter(key + 'h', rect.height);
        var out = {
          x: x, y: y, width: w, height: hgt,
          top: y, left: x, right: x + w, bottom: y + hgt,
          toJSON: function () { return { x: x, y: y, width: w, height: hgt, top: y, left: x, right: x + w, bottom: y + hgt }; }
        };
        afp.native(out.toJSON, 'toJSON');
        return out;
      }

      afp.method(Element.prototype, 'getBoundingClientRect', function (orig, self, args) {
        return noisyRect(orig.apply(self, args), self.tagName || 'el');
      });
      afp.method(Element.prototype, 'getClientRects', function (orig, self, args) {
        var list = orig.apply(self, args);
        try {
          var arr = [];
          for (var i = 0; i < list.length; i++) arr.push(noisyRect(list[i], (self.tagName || 'el') + i));
          arr.item = function (i) { return arr[i] || null; };
          afp.native(arr.item, 'item');
          return arr;
        } catch (e) {}
        return list;
      });
      if (typeof Range !== 'undefined') {
        afp.method(Range.prototype, 'getBoundingClientRect', function (orig, self, args) {
          return noisyRect(orig.apply(self, args), 'range');
        });
      }
    `;
  },
};
