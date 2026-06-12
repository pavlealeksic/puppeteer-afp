import type {
  AfpOptions,
  Fingerprint,
  GeoProfile,
  MimeTypeSpec,
  OSName,
  PluginSpec,
} from '../types';
import { Rng, randomSeed } from './prng';
import { DEVICE_PROFILES, DeviceProfile, findProfile } from '../profiles/devices';

export const FINGERPRINT_VERSION = 3;

/** Representative installed-font sets per OS (a seeded subset is exposed). */
const FONTS: Record<OSName, string[]> = {
  windows: [
    'Arial',
    'Arial Black',
    'Calibri',
    'Cambria',
    'Comic Sans MS',
    'Consolas',
    'Courier New',
    'Georgia',
    'Impact',
    'Lucida Console',
    'Segoe UI',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
    'Wingdings',
  ],
  macos: [
    'American Typewriter',
    'Andale Mono',
    'Arial',
    'Avenir',
    'Avenir Next',
    'Courier',
    'Geneva',
    'Georgia',
    'Helvetica',
    'Helvetica Neue',
    'Lucida Grande',
    'Menlo',
    'Monaco',
    'Optima',
    'Palatino',
    'Times',
    'Times New Roman',
  ],
  linux: [
    'DejaVu Sans',
    'DejaVu Serif',
    'Droid Sans',
    'FreeMono',
    'FreeSans',
    'Liberation Mono',
    'Liberation Sans',
    'Liberation Serif',
    'Noto Sans',
    'Ubuntu',
    'Ubuntu Mono',
  ],
  android: [
    'Droid Sans',
    'Droid Sans Mono',
    'Noto Color Emoji',
    'Noto Sans',
    'Roboto',
    'Roboto Condensed',
  ],
  ios: ['Apple Color Emoji', 'Helvetica', 'Helvetica Neue', 'San Francisco', 'Times New Roman'],
};

/** Default geo identities keyed by a coarse region guess. */
const DEFAULT_GEO: GeoProfile = {
  timezone: 'America/New_York',
  locale: 'en-US',
  languages: ['en-US', 'en'],
  countryCode: 'US',
  latitude: 40.7128,
  longitude: -74.006,
  accuracy: 100,
};

const CHROMIUM_PLUGINS: PluginSpec[] = [
  { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
  {
    name: 'Chrome PDF Viewer',
    filename: 'internal-pdf-viewer',
    description: 'Portable Document Format',
  },
  {
    name: 'Chromium PDF Viewer',
    filename: 'internal-pdf-viewer',
    description: 'Portable Document Format',
  },
  {
    name: 'Microsoft Edge PDF Viewer',
    filename: 'internal-pdf-viewer',
    description: 'Portable Document Format',
  },
  {
    name: 'WebKit built-in PDF',
    filename: 'internal-pdf-viewer',
    description: 'Portable Document Format',
  },
];

const CHROMIUM_MIMETYPES: MimeTypeSpec[] = [
  { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
  { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
];

function pickProfile(rng: Rng, opts: AfpOptions): DeviceProfile {
  if (opts.profile) {
    const p = findProfile(opts.profile);
    if (p) return p;
  }
  let candidates = DEVICE_PROFILES;
  if (opts.device) candidates = candidates.filter(p => p.device === opts.device);
  if (opts.browser) candidates = candidates.filter(p => p.browser === opts.browser);
  if (opts.os) candidates = candidates.filter(p => p.os === opts.os);
  if (candidates.length === 0) candidates = DEVICE_PROFILES;
  return rng.pick(candidates);
}

/** mDNS-style local ICE address used by modern Chromium. */
function mdnsLocalIp(rng: Rng): string {
  const hex = '0123456789abcdef';
  const part = (n: number) => Array.from({ length: n }, () => rng.pick(hex.split(''))).join('');
  return `${part(8)}-${part(4)}-${part(4)}-${part(4)}-${part(12)}.local`;
}

/**
 * Build a complete, internally-coherent fingerprint from the options. Identical
 * `seed` + identical `opts` always yield an identical fingerprint.
 */
export function generateFingerprint(opts: AfpOptions = {}): Fingerprint {
  if (opts.fingerprint) return opts.fingerprint;

  const seed = opts.seed || randomSeed();
  const rng = new Rng(seed);
  const profile = pickProfile(rng, opts);

  const [sw, sh] = rng.pick(profile.screens);
  const dpr = rng.pick(profile.devicePixelRatios);
  const cores = rng.pick(profile.hardwareConcurrency);
  const memory = rng.pick(profile.deviceMemory);
  const gpu = rng.pick(profile.gpus);
  const userAgent = rng.pick(profile.userAgents);

  // Desktop reserves OS chrome (taskbar / menu bar); mobile uses the full area.
  const taskbar = profile.device === 'desktop' ? (profile.os === 'macos' ? 25 : 40) : 0;
  const availHeight = sh - taskbar;
  const innerHeight = profile.device === 'mobile' ? availHeight : Math.max(200, sh - taskbar - 80);
  const innerWidth = sw;

  const geo: GeoProfile = { ...DEFAULT_GEO, ...(opts.geo || {}) };
  // Languages must lead with the locale.
  if (opts.geo?.locale && !opts.geo.languages) {
    const base = geo.locale.split('-')[0];
    geo.languages = [geo.locale, base, 'en-US', 'en'].filter((v, i, a) => a.indexOf(v) === i);
  }

  const fontPool = FONTS[profile.os] || FONTS.windows;
  const fonts = rng
    .sample(fontPool, rng.int(Math.ceil(fontPool.length * 0.6), fontPool.length))
    .sort();

  const isChromium = profile.browser === 'chrome' || profile.browser === 'edge';
  const conn = profile.connection;

  const fp: Fingerprint = {
    version: FINGERPRINT_VERSION,
    seed,
    device: profile.device,
    browser: profile.browser,
    os: profile.os,
    navigator: {
      userAgent,
      appVersion: userAgent.replace(/^Mozilla\//, ''),
      vendor: profile.vendor,
      uaFullVersion: profile.uaFullVersion,
      uaPlatform: profile.uaPlatform,
      uaMobile: profile.uaMobile,
      brands: isChromium
        ? [
            { brand: 'Chromium', version: String(parseInt(profile.uaFullVersion || '140', 10)) },
            {
              brand: profile.browser === 'edge' ? 'Microsoft Edge' : 'Google Chrome',
              version: String(parseInt(profile.uaFullVersion || '140', 10)),
            },
            { brand: 'Not_A Brand', version: '24' },
          ]
        : undefined,
    },
    screen: {
      width: sw,
      height: sh,
      availWidth: sw,
      availHeight,
      colorDepth: profile.colorDepth,
      pixelDepth: profile.colorDepth,
      devicePixelRatio: dpr,
      innerWidth,
      innerHeight,
    },
    hardware: {
      hardwareConcurrency: cores,
      deviceMemory: memory,
      maxTouchPoints: profile.maxTouchPoints,
      platform: profile.platform,
      oscpu: profile.oscpu,
    },
    gpu,
    geo,
    battery: {
      charging: rng.bool(profile.device === 'mobile' ? 0.4 : 0.7),
      chargingTime: rng.bool() ? Infinity : rng.int(600, 3600),
      dischargingTime: rng.int(4000, 20000),
      level: Math.round(rng.float(0.2, 1) * 100) / 100,
    },
    connection: {
      effectiveType: conn.effectiveType,
      rtt: Math.round(rng.int(conn.rtt[0], conn.rtt[1]) / 25) * 25,
      downlink: Math.round(rng.float(conn.downlink[0], conn.downlink[1]) * 10) / 10,
      saveData: false,
    },
    webrtc: {
      localIp: mdnsLocalIp(rng),
      publicIp: geo.ip,
      policy: opts.webrtcPolicy || 'fake',
    },
    fonts,
    plugins: isChromium ? CHROMIUM_PLUGINS : [],
    mimeTypes: isChromium ? CHROMIUM_MIMETYPES : [],
    canvasNoise: rng.float(0.4, 1),
    audioNoise: rng.float(0.0001, 0.0008),
    webglNoise: rng.float(0.4, 1),
  };

  // Canonicalise so a generated fingerprint round-trips through the vault (JSON)
  // byte-for-byte: undefined optional fields are dropped, matching what is later
  // serialised into the injection script.
  return JSON.parse(JSON.stringify(fp)) as Fingerprint;
}
