# puppeteer-afp
Stop websites fingerprinting your puppeteer browser instances.

This covers:
Canvas Fingerprinting
WebGL Fingerprinting
AudioContext Fingerprinting
Font Fingerprinting

## Installation

```bash
yarn add puppeteer-afp
# - or -
npm install puppeteer-afp
```
## Usage

```js
const puppeteer = require('puppeteer');
const puppeteerAfp = require('puppeteer-afp');

const browser = await puppeteer.launch();
// I always use this method to get the active page, and not to have to open a new tab
const page = (await this.browser.pages())[0];
// use this instead of the page, to get all the cloaking benefits
const cloakedPage = puppeteerAfp(page);
```

Go to https://webbrowsertools.com with your browser and check your fingerprints

## Creator

**Pavle Aleksic**

- <https://twitter.com/aleksicpaja>

## License
This project is licensed under the terms of the MIT license.
