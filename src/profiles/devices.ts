import type { BrowserName, DeviceCategory, GpuSpec, OSName } from '../types';

/**
 * Base device descriptor. The fingerprint generator picks one candidate from
 * each list (seeded) and layers deterministic micro-variation on top, so two
 * fingerprints built on the same profile differ realistically while every value
 * within a single fingerprint stays mutually coherent.
 */
export interface DeviceProfile {
  id: string;
  device: DeviceCategory;
  browser: BrowserName;
  os: OSName;
  /** Candidate user-agent strings (one is chosen by seed). */
  userAgents: string[];
  vendor: string;
  platform: string;
  oscpu?: string;
  /** Client-hint platform (`navigator.userAgentData.platform`). */
  uaPlatform?: string;
  /** Full browser version for client hints, e.g. `140.0.7259.5`. */
  uaFullVersion?: string;
  uaMobile: boolean;
  /** Candidate [width, height] screen resolutions. */
  screens: Array<[number, number]>;
  devicePixelRatios: number[];
  hardwareConcurrency: number[];
  deviceMemory: number[];
  maxTouchPoints: number;
  colorDepth: number;
  gpus: GpuSpec[];
  /** Connection profile bias. */
  connection: { effectiveType: '4g' | '3g'; rtt: [number, number]; downlink: [number, number] };
}

const CHROME_GPUS_WIN: GpuSpec[] = [
  {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    unmaskedVendor: 'Google Inc. (NVIDIA)',
    unmaskedRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
  },
  {
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    unmaskedVendor: 'Google Inc. (Intel)',
    unmaskedRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
  },
  {
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 6600 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    unmaskedVendor: 'Google Inc. (AMD)',
    unmaskedRenderer: 'ANGLE (AMD, AMD Radeon RX 6600 Direct3D11 vs_5_0 ps_5_0, D3D11)',
  },
];

const APPLE_GPUS: GpuSpec[] = [
  {
    vendor: 'Google Inc. (Apple)',
    renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)',
    unmaskedVendor: 'Google Inc. (Apple)',
    unmaskedRenderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)',
  },
  {
    vendor: 'Google Inc. (Apple)',
    renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
    unmaskedVendor: 'Google Inc. (Apple)',
    unmaskedRenderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
  },
];

const ANDROID_GPUS: GpuSpec[] = [
  {
    vendor: 'Qualcomm',
    renderer: 'Adreno (TM) 730',
    unmaskedVendor: 'Qualcomm',
    unmaskedRenderer: 'Adreno (TM) 730',
  },
  {
    vendor: 'ARM',
    renderer: 'Mali-G78 MP14',
    unmaskedVendor: 'ARM',
    unmaskedRenderer: 'Mali-G78 MP14',
  },
];

const IOS_GPUS: GpuSpec[] = [
  {
    vendor: 'Apple Inc.',
    renderer: 'Apple GPU',
    unmaskedVendor: 'Apple Inc.',
    unmaskedRenderer: 'Apple GPU',
  },
];

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    id: 'desktop-chrome-win',
    device: 'desktop',
    browser: 'chrome',
    os: 'windows',
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    ],
    vendor: 'Google Inc.',
    platform: 'Win32',
    uaPlatform: 'Windows',
    uaFullVersion: '140.0.7259.5',
    uaMobile: false,
    screens: [
      [1920, 1080],
      [2560, 1440],
      [1366, 768],
      [1536, 864],
    ],
    devicePixelRatios: [1, 1.25, 1.5],
    hardwareConcurrency: [8, 12, 16],
    deviceMemory: [8, 16],
    maxTouchPoints: 0,
    colorDepth: 24,
    gpus: CHROME_GPUS_WIN,
    connection: { effectiveType: '4g', rtt: [50, 150], downlink: [5, 12] },
  },
  {
    id: 'desktop-chrome-mac',
    device: 'desktop',
    browser: 'chrome',
    os: 'macos',
    userAgents: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    ],
    vendor: 'Google Inc.',
    platform: 'MacIntel',
    uaPlatform: 'macOS',
    uaFullVersion: '140.0.7259.5',
    uaMobile: false,
    screens: [
      [2560, 1440],
      [1440, 900],
      [1728, 1117],
      [3024, 1964],
    ],
    devicePixelRatios: [2],
    hardwareConcurrency: [8, 10, 12],
    deviceMemory: [8, 16],
    maxTouchPoints: 0,
    colorDepth: 30,
    gpus: APPLE_GPUS,
    connection: { effectiveType: '4g', rtt: [40, 120], downlink: [6, 14] },
  },
  {
    id: 'desktop-edge-win',
    device: 'desktop',
    browser: 'edge',
    os: 'windows',
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
    ],
    vendor: 'Google Inc.',
    platform: 'Win32',
    uaPlatform: 'Windows',
    uaFullVersion: '140.0.3485.14',
    uaMobile: false,
    screens: [
      [1920, 1080],
      [2560, 1440],
      [1536, 864],
    ],
    devicePixelRatios: [1, 1.25, 1.5],
    hardwareConcurrency: [8, 12, 16],
    deviceMemory: [8, 16],
    maxTouchPoints: 0,
    colorDepth: 24,
    gpus: CHROME_GPUS_WIN,
    connection: { effectiveType: '4g', rtt: [50, 150], downlink: [5, 12] },
  },
  {
    id: 'desktop-firefox-win',
    device: 'desktop',
    browser: 'firefox',
    os: 'windows',
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    ],
    vendor: '',
    platform: 'Win32',
    oscpu: 'Windows NT 10.0; Win64; x64',
    uaMobile: false,
    screens: [
      [1920, 1080],
      [2560, 1440],
      [1366, 768],
    ],
    devicePixelRatios: [1, 1.25, 1.5],
    hardwareConcurrency: [8, 12, 16],
    deviceMemory: [8],
    maxTouchPoints: 0,
    colorDepth: 24,
    gpus: CHROME_GPUS_WIN,
    connection: { effectiveType: '4g', rtt: [50, 150], downlink: [5, 12] },
  },
  {
    id: 'desktop-safari-mac',
    device: 'desktop',
    browser: 'safari',
    os: 'macos',
    userAgents: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
    ],
    vendor: 'Apple Computer, Inc.',
    platform: 'MacIntel',
    uaMobile: false,
    screens: [
      [2560, 1440],
      [1440, 900],
      [1728, 1117],
    ],
    devicePixelRatios: [2],
    hardwareConcurrency: [8, 10],
    deviceMemory: [8],
    maxTouchPoints: 0,
    colorDepth: 30,
    gpus: APPLE_GPUS,
    connection: { effectiveType: '4g', rtt: [40, 120], downlink: [6, 14] },
  },
  {
    id: 'mobile-android-chrome',
    device: 'mobile',
    browser: 'chrome',
    os: 'android',
    userAgents: [
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    ],
    vendor: 'Google Inc.',
    platform: 'Linux armv8l',
    uaPlatform: 'Android',
    uaFullVersion: '140.0.7259.5',
    uaMobile: true,
    screens: [
      [412, 915],
      [360, 800],
      [384, 854],
    ],
    devicePixelRatios: [2.625, 3, 2.75],
    hardwareConcurrency: [8],
    deviceMemory: [8],
    maxTouchPoints: 5,
    colorDepth: 24,
    gpus: ANDROID_GPUS,
    connection: { effectiveType: '4g', rtt: [70, 200], downlink: [4, 10] },
  },
  {
    id: 'mobile-ios-iphone',
    device: 'mobile',
    browser: 'safari',
    os: 'ios',
    userAgents: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
    ],
    vendor: 'Apple Computer, Inc.',
    platform: 'iPhone',
    uaMobile: true,
    screens: [
      [390, 844],
      [393, 852],
      [430, 932],
    ],
    devicePixelRatios: [3],
    hardwareConcurrency: [6],
    deviceMemory: [4],
    maxTouchPoints: 5,
    colorDepth: 32,
    gpus: IOS_GPUS,
    connection: { effectiveType: '4g', rtt: [60, 180], downlink: [5, 12] },
  },
];

export function findProfile(id: string): DeviceProfile | undefined {
  return DEVICE_PROFILES.find(p => p.id === id);
}

export function listProfiles(): string[] {
  return DEVICE_PROFILES.map(p => p.id);
}
