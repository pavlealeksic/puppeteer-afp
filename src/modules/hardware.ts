import { flagged, type ProtectionModule } from '../core/module';

/** Hardware identity: cores, memory, touch points, platform. */
export const hardwareModule: ProtectionModule = {
  name: 'hardware',
  enabled: flagged('hardware'),
  build() {
    return `
      var h = FP.hardware;
      afp.defineValue(navigator, 'hardwareConcurrency', h.hardwareConcurrency, 'hardwareConcurrency');
      afp.defineValue(navigator, 'platform', h.platform, 'platform');
      afp.defineValue(navigator, 'maxTouchPoints', h.maxTouchPoints, 'maxTouchPoints');
      // deviceMemory is Chromium-only; expose it there and strip it elsewhere
      // (the underlying engine is Chromium, so it would otherwise leak).
      if (FP.browser === 'chrome' || FP.browser === 'edge') {
        afp.defineValue(navigator, 'deviceMemory', h.deviceMemory, 'deviceMemory');
      } else {
        afp.remove(navigator, 'deviceMemory');
      }
    `;
  },
};
