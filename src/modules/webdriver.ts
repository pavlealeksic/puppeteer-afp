import { flagged, type ProtectionModule } from '../core/module';

/**
 * Automation cloak. Deliberately surgical: it only sets `navigator.webdriver`
 * to `false` and installs a believable `window.chrome` stub. It does NOT touch
 * `Object.keys` / `hasOwnProperty` / re-`Proxy` navigator — those global edits
 * are themselves strong detection signals, which is why the v2 code got flagged.
 */
export const webdriverModule: ProtectionModule = {
  name: 'webdriver',
  enabled: flagged('webdriver'),
  build() {
    return `
      // navigator.webdriver — real Chrome exposes this getter returning false.
      afp.defineValue(navigator, 'webdriver', false, 'webdriver');

      // A minimal but plausible window.chrome for Chromium identities.
      if ((FP.browser === 'chrome' || FP.browser === 'edge') && FP.device === 'desktop') {
        if (!window.chrome) {
          var chromeStub = {
            app: { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } },
            runtime: {
              OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
              PlatformArch: { ARM: 'arm', ARM64: 'arm64', X86_32: 'x86-32', X86_64: 'x86-64' },
              PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
              connect: function () {}, sendMessage: function () {},
            },
            csi: function () { return { onloadT: Date.now(), startE: Date.now(), tran: 15 }; },
            loadTimes: function () { return { commitLoadTime: Date.now() / 1000 }; },
          };
          afp.native(chromeStub.runtime.connect, 'connect');
          afp.native(chromeStub.runtime.sendMessage, 'sendMessage');
          afp.native(chromeStub.csi, 'csi');
          afp.native(chromeStub.loadTimes, 'loadTimes');
          try { window.chrome = chromeStub; } catch (e) {}
        }
      } else if (FP.browser !== 'chrome' && FP.browser !== 'edge') {
        // Firefox/Safari identity on a Chromium engine: best-effort removal of
        // window.chrome. NOTE: Chromium pre-installs window.chrome as a
        // NON-CONFIGURABLE property before any document-start script runs, so it
        // cannot be deleted from injected JS. This is an inherent limitation of
        // emulating a non-Chromium browser on a Chromium engine — prefer the
        // chrome/edge profiles when facing engine-level detectors. See README.
        afp.remove(window, 'chrome');
      }
    `;
  },
};
