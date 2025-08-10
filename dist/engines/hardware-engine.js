"use strict";
/**
 * Hardware-Level Emulation System
 * Complete CPU, GPU, Memory, and Sensor emulation for deep fingerprinting protection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardwareConfigs = exports.HardwareEmulator = void 0;
class HardwareEmulator {
    constructor(config) {
        this.performanceCounters = new Map();
        this.config = config;
        this.thermalModel = new ThermalModel(config.thermal);
        this.powerModel = new PowerModel(config.power);
        this.sensorSimulator = new SensorSimulator(config.sensors);
        this.memoryManager = new MemoryManager(config.memory);
        this.initializePerformanceCounters();
    }
    initializePerformanceCounters() {
        // Initialize CPU performance counters
        this.performanceCounters.set('cpu-cycles', 0);
        this.performanceCounters.set('instructions', 0);
        this.performanceCounters.set('cache-misses', 0);
        this.performanceCounters.set('branch-misses', 0);
        this.performanceCounters.set('page-faults', 0);
        this.performanceCounters.set('context-switches', 0);
        this.performanceCounters.set('interrupts', 0);
        // Initialize GPU performance counters
        this.performanceCounters.set('gpu-utilization', 0);
        this.performanceCounters.set('memory-bandwidth', 0);
        this.performanceCounters.set('shader-operations', 0);
        this.performanceCounters.set('texture-cache-hits', 0);
        // Initialize memory performance counters
        this.performanceCounters.set('memory-reads', 0);
        this.performanceCounters.set('memory-writes', 0);
        this.performanceCounters.set('swap-operations', 0);
        this.performanceCounters.set('gc-collections', 0);
    }
    getInjectionScript() {
        return `
      (function() {
        const hardwareConfig = ${JSON.stringify(this.config)};
        
        // CPU Information and Performance
        ${this.getCPUScript()}
        
        // GPU Information and WebGL Context
        ${this.getGPUScript()}
        
        // Memory Management
        ${this.getMemoryScript()}
        
        // Device Sensors
        ${this.getSensorScript()}
        
        // Power Management
        ${this.getPowerScript()}
        
        // Thermal Management
        ${this.getThermalScript()}
        
        // Network Hardware
        ${this.getNetworkScript()}
        
        // Audio Hardware
        ${this.getAudioScript()}
        
        // Performance API Enhancement
        ${this.getPerformanceScript()}
        
        // Hardware Lifecycle Simulation
        ${this.getLifecycleScript()}
        
      })();
    `;
    }
    getCPUScript() {
        return `
      // CPU Information Override
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => hardwareConfig.cpu.threads,
        configurable: true
      });
      
      // CPU Performance Simulation
      const cpuPerformance = {
        currentFrequency: hardwareConfig.cpu.baseFrequency,
        utilization: 0,
        temperature: 35, // Base temperature in Celsius
        throttling: false,
        
        executeInstruction: function(instructionType) {
          const timing = hardwareConfig.cpu.instructionTiming.get(instructionType) || 1;
          const thermalFactor = this.temperature > 70 ? 1.2 : 1.0;
          const frequencyFactor = this.currentFrequency / hardwareConfig.cpu.maxFrequency;
          
          return timing * thermalFactor / frequencyFactor;
        },
        
        updateUtilization: function(load) {
          this.utilization = Math.max(0, Math.min(100, load));
          
          // Update frequency based on load (turbo boost simulation)
          if (this.utilization > 80) {
            this.currentFrequency = Math.min(
              hardwareConfig.cpu.maxFrequency,
              this.currentFrequency * 1.1
            );
          } else if (this.utilization < 20) {
            this.currentFrequency = Math.max(
              hardwareConfig.cpu.baseFrequency * 0.8,
              this.currentFrequency * 0.9
            );
          }
          
          // Update temperature based on utilization
          const targetTemp = 35 + (this.utilization * 0.4);
          this.temperature = this.temperature * 0.9 + targetTemp * 0.1;
          
          // Thermal throttling
          if (this.temperature > hardwareConfig.thermal.throttlingThreshold) {
            this.throttling = true;
            this.currentFrequency *= 0.8;
          } else {
            this.throttling = false;
          }
        }
      };
      
      // Override setTimeout and setInterval for CPU timing simulation
      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;
      
      window.setTimeout = function(callback, delay, ...args) {
        cpuPerformance.updateUtilization(cpuPerformance.utilization + 1);
        const adjustedDelay = delay * cpuPerformance.executeInstruction('branch');
        return originalSetTimeout(callback, adjustedDelay, ...args);
      };
      
      window.setInterval = function(callback, interval, ...args) {
        cpuPerformance.updateUtilization(cpuPerformance.utilization + 2);
        const adjustedInterval = interval * cpuPerformance.executeInstruction('loop');
        return originalSetInterval(callback, adjustedInterval, ...args);
      };
      
      // CPU Feature Detection
      window.cpuFeatures = {
        hasSSE: hardwareConfig.cpu.features.includes('SSE'),
        hasAVX: hardwareConfig.cpu.features.includes('AVX'),
        hasAVX2: hardwareConfig.cpu.features.includes('AVX2'),
        hasAVX512: hardwareConfig.cpu.features.includes('AVX512'),
        hasAES: hardwareConfig.cpu.features.includes('AES-NI'),
        architecture: hardwareConfig.cpu.architecture,
        vendor: hardwareConfig.cpu.vendor,
        model: hardwareConfig.cpu.model
      };
    `;
    }
    getGPUScript() {
        return `
      // Enhanced WebGL Context Override
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
        const context = originalGetContext.call(this, contextType, contextAttributes);
        
        if (contextType === 'webgl' || contextType === 'webgl2') {
          const gpuConfig = hardwareConfig.gpu;
          
          // Override GPU parameters
          context.getParameter = new Proxy(context.getParameter, {
            apply(target, self, args) {
              const param = args[0];
              
              // GPU Vendor and Model
              if (param === self.VENDOR) return gpuConfig.vendor;
              if (param === self.RENDERER) {
                return \`\${gpuConfig.vendor} \${gpuConfig.model}\`;
              }
              if (param === self.VERSION) {
                return \`WebGL \${contextType === 'webgl2' ? '2.0' : '1.0'} (\${gpuConfig.apiSupport.opengl})\`;
              }
              if (param === self.SHADING_LANGUAGE_VERSION) {
                return \`WebGL GLSL ES \${contextType === 'webgl2' ? '3.00' : '1.00'}\`;
              }
              
              // Memory and Performance Parameters
              if (param === self.MAX_TEXTURE_SIZE) return gpuConfig.renderingCapabilities.maxTextureSize;
              if (param === self.MAX_VIEWPORT_DIMS) return new Int32Array(gpuConfig.renderingCapabilities.maxViewportDims);
              if (param === self.MAX_VERTEX_ATTRIBS) return gpuConfig.renderingCapabilities.maxVertexAttributes;
              if (param === self.MAX_FRAGMENT_UNIFORM_VECTORS) return gpuConfig.renderingCapabilities.maxFragmentUniformVectors;
              if (param === self.MAX_VARYING_VECTORS) return gpuConfig.renderingCapabilities.maxVaryingVectors;
              
              // Compute Shader Parameters (WebGL 2.0)
              if (contextType === 'webgl2') {
                if (param === self.MAX_COMPUTE_WORK_GROUP_SIZE) {
                  return new Int32Array([1024, 1024, 64]);
                }
                if (param === self.MAX_COMPUTE_WORK_GROUP_INVOCATIONS) {
                  return 1024;
                }
              }
              
              return Reflect.apply(target, self, args);
            }
          });
          
          // GPU Extension Support
          context.getSupportedExtensions = function() {
            return gpuConfig.extensions.filter(ext => {
              // Vendor-specific extension filtering
              if (gpuConfig.vendor === 'NVIDIA' && ext.includes('WEBGL_lose_context')) return true;
              if (gpuConfig.vendor === 'AMD' && ext.includes('EXT_texture_filter_anisotropic')) return true;
              if (gpuConfig.vendor === 'Intel' && ext.includes('WEBGL_compressed_texture_s3tc')) return false;
              return Math.random() > 0.1; // 90% chance to support extension
            });
          };
          
          context.getExtension = function(name) {
            const supportedExts = this.getSupportedExtensions();
            if (!supportedExts.includes(name)) return null;
            
            // Return mock extension object
            return {
              [name.toUpperCase() + '_EXTENSION']: true
            };
          };
          
          // GPU Performance Simulation
          const gpuPerformance = {
            utilization: 0,
            temperature: 40,
            memoryUsed: 0,
            clockSpeed: gpuConfig.baseClockSpeed,
            
            executeShader: function(complexity) {
              this.utilization = Math.min(100, this.utilization + complexity * 0.1);
              this.temperature = Math.min(85, this.temperature + this.utilization * 0.05);
              
              // Dynamic clock scaling
              if (this.temperature > 75) {
                this.clockSpeed = Math.max(gpuConfig.baseClockSpeed * 0.8, this.clockSpeed * 0.95);
              } else if (this.utilization > 90) {
                this.clockSpeed = Math.min(gpuConfig.baseClockSpeed * 1.2, this.clockSpeed * 1.05);
              }
              
              return (1000000 / this.clockSpeed) * complexity;
            }
          };
          
          // Override draw calls to simulate GPU load
          const originalDrawArrays = context.drawArrays;
          context.drawArrays = function(mode, first, count) {
            const complexity = count * 0.001;
            const executionTime = gpuPerformance.executeShader(complexity);
            
            setTimeout(() => {}, executionTime);
            return originalDrawArrays.call(this, mode, first, count);
          };
          
          const originalDrawElements = context.drawElements;
          context.drawElements = function(mode, count, type, offset) {
            const complexity = count * 0.002;
            const executionTime = gpuPerformance.executeShader(complexity);
            
            setTimeout(() => {}, executionTime);
            return originalDrawElements.call(this, mode, count, type, offset);
          };
        }
        
        return context;
      };
    `;
    }
    getMemoryScript() {
        return `
      // Enhanced Device Memory Override
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => hardwareConfig.memory.total,
        configurable: true
      });
      
      // Memory Management Simulation
      const memoryManager = {
        totalMemory: hardwareConfig.memory.total * 1024 * 1024 * 1024, // Convert to bytes
        usedMemory: 0,
        allocations: new Map(),
        gcPressure: 0,
        pageSize: 4096,
        
        allocate: function(size, type = 'object') {
          const alignedSize = Math.ceil(size / this.pageSize) * this.pageSize;
          this.usedMemory += alignedSize;
          
          const allocation = {
            size: alignedSize,
            type: type,
            timestamp: performance.now(),
            address: Math.random().toString(36).substr(2, 9)
          };
          
          this.allocations.set(allocation.address, allocation);
          
          // Update GC pressure
          this.gcPressure = this.usedMemory / this.totalMemory;
          
          // Trigger GC if memory pressure is high
          if (this.gcPressure > 0.8) {
            this.collectGarbage();
          }
          
          // Simulate memory allocation delay
          const latency = this.calculateLatency(alignedSize);
          setTimeout(() => {}, latency);
          
          return allocation.address;
        },
        
        deallocate: function(address) {
          const allocation = this.allocations.get(address);
          if (allocation) {
            this.usedMemory -= allocation.size;
            this.allocations.delete(address);
            this.gcPressure = this.usedMemory / this.totalMemory;
          }
        },
        
        collectGarbage: function() {
          const gcStartTime = performance.now();
          
          // Simulate GC algorithm based on memory type
          let collectedBytes = 0;
          const allocationArray = Array.from(this.allocations.values());
          
          if (hardwareConfig.memory.allocatorBehavior === 'generational') {
            // Generational GC - collect young objects first
            const youngObjects = allocationArray.filter(
              alloc => performance.now() - alloc.timestamp < 1000
            );
            youngObjects.forEach(alloc => {
              if (Math.random() < 0.7) { // 70% collection rate for young
                this.deallocate(alloc.address);
                collectedBytes += alloc.size;
              }
            });
          } else {
            // Mark and sweep - collect random objects
            allocationArray.forEach(alloc => {
              if (Math.random() < 0.3) { // 30% collection rate
                this.deallocate(alloc.address);
                collectedBytes += alloc.size;
              }
            });
          }
          
          const gcDuration = performance.now() - gcStartTime;
          
          // Simulate GC pause time
          const pauseTime = Math.max(1, collectedBytes / (1024 * 1024)); // 1ms per MB
          setTimeout(() => {}, pauseTime);
          
          return {
            collectedBytes,
            duration: gcDuration,
            pauseTime
          };
        },
        
        calculateLatency: function(size) {
          const baseLatency = hardwareConfig.memory.latency.cas / hardwareConfig.memory.frequency;
          const sizeMultiplier = Math.log2(size / this.pageSize + 1);
          return baseLatency * sizeMultiplier;
        },
        
        getMemoryInfo: function() {
          return {
            totalJSHeapSize: this.totalMemory * 0.3, // JS heap is ~30% of total
            usedJSHeapSize: this.usedMemory,
            jsHeapSizeLimit: this.totalMemory * 0.4,
            totalMemory: this.totalMemory,
            usedMemory: this.usedMemory,
            gcPressure: this.gcPressure
          };
        }
      };
      
      // Override memory-intensive operations
      const originalJSONStringify = JSON.stringify;
      JSON.stringify = function(value, replacer, space) {
        const estimatedSize = typeof value === 'object' ? 
          JSON.stringify(value).length * 2 : 
          String(value).length * 2;
        
        memoryManager.allocate(estimatedSize, 'json');
        return originalJSONStringify.call(this, value, replacer, space);
      };
      
      const originalJSONParse = JSON.parse;
      JSON.parse = function(text, reviver) {
        memoryManager.allocate(text.length * 4, 'json-parse');
        return originalJSONParse.call(this, text, reviver);
      };
      
      // Memory Info API Enhancement
      if (performance.memory) {
        const originalMemoryDescriptor = Object.getOwnPropertyDescriptors(performance.memory);
        Object.defineProperties(performance, {
          memory: {
            get: function() {
              return memoryManager.getMemoryInfo();
            },
            configurable: true
          }
        });
      }
    `;
    }
    getSensorScript() {
        return `
      // Device Motion and Orientation Sensors
      const sensorSimulator = {
        accelerometer: {
          x: 0, y: 0, z: 9.81, // Initial gravity
          noise: hardwareConfig.sensors.accelerometer.noiseLevel,
          
          update: function() {
            // Simulate realistic accelerometer data
            this.x += (Math.random() - 0.5) * this.noise;
            this.y += (Math.random() - 0.5) * this.noise;
            this.z = 9.81 + (Math.random() - 0.5) * this.noise;
            
            // Clamp values to sensor range
            const range = hardwareConfig.sensors.accelerometer.range * 9.81;
            this.x = Math.max(-range, Math.min(range, this.x));
            this.y = Math.max(-range, Math.min(range, this.y));
            this.z = Math.max(-range, Math.min(range, this.z));
          }
        },
        
        gyroscope: {
          alpha: 0, beta: 0, gamma: 0,
          drift: hardwareConfig.sensors.gyroscope.drift,
          
          update: function() {
            // Simulate gyroscope drift and noise
            this.alpha += (Math.random() - 0.5) * this.drift;
            this.beta += (Math.random() - 0.5) * this.drift;
            this.gamma += (Math.random() - 0.5) * this.drift;
            
            // Normalize angles
            this.alpha = ((this.alpha % 360) + 360) % 360;
            this.beta = Math.max(-180, Math.min(180, this.beta));
            this.gamma = Math.max(-90, Math.min(90, this.gamma));
          }
        },
        
        ambientLight: {
          value: 200, // lux
          
          update: function() {
            const config = hardwareConfig.sensors.ambientLight;
            if (config.enabled) {
              // Simulate ambient light changes
              const change = (Math.random() - 0.5) * config.sensitivity;
              this.value = Math.max(config.range[0], Math.min(config.range[1], this.value + change));
            }
          }
        }
      };
      
      // Override DeviceMotionEvent
      if (typeof DeviceMotionEvent !== 'undefined') {
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
          if (type === 'devicemotion' && hardwareConfig.sensors.accelerometer.enabled) {
            const wrappedListener = function(event) {
              sensorSimulator.accelerometer.update();
              
              const simulatedEvent = {
                ...event,
                acceleration: {
                  x: sensorSimulator.accelerometer.x,
                  y: sensorSimulator.accelerometer.y,
                  z: sensorSimulator.accelerometer.z
                },
                accelerationIncludingGravity: {
                  x: sensorSimulator.accelerometer.x,
                  y: sensorSimulator.accelerometer.y,
                  z: sensorSimulator.accelerometer.z
                },
                rotationRate: {
                  alpha: (Math.random() - 0.5) * 10,
                  beta: (Math.random() - 0.5) * 10,
                  gamma: (Math.random() - 0.5) * 10
                },
                interval: 16.67 // ~60Hz
              };
              
              listener.call(this, simulatedEvent);
            };
            
            return originalAddEventListener.call(this, type, wrappedListener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
      
      // Override DeviceOrientationEvent
      if (typeof DeviceOrientationEvent !== 'undefined') {
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
          if (type === 'deviceorientation' && hardwareConfig.sensors.gyroscope.enabled) {
            const wrappedListener = function(event) {
              sensorSimulator.gyroscope.update();
              
              const simulatedEvent = {
                ...event,
                alpha: sensorSimulator.gyroscope.alpha,
                beta: sensorSimulator.gyroscope.beta,
                gamma: sensorSimulator.gyroscope.gamma,
                absolute: true
              };
              
              listener.call(this, simulatedEvent);
            };
            
            return originalAddEventListener.call(this, type, wrappedListener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
      
      // Ambient Light Sensor API
      if (typeof AmbientLightSensor !== 'undefined') {
        const originalAmbientLightSensor = AmbientLightSensor;
        AmbientLightSensor = function(options) {
          const sensor = new originalAmbientLightSensor(options);
          
          // Override illuminance property
          Object.defineProperty(sensor, 'illuminance', {
            get: function() {
              sensorSimulator.ambientLight.update();
              return sensorSimulator.ambientLight.value;
            },
            configurable: true
          });
          
          return sensor;
        };
      }
      
      // Update sensor values periodically
      setInterval(() => {
        sensorSimulator.accelerometer.update();
        sensorSimulator.gyroscope.update();
        sensorSimulator.ambientLight.update();
      }, 16); // ~60Hz updates
    `;
    }
    getPowerScript() {
        return `
      // Battery Status API Enhancement
      const batterySimulator = {
        level: hardwareConfig.power.currentLevel,
        charging: false,
        chargingTime: Infinity,
        dischargingTime: 3600, // 1 hour
        temperature: 25, // Celsius
        cycleCount: 0,
        health: 100, // Percentage
        
        update: function() {
          const powerConfig = hardwareConfig.power;
          
          if (this.charging) {
            // Simulate charging
            const chargeRate = powerConfig.chargingSpeed / powerConfig.batteryCapacity / 3600; // per second
            this.level = Math.min(1, this.level + chargeRate);
            this.chargingTime = this.level >= 1 ? 0 : (1 - this.level) / chargeRate;
            this.dischargingTime = Infinity;
            this.temperature = Math.min(40, this.temperature + 0.01);
          } else {
            // Simulate discharging
            const dischargeRate = powerConfig.dischargingRate / powerConfig.batteryCapacity / 3600;
            const thermalFactor = 1 + (this.temperature - 25) * powerConfig.temperatureImpact;
            const agingFactor = 1 + (100 - this.health) * powerConfig.agingFactor;
            
            this.level = Math.max(0, this.level - dischargeRate * thermalFactor * agingFactor);
            this.dischargingTime = this.level <= 0 ? 0 : this.level / (dischargeRate * thermalFactor * agingFactor);
            this.chargingTime = Infinity;
            this.temperature = Math.max(15, this.temperature - 0.005);
          }
          
          // Simulate battery aging
          if (Math.random() < 0.0001) { // Very slow aging
            this.health = Math.max(70, this.health - 0.1);
            this.cycleCount++;
          }
        },
        
        toggleCharging: function() {
          this.charging = !this.charging;
        }
      };
      
      // Override getBattery API
      if (navigator.getBattery) {
        const originalGetBattery = navigator.getBattery;
        navigator.getBattery = function() {
          return new Promise(resolve => {
            const battery = {
              level: batterySimulator.level,
              charging: batterySimulator.charging,
              chargingTime: batterySimulator.chargingTime,
              dischargingTime: batterySimulator.dischargingTime,
              
              // Additional properties for detailed simulation
              temperature: batterySimulator.temperature,
              health: batterySimulator.health,
              cycleCount: batterySimulator.cycleCount,
              
              addEventListener: function(event, handler) {
                // Simulate battery events
                if (event === 'levelchange') {
                  setInterval(() => {
                    batterySimulator.update();
                    if (Math.abs(this.level - batterySimulator.level) > 0.01) {
                      this.level = batterySimulator.level;
                      handler({ target: this, type: event });
                    }
                  }, 1000);
                }
                
                if (event === 'chargingchange') {
                  setInterval(() => {
                    if (this.charging !== batterySimulator.charging) {
                      this.charging = batterySimulator.charging;
                      this.chargingTime = batterySimulator.chargingTime;
                      this.dischargingTime = batterySimulator.dischargingTime;
                      handler({ target: this, type: event });
                    }
                  }, 2000);
                }
              },
              
              removeEventListener: function() {
                // Mock implementation
              }
            };
            
            resolve(battery);
          });
        };
      }
      
      // Power consumption simulation
      const powerMonitor = {
        cpuConsumption: 0,
        gpuConsumption: 0,
        displayConsumption: 5, // Base display power in watts
        
        updateConsumption: function() {
          // Simulate power consumption based on usage
          const cpuUsage = performance.now() % 100; // Mock CPU usage
          this.cpuConsumption = (cpuUsage / 100) * hardwareConfig.cpu.thermalDesignPower;
          
          // GPU power consumption (estimated)
          this.gpuConsumption = Math.random() * 50; // Variable GPU load
          
          const totalConsumption = this.cpuConsumption + this.gpuConsumption + this.displayConsumption;
          
          // Update battery discharge rate based on consumption
          if (!batterySimulator.charging) {
            const consumptionFactor = totalConsumption / 20; // Normalize to reasonable range
            batterySimulator.level = Math.max(0, 
              batterySimulator.level - (consumptionFactor / 3600000)); // per millisecond
          }
        }
      };
      
      // Update power simulation
      setInterval(() => {
        batterySimulator.update();
        powerMonitor.updateConsumption();
      }, 1000);
      
      // Simulate charging state changes
      setInterval(() => {
        if (Math.random() < 0.01) { // 1% chance to change charging state
          batterySimulator.toggleCharging();
        }
      }, 10000);
    `;
    }
    getThermalScript() {
        return `
      // Thermal Management System
      const thermalManager = {
        cpuTemperature: hardwareConfig.thermal.cpuTemperature,
        gpuTemperature: hardwareConfig.thermal.gpuTemperature,
        ambientTemperature: hardwareConfig.thermal.ambientTemperature,
        fanSpeeds: new Map(),
        throttling: false,
        
        updateTemperatures: function() {
          const thermalConfig = hardwareConfig.thermal;
          
          // CPU temperature simulation
          const cpuLoad = (performance.now() % 1000) / 10; // Mock CPU load 0-100%
          const cpuHeatGeneration = cpuLoad * 0.5; // Heat per % load
          
          this.cpuTemperature += (
            cpuHeatGeneration + 
            this.ambientTemperature * 0.1 - 
            this.cpuTemperature * thermalConfig.heatDissipation
          ) * 0.01;
          
          // GPU temperature simulation  
          const gpuLoad = Math.random() * 100; // Variable GPU load
          const gpuHeatGeneration = gpuLoad * 0.3;
          
          this.gpuTemperature += (
            gpuHeatGeneration +
            this.ambientTemperature * 0.1 -
            this.gpuTemperature * thermalConfig.heatDissipation
          ) * 0.01;
          
          // Fan speed calculation
          this.updateFanSpeeds();
          
          // Throttling decision
          this.checkThrottling();
        },
        
        updateFanSpeeds: function() {
          const fanCurve = hardwareConfig.thermal.fanCurve;
          const maxTemp = Math.max(this.cpuTemperature, this.gpuTemperature);
          
          let fanSpeed = 0;
          for (let i = 0; i < fanCurve.length - 1; i++) {
            const current = fanCurve[i];
            const next = fanCurve[i + 1];
            
            if (maxTemp >= current.temp && maxTemp < next.temp) {
              // Linear interpolation between curve points
              const tempRange = next.temp - current.temp;
              const speedRange = next.speed - current.speed;
              const tempOffset = maxTemp - current.temp;
              
              fanSpeed = current.speed + (speedRange * tempOffset / tempRange);
              break;
            }
          }
          
          this.fanSpeeds.set('cpu', fanSpeed);
          this.fanSpeeds.set('case', fanSpeed * 0.8);
        },
        
        checkThrottling: function() {
          const threshold = hardwareConfig.thermal.throttlingThreshold;
          
          if (this.cpuTemperature > threshold || this.gpuTemperature > threshold) {
            if (!this.throttling) {
              this.throttling = true;
              // Trigger performance reduction
              this.applyThermalThrottling();
            }
          } else if (this.throttling && 
                    this.cpuTemperature < threshold - 5 && 
                    this.gpuTemperature < threshold - 5) {
            this.throttling = false;
            this.removeThermalThrottling();
          }
        },
        
        applyThermalThrottling: function() {
          // Simulate performance reduction due to thermal throttling
          const originalSetTimeout = window.setTimeout;
          window.setTimeout = function(callback, delay, ...args) {
            // Increase delay by 20% during throttling
            return originalSetTimeout(callback, delay * 1.2, ...args);
          };
          
          // Reduce animation frame rate
          const originalRequestAnimationFrame = window.requestAnimationFrame;
          let throttleCounter = 0;
          window.requestAnimationFrame = function(callback) {
            throttleCounter++;
            if (throttleCounter % 2 === 0) {
              // Skip every other frame during throttling
              return originalRequestAnimationFrame(callback);
            } else {
              return originalRequestAnimationFrame(() => {});
            }
          };
        },
        
        removeThermalThrottling: function() {
          // Restore normal performance (simplified - would need to store originals)
          location.reload(); // Simplified restoration
        },
        
        getTemperatureData: function() {
          return {
            cpu: Math.round(this.cpuTemperature),
            gpu: Math.round(this.gpuTemperature),
            ambient: Math.round(this.ambientTemperature),
            fanSpeeds: Object.fromEntries(this.fanSpeeds),
            throttling: this.throttling
          };
        }
      };
      
      // Expose thermal data for debugging/testing
      window.thermalStatus = function() {
        return thermalManager.getTemperatureData();
      };
      
      // Update thermal simulation
      setInterval(() => {
        thermalManager.updateTemperatures();
      }, 2000);
      
      // Simulate ambient temperature changes
      setInterval(() => {
        const change = (Math.random() - 0.5) * 2; // ±1°C change
        thermalManager.ambientTemperature = Math.max(15, 
          Math.min(35, thermalManager.ambientTemperature + change));
      }, 30000); // Every 30 seconds
    `;
    }
    getNetworkScript() {
        return `
      // Network Hardware Simulation
      const networkHardware = {
        wifiSignalStrength: hardwareConfig.network.signalStrength,
        interferenceLevel: hardwareConfig.network.interferenceLevel,
        connectionQuality: 100,
        
        updateSignalStrength: function() {
          // Simulate signal strength variations
          const interference = this.interferenceLevel * (Math.random() - 0.5);
          this.wifiSignalStrength = Math.max(0, Math.min(100, 
            this.wifiSignalStrength + interference));
          
          // Update connection quality based on signal strength
          this.connectionQuality = Math.max(0, this.wifiSignalStrength - interference * 2);
        },
        
        getNetworkInfo: function() {
          return {
            signalStrength: this.wifiSignalStrength,
            quality: this.connectionQuality,
            interference: this.interferenceLevel,
            chipset: hardwareConfig.network.wifiChipset,
            bluetooth: hardwareConfig.network.bluetoothVersion
          };
        }
      };
      
      // Override Connection API
      if (navigator.connection || navigator.mozConnection || navigator.webkitConnection) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        // Override connection properties based on signal strength
        Object.defineProperties(connection, {
          effectiveType: {
            get: function() {
              const quality = networkHardware.connectionQuality;
              if (quality > 90) return '4g';
              if (quality > 70) return '3g';
              if (quality > 50) return 'slow-2g';
              return '2g';
            }
          },
          rtt: {
            get: function() {
              const baseRTT = 50;
              const qualityFactor = (100 - networkHardware.connectionQuality) / 100;
              return baseRTT + (qualityFactor * 200); // 50-250ms range
            }
          },
          downlink: {
            get: function() {
              const maxDownlink = 10; // 10 Mbps
              const qualityFactor = networkHardware.connectionQuality / 100;
              return maxDownlink * qualityFactor;
            }
          }
        });
      }
      
      // Update network status
      setInterval(() => {
        networkHardware.updateSignalStrength();
      }, 5000);
    `;
    }
    getAudioScript() {
        return `
      // Audio Hardware Simulation
      const audioHardware = {
        codec: hardwareConfig.audio.codec,
        sampleRate: 48000,
        bitDepth: 16,
        channels: 2,
        latency: hardwareConfig.audio.latency,
        
        processAudio: function(bufferSize) {
          // Simulate audio processing latency
          const processingTime = (bufferSize / this.sampleRate) * 1000 + this.latency;
          return processingTime;
        },
        
        getAudioCapabilities: function() {
          return {
            codec: this.codec,
            supportedSampleRates: hardwareConfig.audio.sampleRates,
            supportedBitDepths: hardwareConfig.audio.bitDepths,
            maxChannels: hardwareConfig.audio.channels,
            latency: this.latency,
            snr: hardwareConfig.audio.dac.snr,
            thd: hardwareConfig.audio.dac.thd
          };
        }
      };
      
      // Override AudioContext
      if (typeof AudioContext !== 'undefined') {
        const originalAudioContext = AudioContext;
        AudioContext = function(...args) {
          const context = new originalAudioContext(...args);
          
          // Override sample rate
          Object.defineProperty(context, 'sampleRate', {
            get: function() {
              return audioHardware.sampleRate;
            }
          });
          
          // Override createBuffer to simulate hardware limitations
          const originalCreateBuffer = context.createBuffer;
          context.createBuffer = function(numberOfChannels, length, sampleRate) {
            // Clamp to hardware capabilities
            const clampedChannels = Math.min(numberOfChannels, hardwareConfig.audio.channels);
            const clampedSampleRate = hardwareConfig.audio.sampleRates.includes(sampleRate) ? 
              sampleRate : audioHardware.sampleRate;
            
            const processingDelay = audioHardware.processAudio(length);
            if (processingDelay > 1) {
              setTimeout(() => {}, processingDelay);
            }
            
            return originalCreateBuffer.call(this, clampedChannels, length, clampedSampleRate);
          };
          
          return context;
        };
      }
      
      // Audio device enumeration
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
        navigator.mediaDevices.enumerateDevices = function() {
          return originalEnumerateDevices.call(this).then(devices => {
            // Add hardware-specific audio devices
            const audioDevices = [
              {
                deviceId: 'default',
                kind: 'audioinput',
                label: \`\${hardwareConfig.audio.codec} Microphone\`,
                groupId: 'audio-group-1'
              },
              {
                deviceId: 'speaker',
                kind: 'audiooutput', 
                label: \`\${hardwareConfig.audio.codec} Speakers\`,
                groupId: 'audio-group-1'
              }
            ];
            
            return [...devices, ...audioDevices];
          });
        };
      }
    `;
    }
    getPerformanceScript() {
        return `
      // Enhanced Performance API
      const performanceEnhancement = {
        baseTime: performance.now(),
        cpuFrequency: hardwareConfig.cpu.baseFrequency * 1000000000, // Convert to Hz
        
        adjustTiming: function(originalTime) {
          // Adjust timing based on current CPU frequency and load
          const currentFreq = thermalManager ? thermalManager.currentFrequency || hardwareConfig.cpu.baseFrequency : hardwareConfig.cpu.baseFrequency;
          const frequencyRatio = this.cpuFrequency / (currentFreq * 1000000000);
          
          return originalTime * frequencyRatio;
        }
      };
      
      // Override performance.now() for hardware-accurate timing
      const originalPerformanceNow = performance.now;
      performance.now = function() {
        const originalTime = originalPerformanceNow.call(this);
        return performanceEnhancement.adjustTiming(originalTime);
      };
      
      // Add hardware performance counters
      if (performance.getEntriesByType) {
        const originalGetEntriesByType = performance.getEntriesByType;
        performance.getEntriesByType = function(type) {
          const entries = originalGetEntriesByType.call(this, type);
          
          if (type === 'measure' || type === 'mark') {
            // Add hardware-specific timing adjustments
            return entries.map(entry => ({
              ...entry,
              duration: entry.duration ? performanceEnhancement.adjustTiming(entry.duration) : entry.duration,
              startTime: performanceEnhancement.adjustTiming(entry.startTime)
            }));
          }
          
          return entries;
        };
      }
    `;
    }
    getLifecycleScript() {
        return `
      // Hardware Lifecycle Simulation
      const hardwareLifecycle = {
        uptimeSeconds: 0,
        totalOperationHours: Math.random() * 8760, // 0-1 year of operation
        degradationFactor: 1.0,
        
        update: function() {
          this.uptimeSeconds++;
          this.totalOperationHours += 1/3600; // Convert seconds to hours
          
          // Simulate hardware degradation over time
          const ageInYears = this.totalOperationHours / 8760;
          this.degradationFactor = Math.max(0.8, 1 - (ageInYears * 0.05)); // 5% degradation per year
          
          // Apply degradation to various systems
          if (typeof thermalManager !== 'undefined') {
            // Thermal paste degradation increases temperatures
            thermalManager.cpuTemperature += ageInYears * 2;
            thermalManager.gpuTemperature += ageInYears * 1.5;
          }
          
          if (typeof batterySimulator !== 'undefined') {
            // Battery capacity degrades over time
            batterySimulator.health = Math.max(70, 100 - (ageInYears * 8));
          }
        },
        
        getLifecycleInfo: function() {
          return {
            uptime: this.uptimeSeconds,
            totalHours: Math.round(this.totalOperationHours),
            degradation: Math.round((1 - this.degradationFactor) * 100),
            estimatedAge: Math.round(this.totalOperationHours / 8760 * 12) // months
          };
        }
      };
      
      // Update lifecycle simulation
      setInterval(() => {
        hardwareLifecycle.update();
      }, 1000);
      
      // Expose hardware info for debugging
      window.getHardwareInfo = function() {
        return {
          cpu: {
            model: hardwareConfig.cpu.model,
            cores: hardwareConfig.cpu.cores,
            threads: hardwareConfig.cpu.threads,
            frequency: hardwareConfig.cpu.baseFrequency
          },
          gpu: {
            model: hardwareConfig.gpu.model,
            memory: hardwareConfig.gpu.memory,
            vendor: hardwareConfig.gpu.vendor
          },
          memory: {
            total: hardwareConfig.memory.total,
            type: hardwareConfig.memory.type
          },
          lifecycle: hardwareLifecycle.getLifecycleInfo(),
          thermal: typeof thermalManager !== 'undefined' ? thermalManager.getTemperatureData() : null,
          network: networkHardware.getNetworkInfo(),
          audio: audioHardware.getAudioCapabilities()
        };
      };
    `;
    }
}
exports.HardwareEmulator = HardwareEmulator;
// Hardware abstraction layer classes
class ThermalModel {
    constructor(config) {
        this.config = config;
    }
}
class PowerModel {
    constructor(config) {
        this.config = config;
    }
}
class SensorSimulator {
    constructor(config) {
        this.config = config;
    }
}
class MemoryManager {
    constructor(config) {
        this.config = config;
    }
}
// Predefined hardware configurations for popular devices
exports.hardwareConfigs = {
    'macbook-pro-m2': {
        cpu: {
            architecture: 'arm64',
            vendor: 'Apple',
            model: 'M2',
            cores: 8,
            threads: 8,
            baseFrequency: 3.2,
            maxFrequency: 3.5,
            cache: { l1: 128, l2: 4096, l3: 16384 },
            features: ['AES', 'NEON', 'SHA'],
            instructionTiming: new Map([
                ['add', 1], ['mul', 3], ['div', 12], ['branch', 1]
            ]),
            thermalDesignPower: 20
        },
        gpu: {
            vendor: 'Apple',
            model: 'M2 GPU',
            architecture: 'Apple Silicon',
            memory: 8192,
            computeUnits: 10,
            baseClockSpeed: 1400,
            memoryClockSpeed: 6400,
            shaderCores: 1280,
            apiSupport: {
                opengl: '4.1',
                metal: '3.0',
                webgl: '2.0',
                webgpu: true
            },
            extensions: ['WEBGL_compressed_texture_s3tc', 'OES_texture_float'],
            renderingCapabilities: {
                maxTextureSize: 16384,
                maxViewportDims: [16384, 16384],
                maxVertexAttributes: 16,
                maxFragmentUniformVectors: 1024,
                maxVaryingVectors: 31
            }
        },
        memory: {
            total: 16,
            available: 12,
            type: 'LPDDR5',
            frequency: 6400,
            channels: 2,
            bandwidth: 100,
            latency: { cas: 42, ras: 39, rp: 39, rcd: 39 },
            allocatorBehavior: 'buddy',
            pagingStrategy: 'lru'
        },
        sensors: {
            accelerometer: { enabled: true, sensitivity: 0.01, noiseLevel: 0.001, sampleRate: 100, range: 8 },
            gyroscope: { enabled: true, sensitivity: 0.1, drift: 0.05, sampleRate: 100, range: 2000 },
            magnetometer: { enabled: true, calibration: [0, 0, 0], interference: 0.1, sampleRate: 50 },
            ambientLight: { enabled: true, sensitivity: 10, range: [0, 10000], responseTime: 0.5 },
            proximity: { enabled: false, range: 5, accuracy: 0.5 }
        },
        power: {
            batteryCapacity: 58560,
            currentLevel: 0.85,
            chargingSpeed: 96,
            dischargingRate: 5000,
            temperatureImpact: 0.02,
            agingFactor: 0.001,
            powerProfile: 'balanced'
        },
        thermal: {
            ambientTemperature: 22,
            cpuTemperature: 35,
            gpuTemperature: 40,
            throttlingThreshold: 90,
            fanCurve: [
                { temp: 35, speed: 0 },
                { temp: 60, speed: 30 },
                { temp: 80, speed: 70 },
                { temp: 95, speed: 100 }
            ],
            thermalConductivity: 1.2,
            heatDissipation: 0.8
        },
        network: {
            wifiChipset: 'Broadcom BCM4387',
            bluetoothVersion: '5.3',
            ethernetController: 'USB-C to Ethernet',
            antennaGain: 2.5,
            signalStrength: 85,
            interferenceLevel: 5
        },
        audio: {
            codec: 'Apple Audio',
            sampleRates: [44100, 48000, 96000, 192000],
            bitDepths: [16, 24, 32],
            channels: 2,
            dac: { snr: 115, thd: 0.0009 },
            adc: { snr: 110, gain: 60 },
            latency: 5
        }
    },
    'gaming-pc-rtx4080': {
        cpu: {
            architecture: 'x86_64',
            vendor: 'Intel',
            model: 'Core i7-13700K',
            cores: 16,
            threads: 24,
            baseFrequency: 3.4,
            maxFrequency: 5.4,
            cache: { l1: 80, l2: 2048, l3: 30720 },
            features: ['SSE4.2', 'AVX2', 'AVX512', 'AES-NI', 'SHA'],
            instructionTiming: new Map([
                ['add', 1], ['mul', 4], ['div', 15], ['branch', 1]
            ]),
            thermalDesignPower: 125
        },
        gpu: {
            vendor: 'NVIDIA',
            model: 'GeForce RTX 4080',
            architecture: 'Ada Lovelace',
            memory: 16384,
            computeUnits: 76,
            baseClockSpeed: 2205,
            memoryClockSpeed: 22400,
            shaderCores: 9728,
            rtCores: 76,
            tensorCores: 304,
            apiSupport: {
                opengl: '4.6',
                vulkan: '1.3',
                directx: '12_2',
                webgl: '2.0',
                webgpu: true
            },
            extensions: [
                'WEBGL_compressed_texture_s3tc',
                'WEBGL_compressed_texture_astc',
                'EXT_texture_filter_anisotropic',
                'WEBGL_debug_renderer_info'
            ],
            renderingCapabilities: {
                maxTextureSize: 32768,
                maxViewportDims: [32768, 32768],
                maxVertexAttributes: 32,
                maxFragmentUniformVectors: 4096,
                maxVaryingVectors: 124
            }
        },
        memory: {
            total: 32,
            available: 28,
            type: 'DDR5',
            frequency: 5600,
            channels: 2,
            bandwidth: 89.6,
            latency: { cas: 40, ras: 39, rp: 39, rcd: 39 },
            allocatorBehavior: 'buddy',
            pagingStrategy: 'lru'
        },
        sensors: {
            accelerometer: { enabled: false, sensitivity: 0, noiseLevel: 0, sampleRate: 0, range: 0 },
            gyroscope: { enabled: false, sensitivity: 0, drift: 0, sampleRate: 0, range: 0 },
            magnetometer: { enabled: false, calibration: [0, 0, 0], interference: 0, sampleRate: 0 },
            ambientLight: { enabled: false, sensitivity: 0, range: [0, 0], responseTime: 0 },
            proximity: { enabled: false, range: 0, accuracy: 0 }
        },
        power: {
            batteryCapacity: 0, // Desktop PC
            currentLevel: 1,
            chargingSpeed: 0,
            dischargingRate: 0,
            temperatureImpact: 0,
            agingFactor: 0,
            powerProfile: 'performance'
        },
        thermal: {
            ambientTemperature: 24,
            cpuTemperature: 45,
            gpuTemperature: 50,
            throttlingThreshold: 100,
            fanCurve: [
                { temp: 30, speed: 20 },
                { temp: 60, speed: 50 },
                { temp: 80, speed: 80 },
                { temp: 95, speed: 100 }
            ],
            thermalConductivity: 2.0,
            heatDissipation: 1.5
        },
        network: {
            wifiChipset: 'Intel AX211',
            bluetoothVersion: '5.3',
            ethernetController: 'Intel I225-V',
            antennaGain: 5.0,
            signalStrength: 95,
            interferenceLevel: 2
        },
        audio: {
            codec: 'Realtek ALC1220',
            sampleRates: [44100, 48000, 96000, 192000, 384000],
            bitDepths: [16, 24, 32],
            channels: 8,
            dac: { snr: 123, thd: 0.00006 },
            adc: { snr: 120, gain: 65 },
            latency: 2
        }
    }
};
//# sourceMappingURL=hardware-engine.js.map