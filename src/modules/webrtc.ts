import { flagged, type ProtectionModule } from '../core/module';

/**
 * Expert WebRTC IP-leak protection.
 *
 * The real leak is not the SDP body — it's the asynchronously-gathered ICE
 * candidates (delivered via `onicecandidate` / `icecandidate` events) and the
 * candidate rows in `getStats()`. A STUN `srflx` candidate exposes the host's
 * true public IP, bypassing any HTTP proxy. This module intercepts every path:
 *
 *  - `createOffer` / `createAnswer` SDP
 *  - `localDescription` / `currentLocalDescription` getters
 *  - `onicecandidate` setter and `addEventListener('icecandidate')`
 *  - `getStats()` candidate rows
 *
 * Policy (`FP.webrtc.policy`):
 *  - `fake` (default): rewrite public (`srflx`/`relay`/`prflx`) IPs to the proxy
 *    egress (`FP.webrtc.publicIp`); if unknown, drop those candidates. Raw
 *    private host IPs are dropped; mDNS `.local` host candidates pass through.
 *  - `block`: drop every candidate — no IPs are discovered at all.
 *  - `passthrough`: do nothing.
 */
export const webrtcModule: ProtectionModule = {
  name: 'webrtc',
  enabled: flagged('webrtc'),
  build() {
    return `
      var Orig = window.RTCPeerConnection || window.webkitRTCPeerConnection;
      if (!Orig) return;
      var policy = FP.webrtc.policy || 'fake';
      if (policy === 'passthrough') return;
      var pub = FP.webrtc.publicIp || null;
      var IPV4 = /((25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1?\\d?\\d)/g;

      function typeOf(line) { var m = line.match(/ typ (host|srflx|relay|prflx)/); return m ? m[1] : ''; }

      // Returns a (possibly rewritten) candidate line, or null to drop it.
      function filterLine(line) {
        if (!line) return line;
        if (policy === 'block') return null;
        var typ = typeOf(line);
        if (typ === 'srflx' || typ === 'relay' || typ === 'prflx') {
          if (pub) return line.replace(IPV4, function (ip) { return ip === '0.0.0.0' ? ip : pub; });
          return null; // would leak the real public IP and we have no egress to fake it
        }
        if (typ === 'host') {
          if (/[0-9a-f-]+\\.local/i.test(line)) return line; // mDNS, private-safe
          IPV4.lastIndex = 0;
          if (IPV4.test(line)) { IPV4.lastIndex = 0; return null; } // raw LAN IP -> drop
        }
        return line;
      }

      function scrubSdp(sdp) {
        if (!sdp) return sdp;
        var lines = sdp.split(/\\r\\n|\\n/);
        var out = [];
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
          if (/^a=candidate:|^candidate:/.test(l)) {
            var kept = filterLine(l);
            if (kept !== null) out.push(kept);
          } else if (/^c=IN IP4 /.test(l) && pub) {
            out.push('c=IN IP4 ' + pub);
          } else {
            out.push(l);
          }
        }
        return out.join('\\r\\n');
      }

      function wrapDescPromise(p) {
        return p.then(function (desc) {
          try {
            if (desc && desc.sdp) return new RTCSessionDescription({ type: desc.type, sdp: scrubSdp(desc.sdp) });
          } catch (e) {}
          return desc;
        });
      }

      // Deliver an icecandidate event through the policy filter.
      function deliver(listener, ev, pc) {
        if (!ev || !ev.candidate) return listener.call(pc, ev); // end-of-candidates
        var line = ev.candidate.candidate;
        var kept = filterLine(line);
        if (kept === null) return; // suppress
        if (kept === line) return listener.call(pc, ev);
        var nc;
        try {
          nc = new RTCIceCandidate({
            candidate: kept, sdpMid: ev.candidate.sdpMid,
            sdpMLineIndex: ev.candidate.sdpMLineIndex, usernameFragment: ev.candidate.usernameFragment,
          });
        } catch (e) { return listener.call(pc, ev); }
        var proxy = new Proxy(ev, { get: function (t, p) { return p === 'candidate' ? nc : t[p]; } });
        return listener.call(pc, proxy);
      }

      function scrubStats(report) {
        try {
          report.forEach(function (stat) {
            if (!stat || (stat.type !== 'local-candidate' && stat.type !== 'remote-candidate')) return;
            var ct = stat.candidateType;
            if ((ct === 'srflx' || ct === 'relay' || ct === 'prflx') && pub) {
              if ('ip' in stat) stat.ip = pub;
              if ('address' in stat) stat.address = pub;
            }
          });
        } catch (e) {}
      }

      function Patched(cfg) {
        var pc = new Orig(cfg);

        ['createOffer', 'createAnswer'].forEach(function (m) {
          var o = pc[m].bind(pc);
          pc[m] = function () { return wrapDescPromise(o.apply(pc, arguments)); };
          afp.native(pc[m], m);
        });

        ['localDescription', 'currentLocalDescription'].forEach(function (prop) {
          try {
            var d = afp.ObjectGOPD(Orig.prototype, prop);
            if (d && d.get) {
              afp.ObjectDP(pc, prop, {
                get: function () {
                  var v = d.get.call(pc);
                  if (v && v.sdp) { try { return new RTCSessionDescription({ type: v.type, sdp: scrubSdp(v.sdp) }); } catch (e) {} }
                  return v;
                },
                configurable: true,
              });
            }
          } catch (e) {}
        });

        var realAdd = pc.addEventListener.bind(pc);
        pc.addEventListener = function (type, listener, opts) {
          if (type === 'icecandidate' && typeof listener === 'function') {
            return realAdd(type, function (ev) { return deliver(listener, ev, pc); }, opts);
          }
          return realAdd(type, listener, opts);
        };
        afp.native(pc.addEventListener, 'addEventListener');

        try {
          var userHandler = null;
          var installed = false;
          afp.ObjectDP(pc, 'onicecandidate', {
            get: function () { return userHandler; },
            set: function (fn) {
              userHandler = fn;
              if (!installed && typeof fn === 'function') {
                installed = true;
                realAdd('icecandidate', function (ev) { if (userHandler) deliver(userHandler, ev, pc); });
              }
            },
            configurable: true,
          });
        } catch (e) {}

        var oStats = pc.getStats.bind(pc);
        pc.getStats = function () { return oStats.apply(pc, arguments).then(function (r) { scrubStats(r); return r; }); };
        afp.native(pc.getStats, 'getStats');

        return pc;
      }
      Patched.prototype = Orig.prototype;
      afp.native(Patched, 'RTCPeerConnection');
      try { window.RTCPeerConnection = Patched; } catch (e) {}
      try { window.webkitRTCPeerConnection = Patched; } catch (e) {}
    `;
  },
};
