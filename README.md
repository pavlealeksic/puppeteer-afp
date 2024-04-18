# puppeteer-afp
Stop websites fingerprinting your puppeteer browser instances.

This covers:
Canvas Fingerprinting, WebGL Fingerprinting, AudioContext Fingerprinting, Font Fingerprinting

## Installation

```bash
yarn add puppeteer-afp
# - or -
npm install puppeteer-afp
```
## Usage

```js
const puppeteer = require('puppeteer');
const {
    protectPage,
    protectedBrowser,
} = require('puppeteer-afp');

const browser = await puppeteer.launch();
// I always use this method to get the active page, and not to have to open a new tab
const pageToProtect = (await browser.pages())[0];
// For these options, all are optional, and you dont have to use them, 
// these are used just if you want to reuse a fingerprint
const options = {
        canvasRgba: [0, 0, 0, 0], //all these numbers can be from -5 to 5
        webglData: {
            3379: 32768, //16384, 32768
            3386: {
                0: 32768, // 8192, 16384, 32768
                1: 32768, // 8192, 16384, 32768
            },
            3410: 2, // 2, 4, 8, 16
            3411: 2, // 2, 4, 8, 16
            3412: 16, // 2, 4, 8, 16
            3413: 2, // 2, 4, 8, 16
            7938: "WebGL 1.0 (OpenGL Chromium)", // "WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"
            33901: {
                0: 1,
                1: 1, // 1, 1024, 2048, 4096, 8192
            },
            33902: {
                0: 1,
                1: 4096, // 1, 1024, 2048, 4096, 8192
            },
            34024: 32768, //16384, 32768
            34047: 8, // 2, 4, 8, 16
            34076: 16384, //16384, 32768
            34921: 16, // 2, 4, 8, 16
            34930: 16, // 2, 4, 8, 16
            35660: 2, // 2, 4, 8, 16
            35661: 32, // 16, 32, 64, 128, 256
            35724: "WebGL GLSL ES", // "WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium)"
            36347: 4096, // 4096, 8192
            36349: 8192, // 1024, 2048, 4096, 8192
            37446: "HD Graphics", // "Graphics", "HD Graphics", "Intel(R) HD Graphics"
        },
        fontFingerprint: {
            noise: 1, // -1, 0, 1, 2
            sign: +1, // -1, +1
        },
        audioFingerprint: {
            getChannelDataIndexRandom: 0.7659530895341677, // all values of Math.random() can be used
            getChannelDataResultRandom: 0.7659530895341677, // all values of Math.random() can be used
            createAnalyserIndexRandom: 0.7659530895341677, // all values of Math.random() can be used
            createAnalyserResultRandom: 0.7659530895341677, // all values of Math.random() can be used
        },
        webRTCProtect: true //this option is used to disable or enable WebRTC disabling by destroying get user media
    };
// run this function on any page you want to protect, so pages loaded on 
// this page after this is done will be protected
await protectPage(pageToProtect, options);

//Another way of using it is to protect automatically a new tab, 
//and if you want the fingerprint to change, just remove the options parameter:
const protectedChromium = await protectedBrowser(browser, options);
//and then we use the following command:
const protectedPage = protectedChromium.newProtectedPage()

```

Go to https://webbrowsertools.com with your browser and check your fingerprints

## Creator

**Pavle Aleksic**

- <https://twitter.com/aleksicpaja>

## License
This project is licensed under the terms of the MIT license.
