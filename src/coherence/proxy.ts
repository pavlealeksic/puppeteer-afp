import type { GeoProfile } from '../types';
import { resolveGeoFromIp, geoFromCountry } from './geo';

export interface ParsedProxy {
  protocol: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

/** Parse a proxy URL like `http://user:pass@host:8080`. */
export function parseProxy(url: string): ParsedProxy | null {
  try {
    const u = new URL(url);
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.hostname,
      port: Number(u.port) || (u.protocol.startsWith('https') ? 443 : 80),
      username: u.username || undefined,
      password: u.password || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Discover the public egress IP seen through an HTTP(S) proxy by issuing an
 * absolute-URI GET to a plain-HTTP echo service via the proxy. Best-effort and
 * timeout-guarded; returns `null` for SOCKS proxies or any failure.
 */
export function egressIpThroughProxy(proxyUrl: string): Promise<string | null> {
  const proxy = parseProxy(proxyUrl);
  if (!proxy || proxy.protocol.startsWith('socks')) return Promise.resolve(null);

  return new Promise(resolve => {
    const net = require('net') as typeof import('net');
    const socket = net.connect({ host: proxy.host, port: proxy.port });
    let body = '';
    const done = (ip: string | null): void => {
      try {
        socket.destroy();
      } catch {
        /* noop */
      }
      resolve(ip);
    };
    socket.setTimeout(4000);
    socket.on('timeout', () => done(null));
    socket.on('error', () => done(null));
    socket.on('connect', () => {
      const auth = proxy.username
        ? `Proxy-Authorization: Basic ${Buffer.from(`${proxy.username}:${proxy.password || ''}`).toString('base64')}\r\n`
        : '';
      socket.write(
        `GET http://api.ipify.org/ HTTP/1.1\r\nHost: api.ipify.org\r\n${auth}Connection: close\r\n\r\n`
      );
    });
    socket.on('data', d => (body += d.toString()));
    socket.on('end', () => {
      const idx = body.indexOf('\r\n\r\n');
      const payload = idx >= 0 ? body.slice(idx + 4).trim() : '';
      const m = payload.match(/(\d{1,3}\.){3}\d{1,3}/);
      done(m ? m[0] : null);
    });
  });
}

/**
 * Build a coherent geo identity for a proxy: resolve egress IP → geo. Falls back
 * to a country code (if you already know it) or US defaults. Never throws.
 */
export async function geoForProxy(proxyUrl: string, fallbackCountry = 'US'): Promise<GeoProfile> {
  const ip = await egressIpThroughProxy(proxyUrl);
  if (ip) {
    const geo = await resolveGeoFromIp(ip);
    if (geo) return geo;
    return geoFromCountry(fallbackCountry, ip);
  }
  return geoFromCountry(fallbackCountry);
}
