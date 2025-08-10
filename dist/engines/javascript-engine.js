"use strict";
/**
 * JavaScript Engine Fingerprinting Emulation
 * Replicates V8, SpiderMonkey, and JavaScriptCore characteristics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineConfigs = exports.JavaScriptEngineEmulator = void 0;
class JavaScriptEngineEmulator {
    constructor(config) {
        this.performanceMetrics = new Map();
        this.gcScheduler = null;
        this.optimizationCounters = new Map();
        this.config = config;
        this.initializePerformanceMetrics();
        this.setupGarbageCollectionSimulation();
    }
    initializePerformanceMetrics() {
        // Engine-specific performance characteristics
        const baseMetrics = {
            'function-call-overhead': 0.01,
            'property-access-time': 0.005,
            'array-access-time': 0.003,
            'object-creation-time': 0.1,
            'string-concatenation-time': 0.02,
            'regexp-execution-time': 0.05,
            'json-parse-time': 0.03,
            'json-stringify-time': 0.04
        };
        // Apply engine-specific multipliers
        const engineMultipliers = this.getEngineMultipliers();
        Object.entries(baseMetrics).forEach(([key, value]) => {
            const multiplier = engineMultipliers[key] || 1;
            this.performanceMetrics.set(key, value * multiplier);
        });
    }
    getEngineMultipliers() {
        switch (this.config.engine) {
            case 'v8':
                return {
                    'function-call-overhead': 0.8, // V8 is optimized for function calls
                    'property-access-time': 0.9,
                    'array-access-time': 0.7, // V8 has excellent array optimization
                    'object-creation-time': 0.85,
                    'string-concatenation-time': 0.6, // V8's rope strings
                    'regexp-execution-time': 0.9,
                    'json-parse-time': 0.75, // V8's fast JSON parser
                    'json-stringify-time': 0.8
                };
            case 'spidermonkey':
                return {
                    'function-call-overhead': 1.1,
                    'property-access-time': 1.0,
                    'array-access-time': 1.2,
                    'object-creation-time': 1.1,
                    'string-concatenation-time': 1.3,
                    'regexp-execution-time': 0.85, // SpiderMonkey has good regex
                    'json-parse-time': 1.2,
                    'json-stringify-time': 1.15
                };
            case 'javascriptcore':
                return {
                    'function-call-overhead': 1.0,
                    'property-access-time': 0.95,
                    'array-access-time': 1.0,
                    'object-creation-time': 0.9,
                    'string-concatenation-time': 1.1,
                    'regexp-execution-time': 1.0,
                    'json-parse-time': 1.0,
                    'json-stringify-time': 0.95
                };
            default:
                return {};
        }
    }
    setupGarbageCollectionSimulation() {
        if (this.gcScheduler) {
            clearInterval(this.gcScheduler);
        }
        const gcInterval = this.calculateGCInterval();
        this.gcScheduler = setInterval(() => {
            this.simulateGarbageCollection();
        }, gcInterval);
    }
    calculateGCInterval() {
        const base = 1000; // 1 second base
        const pressure = this.config.gcBehavior.gcPressure;
        const heapFactor = Math.log(this.config.gcBehavior.heapSize / 1024 / 1024); // MB to factor
        return base * (1 / pressure) * heapFactor;
    }
    simulateGarbageCollection() {
        const pauseTime = this.config.gcBehavior.pauseTime;
        const algorithm = this.config.gcBehavior.algorithm;
        // Simulate GC pause by slightly delaying operations
        if (pauseTime > 0) {
            const jitter = Math.random() * 0.5; // Add realistic jitter
            setTimeout(() => {
                // GC completed, adjust performance metrics temporarily
                this.applyPostGCEffects();
            }, pauseTime + jitter);
        }
    }
    applyPostGCEffects() {
        // After GC, there's typically a brief performance boost
        const boost = 0.95; // 5% performance improvement
        const duration = 2000; // 2 seconds
        const originalMetrics = new Map(this.performanceMetrics);
        this.performanceMetrics.forEach((value, key) => {
            this.performanceMetrics.set(key, value * boost);
        });
        setTimeout(() => {
            // Restore original performance
            this.performanceMetrics = originalMetrics;
        }, duration);
    }
    getInjectionScript() {
        return `
      (function() {
        const engineConfig = ${JSON.stringify(this.config)};
        const performanceMetrics = ${JSON.stringify(Object.fromEntries(this.performanceMetrics))};
        
        // Override Error constructor for engine-specific patterns
        ${this.getErrorPatternScript()}
        
        // Override Performance API
        ${this.getPerformanceAPIScript()}
        
        // Override Function prototype for optimization simulation
        ${this.getFunctionOptimizationScript()}
        
        // Override Object methods for engine-specific behavior
        ${this.getObjectMethodScript()}
        
        // Override Array methods for engine-specific optimizations
        ${this.getArrayOptimizationScript()}
        
        // Override String methods for engine-specific implementations
        ${this.getStringImplementationScript()}
        
        // Override RegExp for engine-specific regex behavior
        ${this.getRegExpScript()}
        
        // Override JSON methods
        ${this.getJSONScript()}
        
        // Override Promise for engine-specific microtask scheduling
        ${this.getPromiseScript()}
        
        // Override WeakMap/WeakSet for GC behavior
        ${this.getWeakReferenceScript()}
        
        // Override Proxy for engine-specific trap behavior
        ${this.getProxyScript()}
        
        // Override Symbol for engine-specific implementation
        ${this.getSymbolScript()}
        
        // Memory pressure simulation
        ${this.getMemoryPressureScript()}
        
        // JIT compilation simulation
        ${this.getJITSimulationScript()}
        
      })();
    `;
    }
    getErrorPatternScript() {
        const format = this.config.errorPatterns.stackTraceFormat;
        return `
      const originalError = Error;
      const originalPrepareStackTrace = Error.prepareStackTrace;
      
      Error = function(...args) {
        const error = new originalError(...args);
        
        // Customize stack trace format based on engine
        if (engineConfig.errorPatterns.stackTraceFormat === 'v8') {
          Object.defineProperty(error, 'stack', {
            get: function() {
              return this.message + '\\n    at ' + 
                     (this.fileName || '<anonymous>') + ':' + 
                     (this.lineNumber || 1) + ':' + 
                     (this.columnNumber || 1);
            }
          });
        } else if (engineConfig.errorPatterns.stackTraceFormat === 'spidermonkey') {
          Object.defineProperty(error, 'stack', {
            get: function() {
              return this.name + ': ' + this.message + '\\n@' + 
                     (this.fileName || '') + ':' + 
                     (this.lineNumber || 1) + ':' + 
                     (this.columnNumber || 1);
            }
          });
        } else if (engineConfig.errorPatterns.stackTraceFormat === 'jsc') {
          Object.defineProperty(error, 'stack', {
            get: function() {
              return this.name + ': ' + this.message + '\\n' + 
                     'global code@' + (this.sourceURL || '') + ':' + 
                     (this.line || 1) + ':' + (this.column || 1);
            }
          });
        }
        
        return error;
      };
      
      Error.prototype = originalError.prototype;
      Error.captureStackTrace = originalError.captureStackTrace;
      Error.prepareStackTrace = originalPrepareStackTrace;
    `;
    }
    getPerformanceAPIScript() {
        return `
      if (typeof performance !== 'undefined') {
        const originalNow = performance.now.bind(performance);
        const startTime = originalNow();
        let simulatedTime = 0;
        
        performance.now = function() {
          const realElapsed = originalNow() - startTime;
          const engineFactor = engineConfig.engine === 'v8' ? 0.98 : 
                              engineConfig.engine === 'spidermonkey' ? 1.02 : 1.0;
          
          // Add engine-specific timing characteristics
          simulatedTime = realElapsed * engineFactor + 
                         (Math.random() - 0.5) * 0.01; // Sub-millisecond jitter
          
          return simulatedTime;
        };
        
        // Override mark and measure for engine-specific behavior
        const originalMark = performance.mark;
        const originalMeasure = performance.measure;
        
        performance.mark = function(name) {
          const delay = performanceMetrics['function-call-overhead'] || 0;
          setTimeout(() => originalMark.call(this, name), delay);
        };
        
        performance.measure = function(name, startMark, endMark) {
          const delay = performanceMetrics['function-call-overhead'] * 2 || 0;
          setTimeout(() => originalMeasure.call(this, name, startMark, endMark), delay);
        };
      }
    `;
    }
    getFunctionOptimizationScript() {
        return `
      const originalCall = Function.prototype.call;
      const originalApply = Function.prototype.apply;
      const optimizationCounters = new Map();
      
      Function.prototype.call = function(...args) {
        const key = this.toString().slice(0, 100); // Use function signature as key
        const count = optimizationCounters.get(key) || 0;
        optimizationCounters.set(key, count + 1);
        
        // Simulate JIT optimization threshold
        if (count > engineConfig.optimizations.jitThreshold) {
          // "Optimized" version with slight performance boost
          const delay = performanceMetrics['function-call-overhead'] * 0.8;
          if (delay > 0) {
            return new Promise(resolve => {
              setTimeout(() => resolve(originalCall.apply(this, args)), delay);
            });
          }
        }
        
        const delay = performanceMetrics['function-call-overhead'];
        if (delay > 0) {
          return new Promise(resolve => {
            setTimeout(() => resolve(originalCall.apply(this, args)), delay);
          });
        }
        
        return originalCall.apply(this, args);
      };
      
      Function.prototype.apply = function(thisArg, argsArray) {
        const key = this.toString().slice(0, 100);
        const count = optimizationCounters.get(key) || 0;
        optimizationCounters.set(key, count + 1);
        
        if (count > engineConfig.optimizations.jitThreshold) {
          const delay = performanceMetrics['function-call-overhead'] * 0.8;
          if (delay > 0) {
            return new Promise(resolve => {
              setTimeout(() => resolve(originalApply.call(this, thisArg, argsArray)), delay);
            });
          }
        }
        
        const delay = performanceMetrics['function-call-overhead'];
        if (delay > 0) {
          return new Promise(resolve => {
            setTimeout(() => resolve(originalApply.call(this, thisArg, argsArray)), delay);
          });
        }
        
        return originalApply.call(this, thisArg, argsArray);
      };
    `;
    }
    getObjectMethodScript() {
        return `
      const originalCreate = Object.create;
      const originalDefineProperty = Object.defineProperty;
      const originalKeys = Object.keys;
      
      Object.create = function(proto, propertiesObject) {
        const delay = performanceMetrics['object-creation-time'];
        if (delay > 0) {
          const result = originalCreate(proto, propertiesObject);
          // Add slight delay to simulate engine-specific object creation
          setTimeout(() => {}, delay);
          return result;
        }
        return originalCreate(proto, propertiesObject);
      };
      
      Object.defineProperty = function(obj, prop, descriptor) {
        const delay = performanceMetrics['property-access-time'];
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalDefineProperty(obj, prop, descriptor);
      };
      
      Object.keys = function(obj) {
        const delay = performanceMetrics['property-access-time'] * Object.keys(obj || {}).length;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalKeys(obj);
      };
    `;
    }
    getArrayOptimizationScript() {
        return `
      const originalPush = Array.prototype.push;
      const originalPop = Array.prototype.pop;
      const originalSlice = Array.prototype.slice;
      const originalMap = Array.prototype.map;
      
      Array.prototype.push = function(...items) {
        const delay = performanceMetrics['array-access-time'] * items.length;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalPush.apply(this, items);
      };
      
      Array.prototype.pop = function() {
        const delay = performanceMetrics['array-access-time'];
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalPop.call(this);
      };
      
      Array.prototype.slice = function(start, end) {
        const length = Math.abs((end || this.length) - (start || 0));
        const delay = performanceMetrics['array-access-time'] * length * 0.1;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalSlice.call(this, start, end);
      };
      
      Array.prototype.map = function(callback, thisArg) {
        const delay = performanceMetrics['array-access-time'] * this.length * 0.2;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalMap.call(this, callback, thisArg);
      };
    `;
    }
    getStringImplementationScript() {
        return `
      const originalConcat = String.prototype.concat;
      const originalSubstring = String.prototype.substring;
      const originalReplace = String.prototype.replace;
      
      String.prototype.concat = function(...strings) {
        const totalLength = strings.reduce((sum, s) => sum + s.length, this.length);
        const delay = performanceMetrics['string-concatenation-time'] * totalLength * 0.01;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalConcat.apply(this, strings);
      };
      
      String.prototype.substring = function(start, end) {
        const length = Math.abs((end || this.length) - start);
        const delay = performanceMetrics['string-concatenation-time'] * length * 0.001;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalSubstring.call(this, start, end);
      };
      
      String.prototype.replace = function(searchValue, replaceValue) {
        const delay = performanceMetrics['string-concatenation-time'] * this.length * 0.005;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalReplace.call(this, searchValue, replaceValue);
      };
    `;
    }
    getRegExpScript() {
        return `
      const originalExec = RegExp.prototype.exec;
      const originalTest = RegExp.prototype.test;
      
      RegExp.prototype.exec = function(string) {
        const complexity = this.source.length + (string ? string.length : 0);
        const delay = performanceMetrics['regexp-execution-time'] * complexity * 0.0001;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalExec.call(this, string);
      };
      
      RegExp.prototype.test = function(string) {
        const complexity = this.source.length + (string ? string.length : 0);
        const delay = performanceMetrics['regexp-execution-time'] * complexity * 0.0001;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalTest.call(this, string);
      };
    `;
    }
    getJSONScript() {
        return `
      const originalParse = JSON.parse;
      const originalStringify = JSON.stringify;
      
      JSON.parse = function(text, reviver) {
        const delay = performanceMetrics['json-parse-time'] * (text ? text.length : 0) * 0.001;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalParse(text, reviver);
      };
      
      JSON.stringify = function(value, replacer, space) {
        const estimatedSize = typeof value === 'object' ? 
          Object.keys(value || {}).length * 10 : 
          String(value).length;
        const delay = performanceMetrics['json-stringify-time'] * estimatedSize * 0.001;
        if (delay > 0) {
          setTimeout(() => {}, delay);
        }
        return originalStringify(value, replacer, space);
      };
    `;
    }
    getPromiseScript() {
        return `
      const originalPromise = Promise;
      const originalThen = Promise.prototype.then;
      
      // Engine-specific microtask scheduling
      Promise.prototype.then = function(onFulfilled, onRejected) {
        const engineDelay = engineConfig.engine === 'v8' ? 0 : 
                           engineConfig.engine === 'spidermonkey' ? 0.1 : 0.05;
        
        if (engineDelay > 0) {
          return originalThen.call(this, 
            onFulfilled ? (...args) => {
              setTimeout(() => onFulfilled(...args), engineDelay);
            } : undefined,
            onRejected ? (...args) => {
              setTimeout(() => onRejected(...args), engineDelay);
            } : undefined
          );
        }
        
        return originalThen.call(this, onFulfilled, onRejected);
      };
    `;
    }
    getWeakReferenceScript() {
        return `
      const originalWeakMap = WeakMap;
      const originalWeakSet = WeakSet;
      
      // Simulate GC interaction with weak references
      const gcSimulation = {
        references: new Set(),
        lastGC: Date.now(),
        
        addReference: function(ref) {
          this.references.add(ref);
        },
        
        simulateGC: function() {
          const now = Date.now();
          if (now - this.lastGC > engineConfig.gcBehavior.pauseTime * 10) {
            // Randomly "collect" some references
            const toRemove = Array.from(this.references).slice(0, 
              Math.floor(this.references.size * 0.1));
            toRemove.forEach(ref => this.references.delete(ref));
            this.lastGC = now;
          }
        }
      };
      
      WeakMap = function(...args) {
        const wm = new originalWeakMap(...args);
        gcSimulation.addReference(wm);
        return wm;
      };
      
      WeakSet = function(...args) {
        const ws = new originalWeakSet(...args);
        gcSimulation.addReference(ws);
        return ws;
      };
      
      // Periodically simulate GC
      setInterval(() => gcSimulation.simulateGC(), 1000);
    `;
    }
    getProxyScript() {
        return `
      const originalProxy = Proxy;
      
      Proxy = function(target, handler) {
        // Engine-specific proxy trap behavior
        const engineHandler = { ...handler };
        
        if (engineConfig.engine === 'v8') {
          // V8-specific proxy optimizations
          const originalGet = handler.get;
          if (originalGet) {
            engineHandler.get = function(target, property, receiver) {
              const delay = performanceMetrics['property-access-time'] * 0.5;
              if (delay > 0) {
                setTimeout(() => {}, delay);
              }
              return originalGet.call(this, target, property, receiver);
            };
          }
        }
        
        return new originalProxy(target, engineHandler);
      };
    `;
    }
    getSymbolScript() {
        return `
      const originalSymbol = Symbol;
      const symbolRegistry = new Map();
      
      Symbol = function(description) {
        const sym = originalSymbol(description);
        
        // Engine-specific symbol behavior
        if (engineConfig.engine === 'v8') {
          // V8 has specific symbol optimization patterns
          symbolRegistry.set(sym, {
            description,
            created: Date.now(),
            engine: 'v8'
          });
        }
        
        return sym;
      };
      
      // Copy static methods
      Object.setPrototypeOf(Symbol, originalSymbol);
      Symbol.for = originalSymbol.for;
      Symbol.keyFor = originalSymbol.keyFor;
      Symbol.iterator = originalSymbol.iterator;
      Symbol.asyncIterator = originalSymbol.asyncIterator;
      Symbol.hasInstance = originalSymbol.hasInstance;
      Symbol.isConcatSpreadable = originalSymbol.isConcatSpreadable;
      Symbol.species = originalSymbol.species;
      Symbol.toPrimitive = originalSymbol.toPrimitive;
      Symbol.toStringTag = originalSymbol.toStringTag;
    `;
    }
    getMemoryPressureScript() {
        return `
      const memoryPressure = {
        heapSize: engineConfig.gcBehavior.heapSize,
        usedMemory: 0,
        pressure: engineConfig.gcBehavior.gcPressure,
        
        allocate: function(size) {
          this.usedMemory += size;
          if (this.usedMemory / this.heapSize > 0.8) {
            // Trigger GC simulation
            this.collect();
          }
        },
        
        collect: function() {
          this.usedMemory *= (1 - this.pressure);
          // Simulate GC pause
          const pauseTime = engineConfig.gcBehavior.pauseTime;
          if (pauseTime > 0) {
            const start = performance.now();
            while (performance.now() - start < pauseTime) {
              // Busy wait to simulate GC pause
            }
          }
        }
      };
      
      // Hook into object creation to simulate memory allocation
      const originalCreate = Object.create;
      Object.create = function(...args) {
        memoryPressure.allocate(100); // Estimate object size
        return originalCreate.apply(this, args);
      };
    `;
    }
    getJITSimulationScript() {
        return `
      const jitSimulation = {
        hotFunctions: new Map(),
        optimizationThreshold: engineConfig.optimizations.jitThreshold,
        
        recordExecution: function(func) {
          const key = func.toString().slice(0, 50);
          const count = this.hotFunctions.get(key) || 0;
          this.hotFunctions.set(key, count + 1);
          
          if (count === this.optimizationThreshold) {
            // Function just got optimized
            this.optimizeFunction(func, key);
          }
        },
        
        optimizeFunction: function(func, key) {
          // Simulate optimization by improving performance metrics
          const originalPerformance = performanceMetrics['function-call-overhead'];
          performanceMetrics['function-call-overhead'] = originalPerformance * 0.7;
          
          // Revert after some time (deoptimization)
          setTimeout(() => {
            if (Math.random() < 0.1) { // 10% chance of deoptimization
              performanceMetrics['function-call-overhead'] = originalPerformance * 1.2;
            }
          }, 10000 + Math.random() * 20000);
        }
      };
      
      // Hook into function calls to track hot functions
      const originalCall = Function.prototype.call;
      Function.prototype.call = function(...args) {
        jitSimulation.recordExecution(this);
        return originalCall.apply(this, args);
      };
    `;
    }
    destroy() {
        if (this.gcScheduler) {
            clearInterval(this.gcScheduler);
            this.gcScheduler = null;
        }
        this.performanceMetrics.clear();
        this.optimizationCounters.clear();
    }
}
exports.JavaScriptEngineEmulator = JavaScriptEngineEmulator;
// Predefined engine configurations
exports.engineConfigs = {
    chrome: {
        engine: 'v8',
        version: '12.0.267.8',
        features: ['harmony', 'es2023', 'webassembly'],
        optimizations: {
            jitThreshold: 100,
            inlineThreshold: 600,
            optimizationTier: 'optimized',
            hotSpotDetection: true,
            speculativeOptimization: true
        },
        gcBehavior: {
            algorithm: 'incremental',
            heapSize: 1024 * 1024 * 1024, // 1GB
            gcPressure: 0.6,
            allocationPattern: 'pooled',
            pauseTime: 2
        },
        errorPatterns: {
            stackTraceFormat: 'v8',
            errorMessageStyle: 'chromium',
            sourceMapSupport: true,
            asyncStackTraces: true
        }
    },
    firefox: {
        engine: 'spidermonkey',
        version: '109.0',
        features: ['es2023', 'webassembly', 'simd'],
        optimizations: {
            jitThreshold: 1000,
            inlineThreshold: 400,
            optimizationTier: 'baseline',
            hotSpotDetection: true,
            speculativeOptimization: false
        },
        gcBehavior: {
            algorithm: 'generational',
            heapSize: 512 * 1024 * 1024, // 512MB
            gcPressure: 0.7,
            allocationPattern: 'linear',
            pauseTime: 5
        },
        errorPatterns: {
            stackTraceFormat: 'spidermonkey',
            errorMessageStyle: 'firefox',
            sourceMapSupport: true,
            asyncStackTraces: false
        }
    },
    safari: {
        engine: 'javascriptcore',
        version: '616.1.17.2',
        features: ['es2023', 'webassembly'],
        optimizations: {
            jitThreshold: 500,
            inlineThreshold: 800,
            optimizationTier: 'optimized',
            hotSpotDetection: true,
            speculativeOptimization: true
        },
        gcBehavior: {
            algorithm: 'mark-sweep',
            heapSize: 768 * 1024 * 1024, // 768MB
            gcPressure: 0.5,
            allocationPattern: 'fragmented',
            pauseTime: 3
        },
        errorPatterns: {
            stackTraceFormat: 'jsc',
            errorMessageStyle: 'safari',
            sourceMapSupport: false,
            asyncStackTraces: true
        }
    }
};
//# sourceMappingURL=javascript-engine.js.map