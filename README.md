# puppeteer-afp 🛡️

> Coherent, persistable anti-fingerprinting for Puppeteer.

**One seed → one internally-coherent browser identity.** Persist the seed (or the
whole fingerprint) and you reproduce the *exact same* browser across sessions.
The coherence engine derives timezone, locale, WebRTC IP and geolocation from a
proxy's egress IP so nothing ever contradicts — the cross-checks that detectors
like CreepJS rely on simply line up.

```bash
npm install puppeteer-afp
```

> Requires Node ≥ 18 and `puppeteer` (peer dependency) ≥ 10. Zero runtime
> dependencies.

---

## Why v3 is different

| | v3 (this) | typical stealth plugins |
| --- | --- | --- |
| **Coherence** | Every value derives from one seed; timezone/locale/IP/GPU never disagree | Independent patches that can contradict |
| **Persistence** | Built-in **fingerprint vault** — reload an identity verbatim next session | None / DIY |
| **Proxy awareness** | Auto-derives geo/timezone/WebRTC-IP from the proxy egress IP | None |
| **Stealth runtime** | Single `Function.prototype.toString` trap; properties patched on their real prototype; `Proxy`-preserved `name`/`length` | Often leak via `toString`, own-properties, or `Object.keys` overrides |
| **Footprint** | No `window.*` markers — toolkit lives in closure scope | Frequently leaves global hooks |

## Quick start

```ts
import puppeteer from 'puppeteer';
import { protectPage } from 'puppeteer-afp';

const browser = await puppeteer.launch();
const page = await browser.newPage();

await protectPage(page, { profile: 'desktop-chrome-win' });

await page.goto('https://abrahamjuliot.github.io/creepjs/');
```

`protectPage` applies both **CDP-level emulation** (user-agent + Client Hints at
the network layer, timezone, geolocation, viewport) **and** the in-page JS patch,
so the spoof is consistent from the HTTP headers all the way to `navigator`.

## Persistent identity (the vault)

```ts
import { protectPage, FingerprintVault, generateFingerprint } from 'puppeteer-afp';

const vault = new FingerprintVault(); // ~/.puppeteer-afp by default

// Same identity every run for this account:
const fingerprint = vault.loadOrCreate('account-42', () =>
  generateFingerprint({ seed: 'account-42', profile: 'desktop-chrome-mac' }),
);

await protectPage(page, { fingerprint });
```

## Proxy + geo coherence

```ts
// Timezone, locale, languages, geolocation and the WebRTC public IP are all
// resolved from the proxy's egress IP — automatically.
await protectPage(page, { proxy: 'http://user:pass@host:8080' });
```

Prefer to set it explicitly / offline? Use a country:

```ts
import { geoFromCountry } from 'puppeteer-afp';
await protectPage(page, { geo: geoFromCountry('DE') }); // Europe/Berlin, de-DE …
```

## Whole-browser protection

```ts
import { protectedBrowser } from 'puppeteer-afp';

const pb = await protectedBrowser(browser, { profile: 'mobile-ios-iphone' });
const page = await pb.newProtectedPage();   // shares the identity
// Pop-ups / window.open targets are auto-protected too.
```

## Profiles

`desktop-chrome-win` · `desktop-chrome-mac` · `desktop-edge-win` ·
`desktop-firefox-win` · `desktop-safari-mac` · `mobile-android-chrome` ·
`mobile-ios-iphone`

```ts
import { listProfiles } from 'puppeteer-afp';
listProfiles();
```

Or constrain generation without a named profile:

```ts
await protectPage(page, { device: 'mobile', os: 'android' });
```

## Protected surfaces

navigator (UA + Client Hints) · webdriver/automation cloak · canvas · WebGL
(vendor/renderer + readPixels) · audio · fonts · **WebRTC IP** · screen ·
hardware (cores/memory/touch) · timezone & `Intl` · languages · battery ·
plugins/mimeTypes · network connection · media devices · permissions ·
getClientRects · speech voices · touch · **media codecs** · **Web Workers**.

Toggle any of them:

```ts
await protectPage(page, { features: { audio: false, webrtc: false } });
```

### Expert protections

**WebRTC IP masking.** The real leak is the asynchronously-gathered ICE
candidates (a STUN `srflx` candidate exposes your true public IP, bypassing the
proxy). This library intercepts every path — candidate events, `createOffer`
/`createAnswer` SDP, `localDescription`, and `getStats()`:

```ts
// 'fake' (default): rewrite public IPs to the proxy egress, drop leaky
//   candidates when no egress is known, keep private mDNS host candidates.
// 'block': discover no IPs at all.  'passthrough': leave WebRTC untouched.
await protectPage(page, { proxy: 'http://user:pass@host:8080', webrtcPolicy: 'fake' });
```

**Web Worker realm.** Detectors spawn a Worker to read an un-patched
`navigator` (e.g. the real `hardwareConcurrency`). The patch is propagated into
`Worker`/`SharedWorker` scope, so workers report the spoofed identity too —
including OffscreenCanvas/WebGL noise.

**Media-codec coherence.** `canPlayType` / `MediaSource.isTypeSupported` are
adjusted per claimed browser (e.g. Safari reports no WebM but supports HEVC),
removing a codec-based engine tell.

## API

| Export | Purpose |
| --- | --- |
| `protectPage(page, options)` | Protect a single page → `ProtectedPage` |
| `protectedBrowser(browser, options)` | Protect a whole browser → `ProtectedBrowser` |
| `generateFingerprint(options)` | Build a `Fingerprint` from a seed/options |
| `FingerprintVault` | Persist / reload fingerprints to disk |
| `buildInjectionScript(fp, features?)` | Get the raw injection script (advanced) |
| `geoFromCountry` / `resolveGeoFromIp` / `geoForProxy` | Coherence helpers |
| `Afp` | Lower-level orchestrator (`Afp.create`, `applyToPage`, `rotateFingerprint`) |

`AfpOptions`: `seed`, `profile`, `device`, `browser`, `os`, `geo`, `proxy`,
`fingerprint`, `features`, `rotationInterval`, `logLevel`.

A `ProtectedPage` exposes `.fingerprint` (read-only) and
`.rotateFingerprint()` (re-randomises canvas/audio/WebGL noise without changing
the stable identity).

## How it stays coherent

1. A seed feeds a deterministic PRNG.
2. A device profile + the PRNG produce every value — and they're cross-derived
   (languages lead with the locale, screen `avail*` fits the device, WebGL
   matches the OS, etc.).
3. The result is canonicalised to JSON, so a vault reload is byte-identical.
4. At apply time the same values are pushed through both CDP and an in-page
   patch, keeping the network and JS layers in agreement.

## Development

```bash
npm install
npm run build        # tsc → dist/
npm test             # unit tests (deterministic, browser-free)
node scripts/smoke.js  # live headless browser verification
```

## Limitations

The browser engine is **always Chromium** (that's what Puppeteer drives). So:

- **Chromium profiles** (`desktop-chrome-*`, `desktop-edge-win`,
  `mobile-android-chrome`) are engine-accurate and the most robust targets.
- **Firefox / Safari / iOS profiles** spoof at the UA + JS-API level — the
  library strips Chromium-only surfaces (`userAgentData`, `deviceMemory`,
  `navigator.connection`, `getBattery`) for coherence — but a few engine tells
  can't be hidden from injected JS. Most notably, Chromium installs
  `window.chrome` as a **non-configurable** property before any page script
  runs, so it cannot be removed. Engine-level detectors can therefore still tell
  these are Chromium. Use them when the detector checks UA/locale/screen/canvas
  surfaces; prefer Chromium profiles against deep engine fingerprinting.

This is an inherent constraint of every Puppeteer/Chromium-based stealth tool,
not specific to this library.

## Disclaimer

For authorised testing, privacy research, and automation of sites you own or
have permission to access. Respect each site's Terms of Service and applicable
law.

## License

MIT © Pavle Aleksic
