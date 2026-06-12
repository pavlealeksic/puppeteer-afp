# Changelog

All notable changes to this project are documented here. This project adheres
to [Semantic Versioning](https://semver.org/).

## [3.0.0] - 2026-06-12

A complete ground-up rewrite. The library is now built around a single idea: one
`seed` deterministically produces one internally-coherent browser identity that
can be persisted and reproduced byte-for-byte.

### Breaking changes

- **New public API.** `protectPage(page, options)` and
  `protectedBrowser(browser, options)` are redesigned around `AfpOptions`
  (`seed`, `profile`, `device`/`browser`/`os`, `geo`, `proxy`, `fingerprint`,
  `features`, `webrtcPolicy`, `rotationInterval`, `logLevel`). The old
  `ProtectionOptions` shape, engine-emulation flags, and per-protection exports
  are gone.
- **Node ≥ 16** required (was 14).
- **Zero runtime dependencies** — `winston` and `joi` removed in favour of a tiny
  built-in logger.
- `dist/` is no longer committed; it is built on publish.

### Added

- **Seeded, coherent fingerprints.** `generateFingerprint(options)` derives every
  value (navigator, screen, GPU, fonts, canvas/audio/WebGL noise, timezone,
  WebRTC IP) from one seed; values are mutually consistent and JSON round-trip
  losslessly.
- **Fingerprint vault.** `FingerprintVault` saves/reloads identities to disk so a
  later session reproduces the exact same browser (`loadOrCreate`, `save`,
  `load`, `list`, `delete`).
- **Proxy / geo coherence.** When a `proxy` is supplied, timezone, locale,
  languages, geolocation, and the WebRTC public IP are derived from the egress
  IP (`geoForProxy`, `resolveGeoFromIp`, `geoFromCountry`).
- **Native-stealth runtime.** A single `Function.prototype.toString` trap,
  prototype-accurate property redefinition, and `Proxy`-preserved
  `name`/`length`. The toolkit lives in closure scope — no `window.*` marker.
- **Expert WebRTC masking** with policy modes (`fake` / `block` / `passthrough`):
  intercepts ICE candidate events, `createOffer`/`createAnswer` SDP,
  `localDescription`, and `getStats()`.
- **Web Worker realm propagation** — the patch is injected into
  `Worker`/`SharedWorker` scope so workers no longer leak the real
  `hardwareConcurrency` etc.
- **Media-codec coherence** — `canPlayType` / `MediaSource.isTypeSupported`
  adjusted per claimed browser.
- **Device profiles**: `desktop-chrome-win`, `desktop-chrome-mac`,
  `desktop-edge-win`, `desktop-firefox-win`, `desktop-safari-mac`,
  `mobile-android-chrome`, `mobile-ios-iphone`.
- Per-browser stripping of Chromium-only APIs (`userAgentData`, `deviceMemory`,
  `navigator.connection`, `getBattery`) for non-Chromium identities.
- Browser-level CDP emulation (user-agent + Client Hints, timezone,
  geolocation, viewport) applied alongside the in-page patch.

### Fixed

- `getTimezoneOffset()` now returns the correctly-signed offset.
- Module early-`return`s are isolated so they can no longer abort the rest of the
  injection script.

### Removed

- Legacy `src/index.js`, root `index.js`, the `engines/`, `systems/`, and
  per-detector `protections/` modules, and assorted debug scripts.

### Known limitations

- The engine is always Chromium; Firefox/Safari/iOS profiles spoof at the UA/JS
  level but cannot hide every engine tell (notably `window.chrome`, a
  non-configurable property). Prefer Chromium profiles against engine-level
  detectors.
