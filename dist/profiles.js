"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profiles = void 0;
exports.profiles = {
    chrome: {
        name: 'Chrome',
        options: {
            userAgentConfig: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                platform: 'Win32',
                vendor: 'Google Inc.',
                appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            hardwareConfig: {
                hardwareConcurrency: 8,
                deviceMemory: 8
            },
            screenConfig: {
                width: 1920,
                height: 1080,
                availWidth: 1920,
                availHeight: 1040,
                colorDepth: 24,
                pixelDepth: 24
            },
            languageConfig: {
                languages: ['en-US', 'en'],
                language: 'en-US',
                platform: 'Win32'
            },
            webglData: {
                7936: 'WebKit',
                37445: 'Google Inc. (Intel)',
                37446: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
            },
            engineEmulation: {
                javascript: true,
                css: true,
                dom: true,
                hardware: true,
                network: true
            }
        }
    },
    firefox: {
        name: 'Firefox',
        options: {
            userAgentConfig: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                platform: 'Win32',
                vendor: '',
                appVersion: '5.0 (Windows)'
            },
            hardwareConfig: {
                hardwareConcurrency: 8,
                deviceMemory: 8
            },
            screenConfig: {
                width: 1920,
                height: 1080,
                availWidth: 1920,
                availHeight: 1040,
                colorDepth: 24,
                pixelDepth: 24
            },
            languageConfig: {
                languages: ['en-US', 'en'],
                language: 'en-US',
                platform: 'Win32'
            },
            webglData: {
                7936: 'Mozilla',
                37445: 'Mozilla',
                37446: 'Intel Open Source Technology Center',
            },
            engineEmulation: {
                javascript: true,
                css: true,
                dom: true,
                hardware: true,
                network: true
            }
        }
    },
    safari: {
        name: 'Safari',
        options: {
            userAgentConfig: {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
                platform: 'MacIntel',
                vendor: 'Apple Computer, Inc.',
                appVersion: '5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
            },
            hardwareConfig: {
                hardwareConcurrency: 8,
                deviceMemory: 16
            },
            screenConfig: {
                width: 2560,
                height: 1440,
                availWidth: 2560,
                availHeight: 1415,
                colorDepth: 30,
                pixelDepth: 30
            },
            languageConfig: {
                languages: ['en-US'],
                language: 'en-US',
                platform: 'MacIntel'
            },
            webglData: {
                7936: 'WebKit',
                37445: 'Apple Inc.',
                37446: 'Apple GPU',
            },
            engineEmulation: {
                javascript: true,
                css: true,
                dom: true,
                hardware: true,
                network: true
            }
        }
    },
    edge: {
        name: 'Edge',
        options: {
            userAgentConfig: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
                platform: 'Win32',
                vendor: 'Google Inc.',
                appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
            },
            hardwareConfig: {
                hardwareConcurrency: 8,
                deviceMemory: 8
            },
            screenConfig: {
                width: 1920,
                height: 1080,
                availWidth: 1920,
                availHeight: 1040,
                colorDepth: 24,
                pixelDepth: 24
            },
            languageConfig: {
                languages: ['en-US', 'en'],
                language: 'en-US',
                platform: 'Win32'
            },
            webglData: {
                7936: 'WebKit',
                37445: 'Google Inc. (Intel)',
                37446: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
            },
            engineEmulation: {
                javascript: true,
                css: true,
                dom: true,
                hardware: true,
                network: true
            }
        }
    }
};
//# sourceMappingURL=profiles.js.map