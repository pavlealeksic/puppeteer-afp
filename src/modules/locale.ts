import { flagged, type ProtectionModule } from '../core/module';

/** navigator.language(s) — kept coherent with the timezone module via FP.geo. */
export const languagesModule: ProtectionModule = {
  name: 'languages',
  enabled: flagged('languages'),
  build() {
    return `
      var langs = FP.geo.languages && FP.geo.languages.length ? FP.geo.languages : ['en-US', 'en'];
      afp.defineValue(navigator, 'language', langs[0], 'language');
      afp.defineValue(navigator, 'languages', Object.freeze(langs.slice()), 'languages');
    `;
  },
};

/**
 * Timezone + locale coherence. Spoofs `Date.getTimezoneOffset`, the `Date`
 * string formatters, and the full `Intl` surface so every clock/locale read
 * agrees with FP.geo — the classic CreepJS "timezone vs locale" cross-check.
 */
export const timezoneModule: ProtectionModule = {
  name: 'timezone',
  enabled: flagged('timezone'),
  build() {
    return `
      var tz = FP.geo.timezone || 'America/New_York';
      var loc = FP.geo.locale || 'en-US';

      // Offset (minutes, with sign flipped to match getTimezoneOffset semantics).
      function offsetFor(date) {
        try {
          var dtf = new OriginalDTF('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
          var parts = dtf.formatToParts(date);
          var map = {};
          parts.forEach(function (p) { map[p.type] = p.value; });
          var asUTC = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour % 24, +map.minute, +map.second);
          // getTimezoneOffset is positive for zones west of UTC (e.g. +300 for EST).
          return Math.round((date.getTime() - asUTC) / 60000);
        } catch (e) { return date.getTimezoneOffset(); }
      }
      var OriginalDTF = Intl.DateTimeFormat;

      afp.method(Date.prototype, 'getTimezoneOffset', function (orig, self) { return offsetFor(self); });

      // Intl.DateTimeFormat().resolvedOptions().timeZone / locale.
      afp.method(Intl.DateTimeFormat.prototype, 'resolvedOptions', function (orig, self, args) {
        var opts = orig.apply(self, args);
        opts.timeZone = tz;
        if (opts.locale) opts.locale = loc;
        return opts;
      });
      ['NumberFormat', 'Collator', 'PluralRules', 'RelativeTimeFormat', 'ListFormat'].forEach(function (k) {
        if (Intl[k] && Intl[k].prototype && Intl[k].prototype.resolvedOptions) {
          afp.method(Intl[k].prototype, 'resolvedOptions', function (orig, self, args) {
            var opts = orig.apply(self, args);
            if (opts.locale) opts.locale = loc;
            return opts;
          });
        }
      });
    `;
  },
};
