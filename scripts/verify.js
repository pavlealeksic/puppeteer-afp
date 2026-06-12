/* Comprehensive live verification across multiple identities. Exercises every
   module in real headless Chromium. Not shipped. Run: node scripts/verify.js */
const puppeteer = require('puppeteer');
const { protectPage, generateFingerprint } = require('../dist');

const ASSERT_TZ_DATE = '2025-01-15T12:00:00Z'; // EST window → offset +300

async function readState(page) {
  return page.evaluate(async (tzIso) => {
    function safe(fn) { try { return fn(); } catch (e) { return '<<err:' + e.message + '>>'; } }
    const d = new Date(tzIso);
    const canvas1 = safe(() => {
      const c = document.createElement('canvas'); c.width = 80; c.height = 30;
      const ctx = c.getContext('2d'); ctx.textBaseline = 'top'; ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#069'; ctx.fillText('afp-check', 2, 2);
      return c.toDataURL();
    });
    const canvas2 = safe(() => {
      const c = document.createElement('canvas'); c.width = 80; c.height = 30;
      const ctx = c.getContext('2d'); ctx.textBaseline = 'top'; ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#069'; ctx.fillText('afp-check', 2, 2);
      return c.toDataURL();
    });
    const rect1 = safe(() => { const r = document.body.getBoundingClientRect(); return r.width; });
    const rect2 = safe(() => { const r = document.body.getBoundingClientRect(); return r.width; });
    // Worker realm probe
    const workerCores = await new Promise((resolve) => {
      try {
        const code = 'self.onmessage=function(){postMessage({cores:navigator.hardwareConcurrency,ua:navigator.userAgent});};';
        const url = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
        const wk = new Worker(url);
        wk.onmessage = (e) => resolve(e.data);
        wk.onerror = () => resolve({ err: true });
        wk.postMessage('go');
        setTimeout(() => resolve({ err: 'timeout' }), 4000);
      } catch (e) { resolve({ err: e.message }); }
    });
    // WebRTC candidate probe (no STUN → host mDNS only; assert no raw IPv4 leaks)
    const webrtc = await new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        const lines = [];
        pc.onicecandidate = (e) => {
          if (e.candidate) lines.push(e.candidate.candidate);
          else resolve({ lines });
        };
        pc.createDataChannel('x');
        pc.createOffer().then((o) => pc.setLocalDescription(o));
        setTimeout(() => resolve({ lines, timeout: true }), 3000);
      } catch (e) { resolve({ err: e.message }); }
    });
    const rawIpv4 = (webrtc.lines || []).some((l) => /((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)/.test(l) && !/0\.0\.0\.0/.test(l));
    return {
      workerCores: workerCores.cores,
      webrtcNoRawIp: !rawIpv4,
      canPlayWebm: safe(() => document.createElement('video').canPlayType('video/webm; codecs="vp9"')),
      canPlayHevc: safe(() => document.createElement('video').canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"')),
      canPlayMp4: safe(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"')),
      webdriver: navigator.webdriver,
      webdriverInNav: 'webdriver' in navigator,
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      languages: navigator.languages,
      hasUaData: 'userAgentData' in navigator,
      uaBrands: safe(() => navigator.userAgentData ? navigator.userAgentData.brands.map((b) => b.brand) : null),
      uaHighEntropy: await safe(() => navigator.userAgentData
        ? navigator.userAgentData.getHighEntropyValues(['architecture', 'platformVersion']).then((v) => v.architecture)
        : Promise.resolve(null)),
      hasChrome: typeof window.chrome === 'object' && window.chrome !== null,
      hasConnection: 'connection' in navigator && navigator.connection != null,
      connRtt: safe(() => navigator.connection ? navigator.connection.rtt : null),
      hasGetBattery: typeof navigator.getBattery === 'function',
      batteryLevel: await safe(() => navigator.getBattery ? navigator.getBattery().then((b) => b.level) : Promise.resolve(null)),
      pluginsLen: navigator.plugins.length,
      mediaDevices: await safe(() => navigator.mediaDevices
        ? navigator.mediaDevices.enumerateDevices().then((ds) => ds.length)
        : Promise.resolve(0)),
      permNotif: await safe(() => navigator.permissions
        ? navigator.permissions.query({ name: 'notifications' }).then((r) => r.state)
        : Promise.resolve(null)),
      voices: safe(() => (window.speechSynthesis ? speechSynthesis.getVoices().length : 0)),
      tz: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
      tzOffset: d.getTimezoneOffset(),
      screenW: screen.width,
      ontouchstart: 'ontouchstart' in window,
      webglRenderer: safe(() => {
        const gl = document.createElement('canvas').getContext('webgl');
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      }),
      audioOk: safe(() => typeof (new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 4410, 44100)).startRendering === 'function'),
      canvasConsistent: canvas1 === canvas2 && canvas1.length > 100,
      rectConsistent: rect1 === rect2,
      // stealth
      toStringNative: /\[native code\]/.test(HTMLCanvasElement.prototype.toDataURL.toString())
        && /\[native code\]/.test(Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent').get.toString())
        && /\[native code\]/.test(Function.prototype.toString.toString()),
      noGlobalLeak: !('afp' in window) && !('FP' in window)
        && Object.getOwnPropertyNames(window).filter((n) => /afp|__fp/i.test(n)).length === 0,
      webdriverIsOwn: Object.prototype.hasOwnProperty.call(navigator, 'webdriver'),
    };
  }, ASSERT_TZ_DATE);
}

function check(results, name, cond) {
  results.push([name, !!cond]);
}

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  let totalPass = 0, totalChecks = 0;
  try {
    // ---- Chrome desktop ----
    {
      const fp = generateFingerprint({ seed: 'verify-chrome', profile: 'desktop-chrome-win' });
      const page = await browser.newPage();
      await protectPage(page, { fingerprint: fp });
      await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
      const s = await readState(page);
      const r = [];
      check(r, 'webdriver false', s.webdriver === false);
      check(r, "'webdriver' in navigator", s.webdriverInNav === true);
      check(r, 'webdriver not own-prop', s.webdriverIsOwn === false);
      check(r, 'UA matches', s.userAgent === fp.navigator.userAgent);
      check(r, 'platform matches', s.platform === fp.hardware.platform);
      check(r, 'cores match', s.cores === fp.hardware.hardwareConcurrency);
      check(r, 'deviceMemory present', s.deviceMemory === fp.hardware.deviceMemory);
      check(r, 'languages match', JSON.stringify(s.languages) === JSON.stringify(fp.geo.languages));
      check(r, 'userAgentData present', s.hasUaData === true);
      check(r, 'uaData brands include Chromium', Array.isArray(s.uaBrands) && s.uaBrands.includes('Chromium'));
      check(r, 'getHighEntropyValues works', s.uaHighEntropy === 'x86');
      check(r, 'window.chrome present', s.hasChrome === true);
      check(r, 'connection present', s.hasConnection === true);
      check(r, 'connection.rtt spoofed', s.connRtt === fp.connection.rtt);
      check(r, 'getBattery works', s.batteryLevel === fp.battery.level);
      check(r, 'plugins present', s.pluginsLen > 0);
      check(r, 'mediaDevices enumerated', s.mediaDevices > 0);
      check(r, 'permissions notif coherent', s.permNotif === 'prompt' || s.permNotif === 'denied');
      check(r, 'speech voices present', s.voices > 0);
      check(r, 'timezone spoofed', s.tz === fp.geo.timezone);
      check(r, 'getTimezoneOffset correct (+300 EST)', s.tzOffset === 300);
      check(r, 'screen spoofed', s.screenW === fp.screen.width);
      check(r, 'webgl renderer spoofed', s.webglRenderer === fp.gpu.unmaskedRenderer);
      check(r, 'audio context ok', s.audioOk === true);
      check(r, 'canvas read consistent', s.canvasConsistent === true);
      check(r, 'clientRect consistent', s.rectConsistent === true);
      check(r, 'toString cloaked native', s.toStringNative === true);
      check(r, 'no global leak (afp/FP)', s.noGlobalLeak === true);
      check(r, 'worker cores match (no realm leak)', s.workerCores === fp.hardware.hardwareConcurrency);
      check(r, 'webrtc leaks no raw IP', s.webrtcNoRawIp === true);
      check(r, 'codecs native (chromium webm)', s.canPlayWebm === 'probably');
      report('Chrome desktop', r); totalChecks += r.length; totalPass += r.filter((x) => x[1]).length;
      await page.close();
    }

    // ---- Firefox desktop (Chromium-only APIs must be stripped) ----
    {
      const fp = generateFingerprint({ seed: 'verify-ff', profile: 'desktop-firefox-win' });
      const page = await browser.newPage();
      await protectPage(page, { fingerprint: fp });
      await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
      const s = await readState(page);
      const r = [];
      check(r, 'UA is Firefox', /Firefox/.test(s.userAgent) && s.userAgent === fp.navigator.userAgent);
      check(r, 'vendor empty', s.vendor === '');
      check(r, 'userAgentData stripped', s.hasUaData === false);
      check(r, 'deviceMemory stripped', s.deviceMemory === undefined);
      check(r, 'connection stripped', s.hasConnection === false);
      check(r, 'getBattery stripped', s.hasGetBattery === false);
      // window.chrome is a non-configurable property Chromium installs before any
      // injected script — it cannot be removed. Documented known limitation.
      if (s.hasChrome) console.log('  NOTE  window.chrome present (inherent Chromium-engine limitation)');
      check(r, 'webdriver false', s.webdriver === false);
      check(r, 'timezone spoofed', s.tz === fp.geo.timezone);
      check(r, 'webgl renderer spoofed', s.webglRenderer === fp.gpu.unmaskedRenderer);
      check(r, 'toString cloaked native', s.toStringNative === true);
      check(r, 'no global leak', s.noGlobalLeak === true);
      check(r, 'worker cores match (no realm leak)', s.workerCores === fp.hardware.hardwareConcurrency);
      check(r, 'codecs: HEVC unsupported (firefox)', s.canPlayHevc === '');
      report('Firefox desktop', r); totalChecks += r.length; totalPass += r.filter((x) => x[1]).length;
      await page.close();
    }

    // ---- iOS mobile ----
    {
      const fp = generateFingerprint({ seed: 'verify-ios', profile: 'mobile-ios-iphone' });
      const page = await browser.newPage();
      await protectPage(page, { fingerprint: fp });
      await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
      const s = await readState(page);
      const r = [];
      check(r, 'platform iPhone', s.platform === 'iPhone');
      check(r, 'maxTouchPoints > 0', s.maxTouchPoints === fp.hardware.maxTouchPoints && s.maxTouchPoints > 0);
      check(r, 'ontouchstart present', s.ontouchstart === true);
      check(r, 'userAgentData stripped (safari)', s.hasUaData === false);
      check(r, 'deviceMemory stripped', s.deviceMemory === undefined);
      check(r, 'getBattery stripped', s.hasGetBattery === false);
      check(r, 'UA is iPhone Safari', /iPhone/.test(s.userAgent));
      check(r, 'canvas consistent', s.canvasConsistent === true);
      check(r, 'worker cores match (no realm leak)', s.workerCores === fp.hardware.hardwareConcurrency);
      check(r, 'codecs: WebM unsupported (safari)', s.canPlayWebm === '');
      check(r, 'codecs: HEVC supported (safari)', s.canPlayHevc === 'probably');
      report('iOS mobile', r); totalChecks += r.length; totalPass += r.filter((x) => x[1]).length;
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`\n==== ${totalPass}/${totalChecks} checks passed ====`);
  process.exitCode = totalPass === totalChecks ? 0 : 1;
}

function report(title, r) {
  console.log(`\n--- ${title} ---`);
  for (const [name, ok] of r) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
}

run().catch((e) => { console.error(e); process.exit(2); });
