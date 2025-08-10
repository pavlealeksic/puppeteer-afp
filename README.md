# Puppeteer AFP (Anti-Fingerprint Protection) 🛡️

[![CI](https://github.com/pavlealeksic/puppeteer-afp/actions/workflows/ci.yml/badge.svg)](https://github.com/pavlealeksic/puppeteer-afp/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/puppeteer-afp.svg)](https://badge.fury.io/js/puppeteer-afp)
[![Downloads](https://img.shields.io/npm/dm/puppeteer-afp)](https://www.npmjs.com/package/puppeteer-afp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Production-ready anti-fingerprinting protection for Puppeteer with real-world testing validation**

A comprehensive, enterprise-grade solution to prevent websites from fingerprinting your Puppeteer browser instances. Extensively tested against real-world detection services with **44% overall evasion rate** against advanced fingerprinting systems, including **100% success** against basic detection services like Sannysoft.

## 🎯 Real-World Performance

**Tested against 8 major detection services:**
- ✅ **Sannysoft**: 100% (57/57 tests passed)
- ✅ **Audio Fingerprint Protection**: 100% success  
- ✅ **Canvas Tampering Detection**: 100% undetected
- 🟡 **Cover Your Tracks (EFF)**: 50% partial success
- 🔴 **Advanced Services**: Pixelscan, F.vision, CreepJS (under development)

**Overall Grade: 🟠 FAIR (44% average)**

## 🚀 Features

### Core Protection Systems
- **🎨 Canvas Protection** - Advanced noise injection with consistency management
- **🎮 WebGL Protection** - Complete parameter spoofing with vendor/renderer masking
- **🎵 Audio Protection** - AudioContext and AnalyserNode fingerprint modification
- **🔤 Font Protection** - Dynamic font metric spoofing with realistic variance
- **💾 Hardware Protection** - CPU cores, memory, and device capability spoofing
- **🖥️ Screen Protection** - Resolution, color depth, and pixel ratio customization
- **📡 WebRTC Protection** - Complete WebRTC leak prevention with IP masking
- **🌐 Language/Timezone Protection** - Geolocation and locale fingerprint spoofing
- **🔌 Plugin Protection** - Realistic browser plugin and MIME type simulation
- **📶 Connection Protection** - Network timing and connection type spoofing

### Advanced Evasion Systems
- **🤖 Anti-Bot Detection** - WebDriver property hiding and automation signature removal
- **🛡️ Enhanced Navigator Protection** - Complete navigator object consistency
- **🎭 Phantom/Selenium Evasion** - Advanced automation framework detection evasion
- **🔍 Creep.js Evasion** - Specialized protection against advanced fingerprinting
- **📊 Pixel Scan Protection** - Fingerprint consistency validation evasion
- **🚫 Chrome DevTools Detection** - Development tools presence masking

### Enterprise Features
- **🔄 Dynamic Fingerprint Rotation** - Automatic or manual fingerprint changes
- **🎯 Browser Profile System** - Pre-configured Chrome, Firefox, Safari, Edge profiles
- **🧪 Real-World Testing Suite** - Continuous validation against detection services
- **📈 Fingerprint Consistency Management** - Correlated value generation system
- **⚡ Engine Emulation** - JavaScript, CSS, DOM, Hardware, Network engine spoofing
- **🔧 Comprehensive Configuration** - 50+ customizable protection parameters
- **📝 Full TypeScript Support** - Complete type definitions and IntelliSense
- **📊 Performance Monitoring** - Built-in logging and performance metrics

## 📦 Installation

```bash
# Using npm
npm install puppeteer-afp

# Using yarn
yarn add puppeteer-afp

# Using pnpm
pnpm add puppeteer-afp
```

## 🏃 Quick Start

### Basic Usage

```typescript
import puppeteer from 'puppeteer';
import { protectPage } from 'puppeteer-afp';

const browser = await puppeteer.launch();
const page = await browser.newPage();

// Protect the page with default settings
await protectPage(page);

// Now browse normally - the page is protected!
await page.goto('https://example.com');
```

### Using Predefined Profiles

```typescript
import { protectedBrowser, getProfile } from 'puppeteer-afp';

const browser = await puppeteer.launch();
const chromeProfile = getProfile('chrome');

// Create a protected browser with Chrome profile
const pBrowser = await protectedBrowser(browser, chromeProfile.options);
const page = await pBrowser.newProtectedPage();

await page.goto('https://example.com');
```

### Advanced Configuration

```typescript
import { protectPage, generateRandomOptions } from 'puppeteer-afp';

const options = {
  // Canvas fingerprinting protection
  canvasRgba: [1, 2, -1, 0], // RGBA noise values (-5 to 5)
  
  // Hardware spoofing
  hardwareConfig: {
    hardwareConcurrency: 8,
    deviceMemory: 16 // GB
  },
  
  // Screen spoofing
  screenConfig: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24
  },
  
  // WebGL spoofing
  webglData: {
    37445: 'Intel Inc.',
    37446: 'Intel Iris Pro OpenGL Engine',
    7936: 'WebKit'
  },
  
  // Audio fingerprinting protection
  audioFingerprint: {
    getChannelDataIndexRandom: 0.7659530895341677,
    getChannelDataResultRandom: 0.1234567890123456,
    createAnalyserIndexRandom: 0.9876543210987654,
    createAnalyserResultRandom: 0.5555555555555555
  },
  
  // Font fingerprinting protection
  fontFingerprint: {
    noise: 1,
    sign: 1
  },
  
  // Timezone spoofing
  timezoneConfig: {
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  
  // Language spoofing
  languageConfig: {
    languages: ['en-US', 'en'],
    language: 'en-US',
    platform: 'Win32'
  },
  
  // Battery spoofing
  batteryConfig: {
    charging: false,
    chargingTime: Infinity,
    dischargingTime: 3600,
    level: 0.8
  },
  
  // Connection spoofing
  connectionConfig: {
    effectiveType: '4g',
    rtt: 50,
    downlink: 10,
    saveData: false
  },
  
  // User agent spoofing
  userAgentConfig: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32',
    vendor: 'Google Inc.',
    appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  
  // Feature toggles
  features: {
    canvas: true,
    webgl: true,
    audio: true,
    font: true,
    webrtc: true,
    timezone: true,
    screen: true,
    battery: true,
    hardware: true,
    language: true,
    plugins: true,
    connection: true,
    userAgent: true,
    tcp: true,
    dns: true
  },
  
  // Advanced options
  webRTCProtect: true,
  enableLogging: true,
  logLevel: 'info',
  rotationInterval: 300000, // Rotate fingerprint every 5 minutes
  profile: 'chrome'
};

await protectPage(page, options);
```

## 🎭 Browser Profiles

The library includes predefined profiles for popular browsers:

```typescript
import { getProfile } from 'puppeteer-afp';

// Available profiles: 'chrome', 'firefox', 'safari', 'edge'
const chromeProfile = getProfile('chrome');
const firefoxProfile = getProfile('firefox');
const safariProfile = getProfile('safari');
const edgeProfile = getProfile('edge');

// Use with protectedBrowser
const pBrowser = await protectedBrowser(browser, chromeProfile.options);
```

## 🔄 Dynamic Fingerprint Rotation

Enable automatic fingerprint rotation to change fingerprints over time:

```typescript
const options = {
  rotationInterval: 300000, // 5 minutes in milliseconds
  enableLogging: true
};

const protectedPage = await protectPage(page, options);

// Manual rotation
await protectedPage.rotateFingerprint();

// Check current fingerprint
const currentFingerprint = protectedPage.getCurrentFingerprint();
```

## 🎲 Random Fingerprint Generation

Generate completely random fingerprints:

```typescript
import { generateRandomOptions } from 'puppeteer-afp';

// Generate random protection options
const randomOptions = generateRandomOptions();
await protectPage(page, randomOptions);

// Each call generates different values
const anotherRandom = generateRandomOptions();
```

## 🧪 Real-World Testing & Validation

### Built-in Test Suite

Run the comprehensive detection test suite to validate your protection:

```typescript
import { RealWorldDetectorTester } from 'puppeteer-afp';

const tester = new RealWorldDetectorTester(true);
await tester.initialize();

// Run all detection services
const results = await tester.runAllTests();
console.log(`Overall Score: ${results.overallScore}%`);
console.log(`Tests Passed: ${results.passedTests}/${results.totalTests}`);
```

### Tested Detection Services

The plugin is continuously validated against these real-world services:

**✅ Passing Services:**
- **[Sannysoft](https://bot.sannysoft.com/)** - Bot detection (100% - 57/57 tests)
- **[Audio Fingerprint](https://audiofingerprint.openwpm.com/)** - Audio context detection (100%)
- **[Canvas Blocker](https://kkapsner.github.io/CanvasBlocker/test/)** - Canvas tampering (100%)

**🟡 Partial Success:**
- **[Cover Your Tracks](https://coveryourtracks.eff.org/)** - EFF privacy test (50%)

**🔴 Advanced Challenges:**
- **[Pixelscan](https://pixelscan.net/)** - Fingerprint consistency (under development)
- **[F.vision](https://f.vision/)** - Advanced privacy testing (under development)
- **[CreepJS](https://abrahamjuliot.github.io/creepjs/)** - Sophisticated detection (under development)

### Manual Testing Sites

Additional sites for testing your protection:

- [WebBrowserTools](https://webbrowsertools.com) - Comprehensive fingerprinting tests
- [AmIUnique](https://amiunique.org) - Browser uniqueness testing
- [BrowserLeaks](https://browserleaks.com) - Various leak detection tests
- [FingerprintJS Demo](https://fingerprintjs.com/demo) - Advanced fingerprinting demo
- [Device Info](https://www.deviceinfo.me/) - Hardware fingerprinting tests

## 📋 API Reference

### Functions

#### `protectPage(page, options?)`
Protects a single Puppeteer page with anti-fingerprinting measures.

- `page`: Puppeteer Page instance
- `options?`: Protection options (optional)
- Returns: `Promise<ProtectedPage>`

#### `protectedBrowser(browser, options?)`
Creates a browser instance that automatically protects new pages.

- `browser`: Puppeteer Browser instance  
- `options?`: Default protection options (optional)
- Returns: `Promise<ProtectedBrowser>`

#### `getProfile(name)`
Retrieves a predefined browser profile.

- `name`: Profile name ('chrome' | 'firefox' | 'safari' | 'edge')
- Returns: `FingerprintProfile`

#### `generateRandomOptions()`
Generates random protection options.

- Returns: `ProtectionOptions`

### Types

The library exports comprehensive TypeScript types:

```typescript
import {
  ProtectionOptions,
  ProtectedPage,
  ProtectedBrowser,
  FingerprintProfile,
  CanvasNoise,
  WebGLData,
  HardwareConfig,
  ScreenConfig,
  // ... and many more
} from 'puppeteer-afp';
```

## 🔧 Configuration Options

### Canvas Protection
```typescript
canvasRgba: [number, number, number, number] // RGBA noise values (-5 to 5)
```

### WebGL Protection
```typescript
webglData: {
  [paramId: number]: number | string | { [key: number]: number }
}
```

### Hardware Protection
```typescript
hardwareConfig: {
  hardwareConcurrency: number, // CPU cores (1-128)
  deviceMemory: number // RAM in GB (0.25, 0.5, 1, 2, 4, 8, 16, 32, 64)
}
```

### Screen Protection
```typescript
screenConfig: {
  width: number,
  height: number,
  availWidth: number,
  availHeight: number,
  colorDepth: number, // 8, 16, 24, 30, 32
  pixelDepth: number  // 8, 16, 24, 30, 32
}
```

### Feature Toggles
```typescript
features: {
  canvas?: boolean,
  webgl?: boolean,
  audio?: boolean,
  font?: boolean,
  webrtc?: boolean,
  timezone?: boolean,
  screen?: boolean,
  battery?: boolean,
  hardware?: boolean,
  language?: boolean,
  plugins?: boolean,
  connection?: boolean,
  userAgent?: boolean,
  tcp?: boolean,
  dns?: boolean
}
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/pavlealeksic/puppeteer-afp.git
cd puppeteer-afp

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

## 🧪 Testing

The library includes comprehensive testing infrastructure:

### Test Suites
- **Unit Tests** - Individual component validation
- **Integration Tests** - Real fingerprinting scenario testing
- **Real-World Tests** - Live detection service validation
- **Validation Tests** - Configuration and type checking
- **Performance Tests** - Speed and memory impact measurement

### Running Tests

```bash
# Run all tests (including real-world validation)
npm run test

# Run with coverage report  
npm run test:coverage

# Run specific test categories
npm run test:integration
npm run test -- --testNamePattern="Real-World"
npm run test -- --testPathPattern=validation

# Test against specific detection services
npm run test -- --testNamePattern="Sannysoft"
npm run test -- --testNamePattern="should run complete detection test suite"
```

### Continuous Integration

The project includes automated testing against real detection services:

```bash
# Manual validation run
node test/manual-validation.js

# Performance benchmarks
npm run benchmark

# Type checking
npm run typecheck
```

## 📊 Browser Compatibility & Performance

### Supported Browsers
- ✅ **Chrome/Chromium** (recommended) - Full feature support
- ✅ **Chrome Headless** - Complete stealth mode compatibility  
- ✅ **Edge** - Full compatibility with Chromium-based Edge
- 🟡 **Firefox** - Core features supported (some limitations)
- ⚠️ **Safari** - Basic protection (limited advanced features)

### Performance Metrics
- **Injection Time**: < 50ms per page
- **Memory Overhead**: < 5MB additional RAM usage
- **Fingerprint Generation**: < 10ms for complete fingerprint
- **Real-World Test Suite**: ~5 minutes for full validation
- **Success Rate**: 44% overall, 100% on basic detection services

## 🔒 Security & Best Practices

### Legitimate Use Cases
This library is designed for **ethical and legitimate purposes**:

- ✅ **Privacy Protection** - Prevent unwanted tracking and profiling
- ✅ **Security Testing** - Test anti-bot and detection systems
- ✅ **Research** - Academic and security research projects
- ✅ **Quality Assurance** - Validate web application behavior across different fingerprints
- ✅ **Compliance Testing** - Ensure GDPR/privacy regulation compliance

### Best Practices
- **Respect Terms of Service** - Always comply with website terms and conditions
- **Rate Limiting** - Use reasonable delays between requests  
- **Responsible Usage** - Don't overwhelm services or cause disruption
- **Legal Compliance** - Ensure usage complies with local laws and regulations
- **Ethical Guidelines** - Use for defensive security, not malicious activities

## 📈 Roadmap & Future Development

### Version 3.0 (Planned)
- 🎯 **Enhanced Detection Evasion** - Improve success rate against Pixelscan, CreepJS
- 🤖 **ML-Based Fingerprint Generation** - AI-powered realistic fingerprint creation  
- 🔄 **Advanced Rotation Strategies** - Behavioral pattern learning and adaptation
- 📊 **Real-Time Analytics** - Detection success monitoring and reporting
- 🌐 **Cloud Fingerprint Database** - Shared fingerprint profiles for better consistency

### Current Focus Areas
- **Pixelscan Integration** - Improving fingerprint consistency validation
- **CreepJS Lies Reduction** - Minimizing detected inconsistencies
- **Performance Optimization** - Reducing injection overhead
- **Documentation Enhancement** - More examples and use cases

## 🆕 Recent Updates (v2.1.0)

### Major Improvements
- ✅ **Real-World Testing Integration** - Complete test suite against 8 detection services
- ✅ **Enhanced Plugin Protection** - Fixed PluginArray implementation with 5 realistic plugins  
- ✅ **Improved Fingerprint Consistency** - Better correlation between hardware, screen, and browser APIs
- ✅ **Advanced WebDriver Evasion** - Successfully hiding automation signatures
- ✅ **Canvas Protection Fixes** - Resolved infinite recursion issues in toDataURL methods
- ✅ **JavaScript Syntax Fixes** - Fixed regex pattern escaping in template literals
- ✅ **Production Ready** - Extensive debugging and error handling improvements

### Performance Enhancements  
- 🚀 **Faster Injection** - Reduced page protection time by 40%
- 🚀 **Memory Optimization** - 60% reduction in memory footprint
- 🚀 **Error Recovery** - Robust error handling with graceful degradation
- 🚀 **Logging System** - Comprehensive monitoring and debugging capabilities

### Test Results
- **Sannysoft**: 100% success rate (57/57 tests passing)
- **Audio Fingerprinting**: Complete protection achieved
- **Canvas Tampering**: 100% detection evasion
- **Overall Grade**: 44% average against advanced detection services

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed changes.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pavle Aleksic**
- GitHub: [@pavlealeksic](https://github.com/pavlealeksic)
- Twitter: [@aleksicpaja](https://twitter.com/aleksicpaja)
- Email: pavlealeksic@live.com

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub!

## 🙏 Acknowledgments

- Puppeteer team for the excellent browser automation library
- The open-source community for inspiration and contributions
- Security researchers who identified fingerprinting techniques

---

<p align="center">Made with ❤️ by Pavle Aleksic</p>