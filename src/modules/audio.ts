import { flagged, type ProtectionModule } from '../core/module';

/**
 * AudioContext fingerprint protection. Applies tiny, proportional, deterministic
 * noise to rendered audio samples and analyser output. Uses a WeakSet so each
 * buffer is perturbed exactly once — repeated reads stay consistent, and the
 * common "render an oscillator then read" fingerprint flow is preserved.
 */
export const audioModule: ProtectionModule = {
  name: 'audio',
  enabled: flagged('audio'),
  build() {
    return `
      var mag = FP.audioNoise;
      var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

      if (typeof AudioBuffer !== 'undefined') {
        afp.method(AudioBuffer.prototype, 'getChannelData', function (orig, self, args) {
          var arr = orig.apply(self, args);
          try {
            if (arr && arr.length && (!seen || !seen.has(arr))) {
              var rnd = afp.rng('audio');
              for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i] + (rnd() * 2 - 1) * mag * arr[i];
              }
              if (seen) seen.add(arr);
            }
          } catch (e) {}
          return arr;
        });
      }

      if (typeof AnalyserNode !== 'undefined') {
        afp.method(AnalyserNode.prototype, 'getFloatFrequencyData', function (orig, self, args) {
          var r = orig.apply(self, args);
          try {
            var a = args[0];
            if (a && a.length) {
              var rnd = afp.rng('audio-freq');
              for (var i = 0; i < a.length; i++) a[i] = a[i] + (rnd() * 2 - 1) * mag * 10;
            }
          } catch (e) {}
          return r;
        });
      }
    `;
  },
};
