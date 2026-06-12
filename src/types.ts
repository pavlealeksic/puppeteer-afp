import type { Page, Browser } from 'puppeteer';

/**
 * Public type surface for puppeteer-afp v3.
 *
 * The central idea of v3: a single `seed` deterministically produces one
 * internally-coherent {@link Fingerprint}. Persist the seed and you reproduce
 * the exact same browser identity (the vault). Every spoofed value — navigator,
 * screen, GPU, canvas/audio noise, timezone, WebRTC IP — is derived from that
 * seed so they never contradict each other.
 */

export type DeviceCategory = 'desktop' | 'mobile';
export type BrowserName = 'chrome' | 'firefox' | 'safari' | 'edge';
export type OSName = 'windows' | 'macos' | 'linux' | 'android' | 'ios';
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

/** Geographic + locale identity, ideally coherent with the egress IP/proxy. */
export interface GeoProfile {
  /** Public IP the traffic appears to originate from (informational). */
  ip?: string;
  /** IANA timezone, e.g. `Europe/Berlin`. */
  timezone: string;
  /** Primary BCP-47 locale, e.g. `de-DE`. */
  locale: string;
  /** `navigator.languages`, e.g. `['de-DE','de','en-US','en']`. */
  languages: string[];
  /** ISO 3166-1 alpha-2 country, e.g. `DE`. */
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  /** Geolocation accuracy in metres. */
  accuracy?: number;
}

export interface ScreenSpec {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  /** Inner viewport — derived from screen minus chrome. */
  innerWidth: number;
  innerHeight: number;
}

export interface HardwareSpec {
  hardwareConcurrency: number;
  /** GiB exposed via `navigator.deviceMemory` (capped at 8 by the platform). */
  deviceMemory: number;
  maxTouchPoints: number;
  /** `navigator.platform`, e.g. `Win32`, `MacIntel`, `Linux x86_64`. */
  platform: string;
  /** Firefox-only `navigator.oscpu`. */
  oscpu?: string;
}

export interface GpuSpec {
  /** `WebGLRenderingContext.getParameter(VENDOR)`. */
  vendor: string;
  /** `WebGLRenderingContext.getParameter(RENDERER)`. */
  renderer: string;
  /** `WEBGL_debug_renderer_info` UNMASKED_VENDOR_WEBGL. */
  unmaskedVendor: string;
  /** `WEBGL_debug_renderer_info` UNMASKED_RENDERER_WEBGL. */
  unmaskedRenderer: string;
}

export interface NavigatorSpec {
  userAgent: string;
  appVersion: string;
  vendor: string;
  /** `navigator.userAgentData` brands for Chromium. */
  uaFullVersion?: string;
  uaPlatform?: string;
  uaMobile?: boolean;
  /** Chromium client-hint brand list. */
  brands?: Array<{ brand: string; version: string }>;
}

export interface BatterySpec {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export interface ConnectionSpec {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  rtt: number;
  downlink: number;
  saveData: boolean;
}

/** WebRTC IP-leak handling policy. */
export type WebRtcPolicy =
  /** Rewrite STUN-discovered public IPs to the proxy egress; drop leaky
   *  candidates when no egress IP is known. Keeps mDNS host candidates. */
  | 'fake'
  /** Drop every ICE candidate — WebRTC discovers no IPs at all. */
  | 'block'
  /** Leave WebRTC untouched. */
  | 'passthrough';

export interface WebRtcSpec {
  /** mDNS / private IP exposed via ICE candidates. */
  localIp: string;
  /** Public IP exposed via STUN; usually the proxy egress. */
  publicIp?: string;
  /** How ICE candidates / SDP are masked. Default `fake`. */
  policy?: WebRtcPolicy;
}

/**
 * A complete, internally-coherent browser identity. Fully serialisable so it
 * can be stored in the vault and re-applied byte-for-byte.
 */
export interface Fingerprint {
  /** Schema version for forward-compatible vault migrations. */
  version: number;
  /** The seed everything is derived from. */
  seed: string;
  device: DeviceCategory;
  browser: BrowserName;
  os: OSName;
  navigator: NavigatorSpec;
  screen: ScreenSpec;
  hardware: HardwareSpec;
  gpu: GpuSpec;
  geo: GeoProfile;
  battery: BatterySpec;
  connection: ConnectionSpec;
  webrtc: WebRtcSpec;
  fonts: string[];
  plugins: PluginSpec[];
  mimeTypes: MimeTypeSpec[];
  /** Per-fingerprint canvas noise magnitude (0..1, seed-derived). */
  canvasNoise: number;
  /** Per-fingerprint audio noise magnitude (0..1, seed-derived). */
  audioNoise: number;
  /** Per-fingerprint WebGL readPixels noise magnitude (0..1, seed-derived). */
  webglNoise: number;
}

export interface PluginSpec {
  name: string;
  filename: string;
  description: string;
}

export interface MimeTypeSpec {
  type: string;
  suffixes: string;
  description: string;
}

/** Which fingerprint surfaces to actively protect. All default to `true`. */
export interface FeatureFlags {
  navigator?: boolean;
  webdriver?: boolean;
  canvas?: boolean;
  webgl?: boolean;
  audio?: boolean;
  fonts?: boolean;
  webrtc?: boolean;
  screen?: boolean;
  hardware?: boolean;
  timezone?: boolean;
  languages?: boolean;
  battery?: boolean;
  plugins?: boolean;
  connection?: boolean;
  mediaDevices?: boolean;
  permissions?: boolean;
  clientRects?: boolean;
  speech?: boolean;
  touch?: boolean;
  /** Per-browser media codec support (canPlayType / isTypeSupported). */
  mediaCodecs?: boolean;
  /** Propagate the patch into Web Workers (defeats fresh-realm probes). */
  worker?: boolean;
}

/**
 * Options for generating / applying a fingerprint. Anything omitted is filled
 * deterministically from the seed and the chosen profile.
 */
export interface AfpOptions {
  /**
   * Seed string. Identical seed + identical options ⇒ identical fingerprint.
   * Omit to generate a random seed (printed via the logger / available on the
   * returned fingerprint so it can be persisted).
   */
  seed?: string;
  /** Named device profile, e.g. `desktop-chrome-win`, `mobile-ios-iphone`. */
  profile?: string;
  device?: DeviceCategory;
  browser?: BrowserName;
  os?: OSName;
  /** Geo/locale identity. If a proxy is given, this is auto-derived. */
  geo?: Partial<GeoProfile>;
  /**
   * Proxy URL (`http://user:pass@host:port`). When set and `geo` is absent the
   * coherence engine resolves the egress IP to a timezone/locale/WebRTC IP.
   */
  proxy?: string;
  /** WebRTC IP-leak policy. Default `fake`. */
  webrtcPolicy?: WebRtcPolicy;
  /** Fully-formed fingerprint to apply verbatim (skips generation). */
  fingerprint?: Fingerprint;
  features?: FeatureFlags;
  /** Re-randomise volatile values (canvas/audio noise) on this interval (ms). */
  rotationInterval?: number;
  logLevel?: LogLevel;
}

/** Vault persistence configuration. */
export interface VaultOptions {
  /** Directory to store fingerprint JSON files. Default: `~/.puppeteer-afp`. */
  dir?: string;
}

export interface ProtectedPage extends Page {
  /** The applied fingerprint (read-only snapshot). */
  fingerprint: Fingerprint;
  /** Re-randomise volatile noise without changing stable identity. */
  rotateFingerprint(): Promise<void>;
}

export interface ProtectedBrowser extends Browser {
  /** Open a new page with protection already applied. */
  newProtectedPage(options?: AfpOptions): Promise<ProtectedPage>;
  /** The fingerprint shared by pages opened through this browser. */
  fingerprint: Fingerprint;
}
