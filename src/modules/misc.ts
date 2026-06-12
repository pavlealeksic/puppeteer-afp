import { flagged, type ProtectionModule } from '../core/module';

export const batteryModule: ProtectionModule = {
  name: 'battery',
  enabled: flagged('battery'),
  build() {
    return `
      // Battery API: Chromium (desktop + Android) only. Strip it for Firefox/Safari.
      var hasBattery = FP.browser === 'chrome' || FP.browser === 'edge';
      if (!hasBattery) {
        afp.remove(navigator, 'getBattery');
      } else if (navigator.getBattery) {
        var b = FP.battery;
        afp.method(navigator, 'getBattery', function () {
          var noop = function () {};
          var mgr = {
            charging: b.charging,
            chargingTime: b.charging ? b.chargingTime : Infinity,
            dischargingTime: b.charging ? Infinity : b.dischargingTime,
            level: b.level,
            addEventListener: noop, removeEventListener: noop, dispatchEvent: function () { return false; },
            onchargingchange: null, onchargingtimechange: null, ondischargingtimechange: null, onlevelchange: null,
          };
          afp.native(mgr.addEventListener, 'addEventListener');
          return Promise.resolve(mgr);
        });
      }
    `;
  },
};

export const pluginsModule: ProtectionModule = {
  name: 'plugins',
  enabled: flagged('plugins'),
  build() {
    return `
      function buildPlugins() {
        var arr = [];
        (FP.plugins || []).forEach(function (p, i) {
          var mime = { type: 'application/pdf', suffixes: 'pdf', description: '', enabledPlugin: null };
          var plugin = { name: p.name, filename: p.filename, description: p.description, length: 1, 0: mime };
          mime.enabledPlugin = plugin;
          plugin.item = function (k) { return this[k] || null; };
          plugin.namedItem = function (n) { return this[n] || null; };
          afp.native(plugin.item, 'item'); afp.native(plugin.namedItem, 'namedItem');
          arr.push(plugin); arr[i] = plugin; arr[p.name] = plugin;
        });
        arr.item = function (i) { return this[i] || null; };
        arr.namedItem = function (n) { return this[n] || null; };
        arr.refresh = function () {};
        afp.native(arr.item, 'item'); afp.native(arr.namedItem, 'namedItem'); afp.native(arr.refresh, 'refresh');
        Object.defineProperty(arr, 'length', { value: (FP.plugins || []).length, enumerable: false });
        return arr;
      }
      function buildMimes() {
        var arr = [];
        (FP.mimeTypes || []).forEach(function (m, i) {
          var mt = { type: m.type, suffixes: m.suffixes, description: m.description, enabledPlugin: null };
          arr.push(mt); arr[i] = mt; arr[m.type] = mt;
        });
        arr.item = function (i) { return this[i] || null; };
        arr.namedItem = function (n) { return this[n] || null; };
        afp.native(arr.item, 'item'); afp.native(arr.namedItem, 'namedItem');
        Object.defineProperty(arr, 'length', { value: (FP.mimeTypes || []).length, enumerable: false });
        return arr;
      }
      // Modern headless Chrome already ships the real PDF PluginArray (and modern
      // Firefox exposes the same standard set), so replacing it with a plain
      // object would be a tell. Only synthesise when the engine exposes none.
      var nativePlugins = navigator.plugins && navigator.plugins.length;
      if (FP.plugins && FP.plugins.length && !nativePlugins) {
        afp.defineValue(navigator, 'plugins', buildPlugins(), 'plugins');
        afp.defineValue(navigator, 'mimeTypes', buildMimes(), 'mimeTypes');
      }
    `;
  },
};

export const connectionModule: ProtectionModule = {
  name: 'connection',
  enabled: flagged('connection'),
  build() {
    return `
      // Network Information API is Chromium-only.
      var hasConn = FP.browser === 'chrome' || FP.browser === 'edge';
      if (!hasConn) {
        afp.remove(navigator, 'connection');
      } else if (navigator.connection) {
        var c = FP.connection;
        afp.defineValue(navigator.connection, 'effectiveType', c.effectiveType, 'effectiveType');
        afp.defineValue(navigator.connection, 'rtt', c.rtt, 'rtt');
        afp.defineValue(navigator.connection, 'downlink', c.downlink, 'downlink');
        afp.defineValue(navigator.connection, 'saveData', c.saveData, 'saveData');
      }
    `;
  },
};

export const mediaDevicesModule: ProtectionModule = {
  name: 'mediaDevices',
  enabled: flagged('mediaDevices'),
  build() {
    return `
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        afp.method(navigator.mediaDevices, 'enumerateDevices', function () {
          function id(salt) { var r = afp.rng('media:' + salt); var s = ''; for (var i = 0; i < 64; i++) s += Math.floor(r() * 16).toString(16); return s; }
          var devices = [
            { deviceId: 'default', kind: 'audioinput', label: '', groupId: id('g1') },
            { deviceId: id('a1'), kind: 'audioinput', label: '', groupId: id('g1') },
            { deviceId: id('v1'), kind: 'videoinput', label: '', groupId: id('g2') },
            { deviceId: 'default', kind: 'audiooutput', label: '', groupId: id('g1') },
          ];
          if (FP.device === 'mobile') devices.splice(2, 0, { deviceId: id('v2'), kind: 'videoinput', label: '', groupId: id('g3') });
          return Promise.resolve(devices.map(function (d) {
            d.toJSON = function () { return d; }; afp.native(d.toJSON, 'toJSON'); return d;
          }));
        });
      }
    `;
  },
};

export const permissionsModule: ProtectionModule = {
  name: 'permissions',
  enabled: flagged('permissions'),
  build() {
    return `
      if (navigator.permissions && navigator.permissions.query) {
        afp.method(navigator.permissions, 'query', function (orig, self, args) {
          var p = args[0] || {};
          // Headless reports notifications as 'denied' while Notification.permission
          // is 'default' — a classic contradiction. Realign them.
          if (p.name === 'notifications') {
            var state = (typeof Notification !== 'undefined' && Notification.permission) || 'default';
            return Promise.resolve({ state: state === 'denied' ? 'denied' : 'prompt', onchange: null });
          }
          return orig.apply(self, args);
        });
      }
    `;
  },
};

export const speechModule: ProtectionModule = {
  name: 'speech',
  enabled: flagged('speech'),
  build() {
    return `
      if (typeof speechSynthesis !== 'undefined') {
        var voices = [];
        if (FP.os === 'macos' || FP.os === 'ios') {
          voices = [
            { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha', localService: true, default: true },
            { name: 'Daniel', lang: 'en-GB', voiceURI: 'Daniel', localService: true, default: false },
          ];
        } else if (FP.os === 'windows') {
          voices = [
            { name: 'Microsoft David - English (United States)', lang: 'en-US', voiceURI: 'Microsoft David', localService: true, default: true },
            { name: 'Microsoft Zira - English (United States)', lang: 'en-US', voiceURI: 'Microsoft Zira', localService: true, default: false },
          ];
        } else {
          voices = [{ name: 'Google US English', lang: 'en-US', voiceURI: 'Google US English', localService: false, default: true }];
        }
        afp.method(speechSynthesis, 'getVoices', function () {
          return voices.map(function (v) { return Object.assign({}, v); });
        });
      }
    `;
  },
};

export const touchModule: ProtectionModule = {
  name: 'touch',
  enabled: flagged('touch'),
  build() {
    return `
      if (FP.device === 'mobile') {
        try { if (!('ontouchstart' in window)) window.ontouchstart = null; } catch (e) {}
      } else {
        // Desktop: ensure no touch event interfaces leak through.
        try {
          if ('ontouchstart' in window && FP.hardware.maxTouchPoints === 0) {
            afp.defineValue(window, 'ontouchstart', undefined, 'ontouchstart');
          }
        } catch (e) {}
      }
    `;
  },
};
