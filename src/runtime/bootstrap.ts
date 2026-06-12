import { prngSource, hashSource } from '../core/prng';

/**
 * Source of the in-page native-stealth toolkit, `afp`.
 *
 * Returned as the body of an IIFE; the injector wraps it as
 * `var afp = (function(){ <this> })();`. The toolkit lives entirely in closure
 * scope — it is NEVER attached to `window`, so there is no `window.__afp` style
 * marker for a detector to find.
 *
 * Design rules embodied here:
 *  - One `Function.prototype.toString` trap, installed once, that returns a
 *    native-looking string for every patched function (and for itself).
 *  - Properties are redefined on their *true prototype owner* (e.g.
 *    `Navigator.prototype`, not the `navigator` instance) so no spurious own
 *    properties appear.
 *  - Methods are replaced with `Proxy` wrappers so `.name` and `.length` stay
 *    correct automatically.
 *  - All originals (`defineProperty`, `getOwnPropertyDescriptor`, …) are
 *    captured up-front before any page script can tamper with them.
 */
export function bootstrapSource(): string {
  return `
    'use strict';
    // --- captured native references (before anything can be patched) ---
    var ObjectDP = Object.defineProperty;
    var ObjectGOPD = Object.getOwnPropertyDescriptor;
    var getProto = Object.getPrototypeOf;
    var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
    var fnToString = Function.prototype.toString;

    var PRNG = (${prngSource()});
    var HASH = (${hashSource()});

    // --- toString cloaking ---------------------------------------------------
    // Map every patched function to the native string it should report.
    var nativeMap = new WeakMap();
    var toStringProxy = new Proxy(fnToString, {
      apply: function (target, thisArg, args) {
        if (thisArg && typeof thisArg === 'function' && nativeMap.has(thisArg)) {
          return nativeMap.get(thisArg);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    nativeMap.set(toStringProxy, 'function toString() { [native code] }');
    ObjectDP(Function.prototype, 'toString', {
      value: toStringProxy, writable: true, configurable: true, enumerable: false
    });

    function native(fn, name) {
      try { nativeMap.set(fn, 'function ' + (name || fn.name || '') + '() { [native code] }'); } catch (e) {}
      return fn;
    }

    // --- prototype-aware property/method patching ----------------------------
    function ownerOf(obj, prop) {
      var o = obj;
      while (o) { if (hasOwn(o, prop)) return o; o = getProto(o); }
      return obj;
    }

    // Define an accessor on the object that truly owns prop, mirroring the
    // original enumerable flag and keeping any existing setter.
    function define(obj, prop, getter, name) {
      var owner = ownerOf(obj, prop);
      var desc = ObjectGOPD(owner, prop) || {};
      var enumerable = 'enumerable' in desc ? desc.enumerable : true;
      native(getter, 'get ' + (name || prop));
      try {
        ObjectDP(owner, prop, { get: getter, set: desc.set, enumerable: enumerable, configurable: true });
      } catch (e) {
        try { ObjectDP(obj, prop, { get: getter, enumerable: enumerable, configurable: true }); } catch (_) {}
      }
    }

    function defineValue(obj, prop, value, name) {
      define(obj, prop, function () { return value; }, name);
    }

    // Replace a method with a Proxy wrapper. handler(original, thisArg, args)
    // returns the (possibly perturbed) result. name and length are preserved.
    function method(obj, prop, handler) {
      var owner = ownerOf(obj, prop);
      var original = owner[prop];
      if (typeof original !== 'function') return;
      var p = new Proxy(original, {
        apply: function (target, thisArg, args) { return handler(target, thisArg, args); }
      });
      nativeMap.set(p, 'function ' + prop + '() { [native code] }');
      try { owner[prop] = p; }
      catch (e) {
        try { ObjectDP(owner, prop, { value: p, writable: true, configurable: true, enumerable: false }); } catch (_) {}
      }
    }

    // Delete a property from whichever object truly owns it (used to strip
    // Chromium-only APIs when emulating a non-Chromium browser). Returns true
    // if the property is gone afterwards.
    function remove(obj, prop) {
      try {
        var owner = ownerOf(obj, prop);
        delete owner[prop];
      } catch (e) {}
      try { return !(prop in obj); } catch (e) { return false; }
    }

    // --- deterministic noise -------------------------------------------------
    // Seeded by the fingerprint so noise is stable for a given identity but
    // differs between identities. salt separates independent noise streams.
    function rng(salt) { return PRNG(HASH(String(FP.seed) + ':' + String(salt))); }

    return {
      native: native,
      define: define,
      defineValue: defineValue,
      method: method,
      remove: remove,
      ownerOf: ownerOf,
      rng: rng,
      hash: HASH,
      ObjectDP: ObjectDP,
      ObjectGOPD: ObjectGOPD
    };
  `;
}
