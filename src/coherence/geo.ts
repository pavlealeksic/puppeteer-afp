import type { GeoProfile } from '../types';

/**
 * Coarse country → locale/timezone table used to build a coherent geo identity
 * offline. Representative (capital-region) timezone per country; good enough to
 * keep `Intl`/`Date`/`navigator.language` mutually consistent.
 */
interface CountryEntry {
  timezone: string;
  locale: string;
  languages: string[];
  lat: number;
  lon: number;
}

const COUNTRIES: Record<string, CountryEntry> = {
  US: {
    timezone: 'America/New_York',
    locale: 'en-US',
    languages: ['en-US', 'en'],
    lat: 40.71,
    lon: -74.01,
  },
  GB: {
    timezone: 'Europe/London',
    locale: 'en-GB',
    languages: ['en-GB', 'en'],
    lat: 51.51,
    lon: -0.13,
  },
  DE: {
    timezone: 'Europe/Berlin',
    locale: 'de-DE',
    languages: ['de-DE', 'de', 'en-US', 'en'],
    lat: 52.52,
    lon: 13.4,
  },
  FR: {
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
    languages: ['fr-FR', 'fr', 'en-US', 'en'],
    lat: 48.85,
    lon: 2.35,
  },
  ES: {
    timezone: 'Europe/Madrid',
    locale: 'es-ES',
    languages: ['es-ES', 'es', 'en'],
    lat: 40.42,
    lon: -3.7,
  },
  IT: {
    timezone: 'Europe/Rome',
    locale: 'it-IT',
    languages: ['it-IT', 'it', 'en'],
    lat: 41.9,
    lon: 12.5,
  },
  NL: {
    timezone: 'Europe/Amsterdam',
    locale: 'nl-NL',
    languages: ['nl-NL', 'nl', 'en-US', 'en'],
    lat: 52.37,
    lon: 4.9,
  },
  RU: {
    timezone: 'Europe/Moscow',
    locale: 'ru-RU',
    languages: ['ru-RU', 'ru', 'en'],
    lat: 55.75,
    lon: 37.62,
  },
  CA: {
    timezone: 'America/Toronto',
    locale: 'en-CA',
    languages: ['en-CA', 'en', 'fr-CA', 'fr'],
    lat: 43.65,
    lon: -79.38,
  },
  BR: {
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    languages: ['pt-BR', 'pt', 'en'],
    lat: -23.55,
    lon: -46.63,
  },
  IN: {
    timezone: 'Asia/Kolkata',
    locale: 'en-IN',
    languages: ['en-IN', 'en', 'hi'],
    lat: 28.61,
    lon: 77.21,
  },
  JP: {
    timezone: 'Asia/Tokyo',
    locale: 'ja-JP',
    languages: ['ja-JP', 'ja', 'en'],
    lat: 35.68,
    lon: 139.69,
  },
  CN: {
    timezone: 'Asia/Shanghai',
    locale: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en'],
    lat: 39.9,
    lon: 116.4,
  },
  AU: {
    timezone: 'Australia/Sydney',
    locale: 'en-AU',
    languages: ['en-AU', 'en'],
    lat: -33.87,
    lon: 151.21,
  },
  SG: {
    timezone: 'Asia/Singapore',
    locale: 'en-SG',
    languages: ['en-SG', 'en', 'zh'],
    lat: 1.35,
    lon: 103.82,
  },
  PL: {
    timezone: 'Europe/Warsaw',
    locale: 'pl-PL',
    languages: ['pl-PL', 'pl', 'en'],
    lat: 52.23,
    lon: 21.01,
  },
  RS: {
    timezone: 'Europe/Belgrade',
    locale: 'sr-RS',
    languages: ['sr-RS', 'sr', 'en'],
    lat: 44.79,
    lon: 20.45,
  },
};

/** Build a full {@link GeoProfile} from a country code (offline). */
export function geoFromCountry(countryCode: string, ip?: string): GeoProfile {
  const c = COUNTRIES[countryCode.toUpperCase()] || COUNTRIES.US;
  return {
    ip,
    countryCode: countryCode.toUpperCase(),
    timezone: c.timezone,
    locale: c.locale,
    languages: c.languages.slice(),
    latitude: c.lat,
    longitude: c.lon,
    accuracy: 100,
  };
}

/**
 * Resolve a public IP to a coherent geo identity via ip-api.com (free, no key,
 * HTTP). Best-effort: on any failure/timeout it returns `null` and the caller
 * falls back to defaults. Never throws, never hangs (3s timeout).
 */
export async function resolveGeoFromIp(ip: string): Promise<GeoProfile | null> {
  try {
    const data = await httpGetJson(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,timezone,lat,lon`
    );
    if (!data || data.status !== 'success') return null;
    const base = data.countryCode
      ? geoFromCountry(data.countryCode, ip)
      : { ...geoFromCountry('US', ip) };
    return {
      ...base,
      timezone: data.timezone || base.timezone,
      latitude: typeof data.lat === 'number' ? data.lat : base.latitude,
      longitude: typeof data.lon === 'number' ? data.lon : base.longitude,
    };
  } catch {
    return null;
  }
}

/** Minimal timeout-guarded HTTP GET returning parsed JSON (dependency-free). */
function httpGetJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const http = require('http') as typeof import('http');
    const req = http.get(url, { timeout: 3000 }, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}
