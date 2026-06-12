import { flagged, type ProtectionModule } from '../core/module';

/** screen geometry, devicePixelRatio, and orientation. */
export const screenModule: ProtectionModule = {
  name: 'screen',
  enabled: flagged('screen'),
  build() {
    return `
      var s = FP.screen;
      afp.defineValue(screen, 'width', s.width, 'width');
      afp.defineValue(screen, 'height', s.height, 'height');
      afp.defineValue(screen, 'availWidth', s.availWidth, 'availWidth');
      afp.defineValue(screen, 'availHeight', s.availHeight, 'availHeight');
      afp.defineValue(screen, 'availLeft', 0, 'availLeft');
      afp.defineValue(screen, 'availTop', 0, 'availTop');
      afp.defineValue(screen, 'colorDepth', s.colorDepth, 'colorDepth');
      afp.defineValue(screen, 'pixelDepth', s.pixelDepth, 'pixelDepth');
      afp.defineValue(window, 'devicePixelRatio', s.devicePixelRatio, 'devicePixelRatio');

      // screen.orientation, coherent with portrait/landscape.
      if (screen.orientation) {
        var portrait = s.height >= s.width;
        afp.defineValue(screen.orientation, 'type', portrait ? 'portrait-primary' : 'landscape-primary', 'type');
        afp.defineValue(screen.orientation, 'angle', 0, 'angle');
      }
    `;
  },
};
