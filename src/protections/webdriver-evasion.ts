/**
 * Advanced WebDriver Detection Evasion
 * Comprehensive hiding of all automation traces and WebDriver properties
 */

export class WebDriverEvasion {
  
  // Core WebDriver Property Evasion
  static getWebDriverEvasion(): string {
    return `
      // Advanced WebDriver Detection Evasion
      
      // 1. Remove webdriver property from multiple locations
      if (typeof navigator !== 'undefined') {
        // Delete the property entirely
        try {
          delete Object.getPrototypeOf(navigator).webdriver;
          delete navigator.__proto__.webdriver;
          delete navigator.webdriver;
        } catch (e) {}
        
        // Define as undefined with non-enumerable, non-configurable
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
          set: () => {},
          enumerable: false,
          configurable: false
        });
        
        // Also handle webDriver (different casing)
        Object.defineProperty(navigator, 'webDriver', {
          get: () => undefined,
          set: () => {},
          enumerable: false,
          configurable: false
        });
      }
      
      // 2. Remove webdriver from window object
      if (typeof window !== 'undefined') {
        try {
          delete window.webdriver;
          delete window.webDriver; 
          delete window.WebDriver;
        } catch (e) {}
        
        Object.defineProperty(window, 'webdriver', {
          get: () => undefined,
          configurable: false,
          enumerable: false
        });
      }
      
      // 3. Clean document properties
      if (typeof document !== 'undefined') {
        try {
          delete document.webdriver;
          delete document.$wdc_;
          delete document.$chrome_asyncScriptInfo;
        } catch (e) {}
      }
      
      // 4. Override Object.hasOwnProperty specifically for webdriver
      const originalHasOwnProperty = Object.prototype.hasOwnProperty;
      Object.prototype.hasOwnProperty = function(prop) {
        if (prop === 'webdriver' && (this === navigator || this === window)) {
          return false;
        }
        return originalHasOwnProperty.call(this, prop);
      };
      
      // 5. Override in/hasOwnProperty checks
      const originalIn = function(prop, obj) {
        return prop in obj;
      };
      
      // Intercept 'in' operator checks for webdriver
      const handler = {
        has: function(target, prop) {
          if (prop === 'webdriver' && (target === navigator || target === window)) {
            return false;
          }
          return prop in target;
        }
      };
      
      try {
        navigator = new Proxy(navigator, handler);
      } catch (e) {}
    `;
  }

  // Selenium Detection Evasion
  static getSeleniumEvasion(): string {
    return `
      // Selenium Detection Evasion
      const seleniumProperties = [
        '__selenium_evaluate',
        '__selenium_unwrapped', 
        '__webdriver_evaluate',
        '__driver_evaluate',
        '__webdriver_unwrapped',
        '__driver_unwrapped',
        '__fxdriver_evaluate',
        '__fxdriver_unwrapped',
        '__webdriver_script_fn',
        '__webdriver_script_func',
        'selenium',
        'webdriver',
        'driver'
      ];
      
      // Remove from window
      seleniumProperties.forEach(prop => {
        try {
          delete window[prop];
        } catch (e) {}
        
        Object.defineProperty(window, prop, {
          get: () => undefined,
          configurable: false,
          enumerable: false
        });
      });
      
      // Remove from document
      seleniumProperties.forEach(prop => {
        try {
          delete document[prop];
        } catch (e) {}
      });
      
      // Remove from navigator
      seleniumProperties.forEach(prop => {
        try {
          delete navigator[prop];
        } catch (e) {}
      });
      
      // Clean up selenium-related variables that might be injected
      const seleniumVars = [
        'webdriver-evaluate',
        'selenium-evaluate', 
        'webdriverCommand',
        'webdriver-evaluate-response',
        '__webdriverFunc',
        '__$webdriverAsyncExecutor',
        '$chrome_asyncScriptInfo',
        '$cdc_asdjflasutopfhvcZLmcfl_'
      ];
      
      seleniumVars.forEach(variable => {
        try {
          if (typeof window[variable] !== 'undefined') {
            delete window[variable];
          }
        } catch (e) {}
      });
    `;
  }

  // Phantom/Nightmare Detection Evasion  
  static getPhantomEvasion(): string {
    return `
      // Phantom/Nightmare Detection Evasion
      const phantomProperties = [
        'phantom',
        '_phantom',
        '__phantom',
        'callPhantom',
        '_phantom_',
        'phantomjs',
        '__nightmare',
        'nightmare',
        '_nightmare'
      ];
      
      // Remove from all possible locations
      [window, document, navigator].forEach(obj => {
        if (obj) {
          phantomProperties.forEach(prop => {
            try {
              delete obj[prop];
            } catch (e) {}
            
            Object.defineProperty(obj, prop, {
              get: () => undefined,
              configurable: false,
              enumerable: false
            });
          });
        }
      });
      
      // Override callPhantom specifically as it's commonly checked
      if (typeof callPhantom !== 'undefined') {
        try {
          delete window.callPhantom;
        } catch (e) {}
        
        Object.defineProperty(window, 'callPhantom', {
          get: () => undefined,
          configurable: false
        });
      }
    `;
  }

  // CDP (Chrome DevTools Protocol) Detection Evasion
  static getCDPEvasion(): string {
    return `
      // CDP (Chrome DevTools Protocol) Detection Evasion
      
      // Remove CDP-related runtime objects
      const cdpProperties = [
        'cdc_adoQpoasnfa76pfcZLmcfl_Array',
        'cdc_adoQpoasnfa76pfcZLmcfl_Promise', 
        'cdc_adoQpoasnfa76pfcZLmcfl_Symbol',
        'cdc_adoQpoasnfa76pfcZLmcfl_JSONParse',
        'cdc_adoQpoasnfa76pfcZLmcfl_Object',
        '$cdc_asdjflasutopfhvcZLmcfl_',
        '__webdriver_script_fn',
        'webdriver-evaluate',
        'webdriver-evaluate-response'
      ];
      
      cdpProperties.forEach(prop => {
        try {
          delete window[prop];
        } catch (e) {}
      });
      
      // Override Object.keys to hide CDP properties
      const originalObjectKeys = Object.keys;
      Object.keys = function(obj) {
        const keys = originalObjectKeys(obj);
        return keys.filter(key => !key.includes('cdc_') && key !== '$cdc_asdjflasutopfhvcZLmcfl_');
      };
      
      // Override Object.getOwnPropertyNames to hide CDP properties  
      const originalGetOwnPropertyNames = Object.getOwnPropertyNames;
      Object.getOwnPropertyNames = function(obj) {
        const names = originalGetOwnPropertyNames(obj);
        return names.filter(name => !name.includes('cdc_') && name !== '$cdc_asdjflasutopfhvcZLmcfl_');
      };
      
      // Clean up runtime evaluation markers
      if (typeof document !== 'undefined') {
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          if (script.innerHTML && (
            script.innerHTML.includes('cdc_') ||
            script.innerHTML.includes('webdriver') ||
            script.innerHTML.includes('$cdc_asdjflasutopfhvcZLmcfl_')
          )) {
            try {
              script.remove();
            } catch (e) {}
          }
        });
      }
    `;
  }

  // Playwright Detection Evasion
  static getPlaywrightEvasion(): string {
    return `
      // Playwright Detection Evasion
      const playwrightProperties = [
        '__playwright',
        '__pw_manual',
        '__PW_inspect'  
      ];
      
      [window, document, navigator].forEach(obj => {
        if (obj) {
          playwrightProperties.forEach(prop => {
            try {
              delete obj[prop];
            } catch (e) {}
          });
        }
      });
      
      // Clean up playwright-specific markers
      if (typeof window !== 'undefined') {
        // Remove playwright evaluation functions
        try {
          delete window.__pw_evaluate;
          delete window.__playwright_evaluation_script__;
        } catch (e) {}
      }
    `;
  }

  // Puppeteer Detection Evasion
  static getPuppeteerEvasion(): string {
    return `
      // Puppeteer Detection Evasion
      
      // Override chrome.runtime for headless detection
      if (window.chrome && window.chrome.runtime) {
        // Make it look like a real Chrome extension environment
        Object.defineProperty(window.chrome.runtime, 'onConnect', {
          get: () => undefined,
          configurable: true
        });
        
        Object.defineProperty(window.chrome.runtime, 'onMessage', {
          get: () => undefined,
          configurable: true
        });
      }
      
      // Fix permissions API that Puppeteer modifies
      if (navigator.permissions && navigator.permissions.query) {
        const originalQuery = navigator.permissions.query;
        navigator.permissions.query = function(parameters) {
          return originalQuery.apply(this, arguments).then(result => {
            // Puppeteer often sets notifications to 'denied', make it 'default'
            if (parameters.name === 'notifications' && result.state === 'denied') {
              return { state: 'default', onchange: null };
            }
            return result;
          });
        };
      }
      
      // Clean up Puppeteer evaluation markers
      const puppeteerMarkers = [
        '__puppeteer_evaluation_script__',
        '__puppeteer_world__'  
      ];
      
      puppeteerMarkers.forEach(marker => {
        try {
          delete window[marker];
        } catch (e) {}
      });
    `;
  }

  // Advanced Function Detection Evasion
  static getFunctionDetectionEvasion(): string {
    return `
      // Advanced Function Detection Evasion
      
      // Override Function.prototype.toString to hide native code modifications
      const originalFunctionToString = Function.prototype.toString;
      Function.prototype.toString = function() {
        const str = originalFunctionToString.apply(this, arguments);
        
        // Replace [native code] indicators that might reveal modifications
        if (str.includes('[native code]')) {
          return str;
        }
        
        // For modified functions, return generic native code signature
        if (this.name && (
          this.name.includes('evaluate') ||
          this.name.includes('webdriver') ||
          this.name.includes('selenium') ||
          this.name.includes('phantom')
        )) {
          return \`function \${this.name}() { [native code] }\`;
        }
        
        return str;
      };
      
      // Override toString for specific objects that automation tools modify
      const sensitiveObjects = [navigator, window, document];
      
      sensitiveObjects.forEach(obj => {
        if (obj && obj.toString) {
          const originalToString = obj.toString;
          obj.toString = function() {
            const str = originalToString.apply(this, arguments);
            // Remove automation-related strings from toString output
            return str.replace(/webdriver|selenium|phantom|nightmare|playwright/gi, '');
          };
        }
      });
    `;
  }

  // Error Stack Trace Cleaning
  static getErrorStackCleaning(): string {
    return `
      // Error Stack Trace Cleaning
      const originalError = window.Error;
      
      window.Error = function(message) {
        const error = new originalError(message);
        
        // Clean stack trace of automation-related paths
        const originalStack = error.stack;
        if (originalStack) {
          error.stack = originalStack
            .replace(/chrome-extension:\\/\\/[a-z]{32}/g, 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai')
            .replace(/file:\\/\\/.*?webdriver/g, 'chrome://newtab/')
            .replace(/selenium|webdriver|phantom|nightmare|playwright/gi, 'chrome')
            .replace(/at Object\\.evaluate.*?\\n/g, '')
            .replace(/at ExecutionContext\\.evaluate.*?\\n/g, '');
        }
        
        return error;
      };
      
      // Copy properties from original Error constructor
      Object.setPrototypeOf(window.Error.prototype, originalError.prototype);
      Object.setPrototypeOf(window.Error, originalError);
      
      // Keep static methods
      Object.getOwnPropertyNames(originalError).forEach(prop => {
        if (typeof originalError[prop] === 'function') {
          window.Error[prop] = originalError[prop];
        }
      });
    `;
  }

  // Language and Locale Consistency
  static getLanguageConsistency(): string {
    return `
      // Language and Locale Consistency
      
      // Ensure language properties are consistent across APIs
      if (typeof navigator !== 'undefined') {
        const consistentLanguages = window.__fingerprintConsistency?.languages || ['en-US', 'en'];
        const consistentLanguage = consistentLanguages[0];
        
        Object.defineProperties(navigator, {
          language: {
            get: () => consistentLanguage,
            configurable: true
          },
          languages: {
            get: () => [...consistentLanguages], // Return copy
            configurable: true
          }
        });
      }
      
      // Ensure Intl APIs return consistent locale data
      if (typeof Intl !== 'undefined') {
        // Override Intl.Locale if available
        if (Intl.Locale) {
          const OriginalLocale = Intl.Locale;
          Intl.Locale = function(tag, options) {
            // Normalize to consistent locale
            return new OriginalLocale('en-US', options);
          };
          Object.setPrototypeOf(Intl.Locale, OriginalLocale);
          Intl.Locale.prototype = OriginalLocale.prototype;
        }
        
        // Override DateTimeFormat resolvedOptions
        const OriginalDateTimeFormat = Intl.DateTimeFormat;
        Intl.DateTimeFormat.prototype.resolvedOptions = function() {
          const options = OriginalDateTimeFormat.prototype.resolvedOptions.call(this);
          return {
            ...options,
            locale: 'en-US',
            timeZone: window.__fingerprintConsistency?.timezone || 'America/New_York'
          };
        };
      }
    `;
  }

  // Get all WebDriver evasion techniques
  static getAllWebDriverEvasion(): string {
    return `
      ${this.getWebDriverEvasion()}
      ${this.getSeleniumEvasion()}
      ${this.getPhantomEvasion()}
      ${this.getCDPEvasion()}
      ${this.getPlaywrightEvasion()}
      ${this.getPuppeteerEvasion()}
      ${this.getFunctionDetectionEvasion()}
      ${this.getErrorStackCleaning()}
      ${this.getLanguageConsistency()}
    `;
  }
}