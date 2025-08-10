"use strict";
/**
 * WebAssembly Fingerprinting Protection
 * Provides comprehensive protection against WASM-based fingerprinting techniques
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmProtection = void 0;
class WasmProtection {
    static getWasmCapabilityProtection() {
        return `
      // WebAssembly Capability Protection
      if (typeof WebAssembly !== 'undefined') {
        const originalCompile = WebAssembly.compile;
        const originalInstantiate = WebAssembly.instantiate;
        const originalValidate = WebAssembly.validate;
        const originalCompileStreaming = WebAssembly.compileStreaming;
        const originalInstantiateStreaming = WebAssembly.instantiateStreaming;
        
        // Normalize WASM compilation capabilities
        WebAssembly.compile = async function(bytes) {
          try {
            // Add consistent timing delay to mask hardware differences
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5 + 10));
            
            const module = await originalCompile.call(this, bytes);
            
            // Normalize module characteristics
            if (module) {
              Object.defineProperty(module, 'exports', {
                get: () => ({}), // Hide actual exports for fingerprinting protection
                configurable: true
              });
            }
            
            return module;
          } catch (error) {
            // Normalize error messages
            const normalizedError = new Error('WebAssembly compilation failed');
            normalizedError.name = 'CompileError';
            throw normalizedError;
          }
        };
        
        WebAssembly.instantiate = async function(bytes, importObject) {
          try {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 8 + 15));
            
            const result = await originalInstantiate.call(this, bytes, importObject);
            
            // Normalize instance characteristics
            if (result.instance) {
              // Hide memory details that could be fingerprinted
              if (result.instance.exports && result.instance.exports.memory) {
                const originalMemory = result.instance.exports.memory;
                Object.defineProperty(result.instance.exports, 'memory', {
                  get: () => ({
                    buffer: originalMemory.buffer,
                    grow: originalMemory.grow.bind(originalMemory),
                    // Normalize buffer characteristics
                    toString: () => '[object WebAssembly.Memory]'
                  }),
                  configurable: true
                });
              }
            }
            
            return result;
          } catch (error) {
            const normalizedError = new Error('WebAssembly instantiation failed');
            normalizedError.name = error.name === 'LinkError' ? 'LinkError' : 'RuntimeError';
            throw normalizedError;
          }
        };
        
        WebAssembly.validate = function(bytes) {
          try {
            const result = originalValidate.call(this, bytes);
            // Add consistent timing to mask validation performance
            return result;
          } catch (error) {
            return false;
          }
        };
        
        // Override streaming compilation if available
        if (originalCompileStreaming) {
          WebAssembly.compileStreaming = async function(source) {
            try {
              await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 20));
              return await originalCompileStreaming.call(this, source);
            } catch (error) {
              throw new Error('WebAssembly streaming compilation failed');
            }
          };
        }
        
        if (originalInstantiateStreaming) {
          WebAssembly.instantiateStreaming = async function(source, importObject) {
            try {
              await new Promise(resolve => setTimeout(resolve, Math.random() * 12 + 25));
              return await originalInstantiateStreaming.call(this, source, importObject);
            } catch (error) {
              throw new Error('WebAssembly streaming instantiation failed');
            }
          };
        }
      }
    `;
    }
    static getWasmFeatureDetectionProtection() {
        const features = JSON.stringify(WasmProtection.normalizedFeatures);
        return `
      // WASM Feature Detection Protection
      if (typeof WebAssembly !== 'undefined') {
        const normalizedFeatures = ${features};
        
        // Override feature detection through compilation
        const originalCompile = WebAssembly.compile;
        WebAssembly.compile = async function(bytes) {
          try {
            // Pre-validate against normalized feature set
            const moduleBuffer = new Uint8Array(bytes);
            
            // Basic WASM magic number check
            if (moduleBuffer.length < 8 || 
                moduleBuffer[0] !== 0x00 || moduleBuffer[1] !== 0x61 ||
                moduleBuffer[2] !== 0x73 || moduleBuffer[3] !== 0x6D) {
              throw new Error('Invalid WebAssembly module');
            }
            
            // Simulate feature checking
            const hasUnsupportedFeatures = this._checkUnsupportedFeatures(moduleBuffer);
            if (hasUnsupportedFeatures) {
              throw new Error('WebAssembly module uses unsupported features');
            }
            
            return await originalCompile.call(this, bytes);
          } catch (error) {
            throw new Error('WebAssembly compilation failed: ' + error.message);
          }
        };
        
        // Add feature checking helper
        WebAssembly._checkUnsupportedFeatures = function(moduleBuffer) {
          // Simple heuristic-based feature detection
          const moduleString = Array.from(moduleBuffer).map(b => b.toString(16)).join('');
          
          // Check for unsupported features based on our normalized set
          if (!normalizedFeatures.threads && moduleString.includes('atomic')) {
            return true;
          }
          if (!normalizedFeatures.exception_handling && moduleString.includes('exception')) {
            return true;
          }
          if (!normalizedFeatures.tail_call && moduleString.includes('return_call')) {
            return true;
          }
          
          return false;
        };
        
        // Override Memory constructor to normalize capabilities
        if (typeof WebAssembly.Memory !== 'undefined') {
          const OriginalMemory = WebAssembly.Memory;
          
          WebAssembly.Memory = function(descriptor) {
            // Normalize memory limits
            const normalizedDescriptor = {
              initial: Math.min(descriptor.initial || 1, 256), // Max 16MB initial
              maximum: descriptor.maximum ? Math.min(descriptor.maximum, 1024) : 1024, // Max 64MB
              shared: false // Always disable shared memory
            };
            
            return new OriginalMemory(normalizedDescriptor);
          };
          
          WebAssembly.Memory.prototype = OriginalMemory.prototype;
        }
        
        // Override Table constructor
        if (typeof WebAssembly.Table !== 'undefined') {
          const OriginalTable = WebAssembly.Table;
          
          WebAssembly.Table = function(descriptor) {
            // Normalize table characteristics
            const normalizedDescriptor = {
              element: descriptor.element || 'funcref',
              initial: Math.min(descriptor.initial || 0, 1000),
              maximum: descriptor.maximum ? Math.min(descriptor.maximum, 1000) : undefined
            };
            
            return new OriginalTable(normalizedDescriptor);
          };
          
          WebAssembly.Table.prototype = OriginalTable.prototype;
        }
      }
    `;
    }
    static getWasmPerformanceProtection() {
        return `
      // WASM Performance Fingerprinting Protection
      if (typeof WebAssembly !== 'undefined' && typeof performance !== 'undefined') {
        // Override performance measurements for WASM operations
        const originalNow = performance.now;
        let wasmOperationActive = false;
        
        performance.now = function() {
          const realTime = originalNow.call(this);
          
          if (wasmOperationActive) {
            // Add consistent noise to WASM timing measurements
            const noise = (Math.random() - 0.5) * 2; // ±1ms noise
            return Math.round((realTime + noise) * 10) / 10; // Round to 0.1ms
          }
          
          return realTime;
        };
        
        // Wrap WASM operations to detect when timing protection is needed
        const wrapWasmOperation = (originalFn, context) => {
          return async function(...args) {
            wasmOperationActive = true;
            try {
              const result = await originalFn.apply(context, args);
              return result;
            } finally {
              wasmOperationActive = false;
            }
          };
        };
        
        if (WebAssembly.compile) {
          WebAssembly.compile = wrapWasmOperation(WebAssembly.compile, WebAssembly);
        }
        
        if (WebAssembly.instantiate) {
          WebAssembly.instantiate = wrapWasmOperation(WebAssembly.instantiate, WebAssembly);
        }
        
        // Override WASM instance method calls for timing protection
        const originalInstantiate = WebAssembly.instantiate;
        WebAssembly.instantiate = async function(bytes, importObject) {
          const result = await originalInstantiate.call(this, bytes, importObject);
          
          if (result.instance && result.instance.exports) {
            // Wrap exported functions to normalize execution timing
            Object.keys(result.instance.exports).forEach(exportName => {
              const exportValue = result.instance.exports[exportName];
              if (typeof exportValue === 'function') {
                result.instance.exports[exportName] = function(...args) {
                  const start = performance.now();
                  const result = exportValue.apply(this, args);
                  const duration = performance.now() - start;
                  
                  // Add consistent delay to normalize timing
                  const normalizedDelay = Math.max(0, 1 - duration); // Minimum 1ms execution
                  if (normalizedDelay > 0) {
                    const endTime = performance.now() + normalizedDelay;
                    while (performance.now() < endTime) {
                      // Busy wait for precise timing
                    }
                  }
                  
                  return result;
                };
              }
            });
          }
          
          return result;
        };
      }
    `;
    }
    static getWasmMemoryProtection() {
        return `
      // WASM Memory Fingerprinting Protection
      if (typeof WebAssembly !== 'undefined' && typeof WebAssembly.Memory !== 'undefined') {
        const OriginalMemory = WebAssembly.Memory;
        
        WebAssembly.Memory = function(descriptor) {
          const memory = new OriginalMemory(descriptor);
          
          // Override buffer property to prevent memory layout fingerprinting
          Object.defineProperty(memory, 'buffer', {
            get: function() {
              const originalBuffer = OriginalMemory.prototype.buffer;
              const buffer = originalBuffer.call(this);
              
              // Create a proxy to normalize buffer characteristics
              return new Proxy(buffer, {
                get: function(target, property) {
                  if (property === 'byteLength') {
                    // Round to nearest page size (64KB) for consistency
                    return Math.ceil(target.byteLength / 65536) * 65536;
                  }
                  
                  return target[property];
                },
                
                getOwnPropertyDescriptor: function(target, property) {
                  if (property === 'byteLength') {
                    return {
                      value: Math.ceil(target.byteLength / 65536) * 65536,
                      writable: false,
                      enumerable: true,
                      configurable: false
                    };
                  }
                  
                  return Object.getOwnPropertyDescriptor(target, property);
                }
              });
            },
            configurable: true
          });
          
          // Override grow method to normalize growth behavior
          const originalGrow = memory.grow;
          memory.grow = function(delta) {
            // Normalize growth patterns
            const normalizedDelta = Math.max(1, Math.min(delta, 64)); // 1-64 pages
            return originalGrow.call(this, normalizedDelta);
          };
          
          return memory;
        };
        
        WebAssembly.Memory.prototype = OriginalMemory.prototype;
      }
    `;
    }
    static getAllWasmProtections() {
        return `
      ${this.getWasmCapabilityProtection()}
      ${this.getWasmFeatureDetectionProtection()}
      ${this.getWasmPerformanceProtection()}
      ${this.getWasmMemoryProtection()}
    `;
    }
}
exports.WasmProtection = WasmProtection;
WasmProtection.normalizedFeatures = {
    // Common WASM features supported across browsers
    threads: false,
    simd: true,
    bulk_memory: true,
    multi_value: true,
    reference_types: false,
    sign_extension: true,
    saturated_float_to_int: true,
    exception_handling: false,
    tail_call: false,
    extended_const: false,
    relaxed_simd: false,
    memory64: false
};
//# sourceMappingURL=wasm-protection.js.map