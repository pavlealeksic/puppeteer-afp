import { flagged, type ProtectionModule } from '../core/module';

/** navigator identity: userAgent, vendor, appVersion, and Client Hints. */
export const navigatorModule: ProtectionModule = {
  name: 'navigator',
  enabled: flagged('navigator'),
  build() {
    return `
      var n = FP.navigator;
      afp.defineValue(navigator, 'userAgent', n.userAgent, 'userAgent');
      afp.defineValue(navigator, 'appVersion', n.appVersion, 'appVersion');
      afp.defineValue(navigator, 'vendor', n.vendor, 'vendor');
      afp.defineValue(navigator, 'productSub', FP.browser === 'firefox' ? '20100101' : '20030107', 'productSub');
      if (FP.hardware.oscpu) afp.defineValue(navigator, 'oscpu', FP.hardware.oscpu, 'oscpu');

      // Client Hints (Chromium only).
      if (n.brands && navigator.userAgentData) {
        var brands = n.brands.map(function (b) { return { brand: b.brand, version: b.version }; });
        var fullVersions = n.brands.map(function (b) {
          return { brand: b.brand, version: b.brand.indexOf('Not') === -1 ? n.uaFullVersion : b.version };
        });
        var highEntropy = {
          brands: brands,
          fullVersionList: fullVersions,
          mobile: !!n.uaMobile,
          platform: n.uaPlatform || '',
          platformVersion: FP.os === 'windows' ? '15.0.0' : (FP.os === 'macos' ? '14.6.1' : ''),
          architecture: FP.device === 'mobile' ? '' : 'x86',
          bitness: FP.device === 'mobile' ? '' : '64',
          model: '',
          uaFullVersion: n.uaFullVersion,
          wow64: false,
        };
        var uaData = {
          brands: brands,
          mobile: !!n.uaMobile,
          platform: n.uaPlatform || '',
          getHighEntropyValues: function (hints) {
            var out = { brands: brands, mobile: !!n.uaMobile, platform: n.uaPlatform || '' };
            (hints || []).forEach(function (h) { if (h in highEntropy) out[h] = highEntropy[h]; });
            return Promise.resolve(out);
          },
          toJSON: function () { return { brands: brands, mobile: !!n.uaMobile, platform: n.uaPlatform || '' }; },
        };
        afp.native(uaData.getHighEntropyValues, 'getHighEntropyValues');
        afp.native(uaData.toJSON, 'toJSON');
        afp.defineValue(navigator, 'userAgentData', uaData, 'userAgentData');
      } else if (!n.brands) {
        // Non-Chromium identity (Firefox/Safari): the underlying engine is
        // still Chromium, so strip the Chromium-only Client Hints surface.
        afp.remove(navigator, 'userAgentData');
      }
    `;
  },
};
