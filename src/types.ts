import { Page, Browser } from 'puppeteer';

export interface CanvasNoise {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface WebGLData {
  [key: number]: number | { [key: number]: number } | string | number[];
}

export interface FontFingerprint {
  noise: number;
  sign: number;
}

export interface AudioFingerprint {
  getChannelDataIndexRandom: number;
  getChannelDataResultRandom: number;
  createAnalyserIndexRandom: number;
  createAnalyserResultRandom: number;
}

export interface TimezoneConfig {
  timezone: string;
  locale: string;
}

export interface ScreenConfig {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
}

export interface BatteryConfig {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export interface HardwareConfig {
  hardwareConcurrency: number;
  deviceMemory: number;
}

export interface LanguageConfig {
  languages: string[];
  language: string;
  platform: string;
}

export interface PluginConfig {
  plugins: Array<{
    name: string;
    filename: string;
    description: string;
    version?: string;
  }>;
  mimeTypes: Array<{
    type: string;
    suffixes: string;
    description: string;
  }>;
}

export interface ConnectionConfig {
  effectiveType: string;
  rtt: number;
  downlink: number;
  saveData: boolean;
}

export interface UserAgentConfig {
  userAgent: string;
  platform: string;
  vendor: string;
  appVersion: string;
}

export interface EngineEmulationConfig {
  javascript?: boolean;
  css?: boolean;
  dom?: boolean;
  hardware?: boolean;
  network?: boolean;
}

export interface ProtectionOptions {
  canvasRgba?: number[];
  webglData?: WebGLData;
  fontFingerprint?: FontFingerprint;
  audioFingerprint?: AudioFingerprint;
  webRTCProtect?: boolean;
  deviceMemory?: number;
  timezoneConfig?: TimezoneConfig;
  screenConfig?: ScreenConfig;
  batteryConfig?: BatteryConfig;
  hardwareConfig?: HardwareConfig;
  languageConfig?: LanguageConfig;
  pluginConfig?: PluginConfig;
  connectionConfig?: ConnectionConfig;
  userAgentConfig?: UserAgentConfig;
  enableLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  features?: {
    canvas?: boolean;
    webgl?: boolean;
    audio?: boolean;
    font?: boolean;
    webrtc?: boolean;
    timezone?: boolean;
    screen?: boolean;
    battery?: boolean;
    hardware?: boolean;
    language?: boolean;
    plugins?: boolean;
    connection?: boolean;
    userAgent?: boolean;
    tcp?: boolean;
    dns?: boolean;
  };
  rotationInterval?: number;
  profile?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'custom';
  engineEmulation?: EngineEmulationConfig;
}

export interface FingerprintProfile {
  name: string;
  options: ProtectionOptions;
}

export interface ProtectedPage extends Page {
  rotateFingerprint?: () => Promise<void>;
  getCurrentFingerprint?: () => ProtectionOptions;
}

export interface ProtectedBrowser extends Browser {
  newProtectedPage: (options?: ProtectionOptions) => Promise<ProtectedPage>;
  protectAllPages: () => Promise<void>;
  getProtectionStats: () => ProtectionStats;
}

export interface ProtectionStats {
  protectedPages: number;
  protectedFrames: number;
  protectedWorkers: number;
  activeSessions: number;
}