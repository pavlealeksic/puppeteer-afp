import { flagged, type ProtectionModule } from '../core/module';

/**
 * Media-codec coherence. `HTMLMediaElement.canPlayType` and
 * `MediaSource.isTypeSupported` reveal the engine: Safari has no WebM/Ogg but
 * has HEVC; Chromium has WebM/VP9 but not HEVC by default. When emulating a
 * non-Chromium browser on a Chromium engine, the native answers contradict the
 * claimed UA — so we adjust them. For chrome/edge identities the native engine
 * answers are already correct and we no-op.
 */
export const mediaCodecsModule: ProtectionModule = {
  name: 'mediaCodecs',
  enabled: flagged('mediaCodecs'),
  build() {
    return `
      if (FP.browser === 'chrome' || FP.browser === 'edge') return; // native answers correct

      var isSafari = FP.browser === 'safari';

      // Returns '', 'maybe', 'probably', or null (defer to the native result).
      function adjust(type) {
        var t = String(type || '').toLowerCase();
        if (!t) return null;
        if (isSafari) {
          if (t.indexOf('webm') !== -1) return '';
          if (t.indexOf('ogg') !== -1 || t.indexOf('vorbis') !== -1 || t.indexOf('theora') !== -1) return '';
          if (t.indexOf('hvc1') !== -1 || t.indexOf('hev1') !== -1 || t.indexOf('hevc') !== -1) return 'probably';
          if (t.indexOf('mp4') !== -1 || t.indexOf('avc1') !== -1 || t.indexOf('mpeg') !== -1 || t.indexOf('mp4a') !== -1) return 'probably';
          return null;
        }
        // Firefox: no HEVC; WebM/Ogg/MP4(H.264) supported.
        if (t.indexOf('hvc1') !== -1 || t.indexOf('hev1') !== -1 || t.indexOf('hevc') !== -1) return '';
        return null;
      }

      if (typeof HTMLMediaElement !== 'undefined') {
        afp.method(HTMLMediaElement.prototype, 'canPlayType', function (orig, self, args) {
          var a = adjust(args[0]);
          return a === null ? orig.apply(self, args) : a;
        });
      }

      if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported) {
        afp.method(MediaSource, 'isTypeSupported', function (orig, self, args) {
          var a = adjust(args[0]);
          if (a === null) return orig.apply(self, args);
          return a === 'probably' || a === 'maybe';
        });
      }
    `;
  },
};
