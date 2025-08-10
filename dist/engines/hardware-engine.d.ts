/**
 * Hardware-Level Emulation System
 * Complete CPU, GPU, Memory, and Sensor emulation for deep fingerprinting protection
 */
export interface HardwareConfig {
    cpu: CPUConfig;
    gpu: GPUConfig;
    memory: MemoryConfig;
    sensors: SensorConfig;
    power: PowerConfig;
    thermal: ThermalConfig;
    network: NetworkHardwareConfig;
    audio: AudioHardwareConfig;
}
export interface CPUConfig {
    architecture: 'x86_64' | 'arm64' | 'x86';
    vendor: 'Intel' | 'AMD' | 'Apple' | 'Qualcomm';
    model: string;
    cores: number;
    threads: number;
    baseFrequency: number;
    maxFrequency: number;
    cache: {
        l1: number;
        l2: number;
        l3: number;
    };
    features: string[];
    instructionTiming: Map<string, number>;
    thermalDesignPower: number;
}
export interface GPUConfig {
    vendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'ARM';
    model: string;
    architecture: string;
    memory: number;
    computeUnits: number;
    baseClockSpeed: number;
    memoryClockSpeed: number;
    shaderCores: number;
    rtCores?: number;
    tensorCores?: number;
    apiSupport: {
        opengl: string;
        vulkan?: string;
        directx?: string;
        metal?: string;
        webgl: string;
        webgpu?: boolean;
    };
    extensions: string[];
    renderingCapabilities: {
        maxTextureSize: number;
        maxViewportDims: [number, number];
        maxVertexAttributes: number;
        maxFragmentUniformVectors: number;
        maxVaryingVectors: number;
    };
}
export interface MemoryConfig {
    total: number;
    available: number;
    type: 'DDR3' | 'DDR4' | 'DDR5' | 'LPDDR4' | 'LPDDR5';
    frequency: number;
    channels: number;
    bandwidth: number;
    latency: {
        cas: number;
        ras: number;
        rp: number;
        rcd: number;
    };
    allocatorBehavior: 'linear' | 'buddy' | 'slab';
    pagingStrategy: 'lru' | 'fifo' | 'clock';
}
export interface SensorConfig {
    accelerometer: {
        enabled: boolean;
        sensitivity: number;
        noiseLevel: number;
        sampleRate: number;
        range: number;
    };
    gyroscope: {
        enabled: boolean;
        sensitivity: number;
        drift: number;
        sampleRate: number;
        range: number;
    };
    magnetometer: {
        enabled: boolean;
        calibration: [number, number, number];
        interference: number;
        sampleRate: number;
    };
    ambientLight: {
        enabled: boolean;
        sensitivity: number;
        range: [number, number];
        responseTime: number;
    };
    proximity: {
        enabled: boolean;
        range: number;
        accuracy: number;
    };
}
export interface PowerConfig {
    batteryCapacity: number;
    currentLevel: number;
    chargingSpeed: number;
    dischargingRate: number;
    temperatureImpact: number;
    agingFactor: number;
    powerProfile: 'performance' | 'balanced' | 'power_saver';
}
export interface ThermalConfig {
    ambientTemperature: number;
    cpuTemperature: number;
    gpuTemperature: number;
    throttlingThreshold: number;
    fanCurve: Array<{
        temp: number;
        speed: number;
    }>;
    thermalConductivity: number;
    heatDissipation: number;
}
export interface NetworkHardwareConfig {
    wifiChipset: string;
    bluetoothVersion: string;
    ethernetController: string;
    antennaGain: number;
    signalStrength: number;
    interferenceLevel: number;
}
export interface AudioHardwareConfig {
    codec: string;
    sampleRates: number[];
    bitDepths: number[];
    channels: number;
    dac: {
        snr: number;
        thd: number;
    };
    adc: {
        snr: number;
        gain: number;
    };
    latency: number;
}
export declare class HardwareEmulator {
    private config;
    private performanceCounters;
    private thermalModel;
    private powerModel;
    private sensorSimulator;
    private memoryManager;
    constructor(config: HardwareConfig);
    private initializePerformanceCounters;
    getInjectionScript(): string;
    private getCPUScript;
    private getGPUScript;
    private getMemoryScript;
    private getSensorScript;
    private getPowerScript;
    private getThermalScript;
    private getNetworkScript;
    private getAudioScript;
    private getPerformanceScript;
    private getLifecycleScript;
}
export declare const hardwareConfigs: Record<string, HardwareConfig>;
//# sourceMappingURL=hardware-engine.d.ts.map