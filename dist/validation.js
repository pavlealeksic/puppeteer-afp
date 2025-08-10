"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectionOptionsSchema = void 0;
exports.validateOptions = validateOptions;
const joi_1 = __importDefault(require("joi"));
const canvasRgbaSchema = joi_1.default.array().items(joi_1.default.number().min(-5).max(5)).length(4);
const webglDataSchema = joi_1.default.object().pattern(joi_1.default.number(), joi_1.default.alternatives().try(joi_1.default.number(), joi_1.default.string(), joi_1.default.object().pattern(joi_1.default.number(), joi_1.default.number()), joi_1.default.array().items(joi_1.default.number())));
const fontFingerprintSchema = joi_1.default.object({
    noise: joi_1.default.number().min(-2).max(2),
    sign: joi_1.default.number().valid(-1, 1)
});
const audioFingerprintSchema = joi_1.default.object({
    getChannelDataIndexRandom: joi_1.default.number().min(0).max(1),
    getChannelDataResultRandom: joi_1.default.number().min(0).max(1),
    createAnalyserIndexRandom: joi_1.default.number().min(0).max(1),
    createAnalyserResultRandom: joi_1.default.number().min(0).max(1)
});
const timezoneConfigSchema = joi_1.default.object({
    timezone: joi_1.default.string(),
    locale: joi_1.default.string()
});
const screenConfigSchema = joi_1.default.object({
    width: joi_1.default.number().positive(),
    height: joi_1.default.number().positive(),
    availWidth: joi_1.default.number().positive(),
    availHeight: joi_1.default.number().positive(),
    colorDepth: joi_1.default.number().valid(8, 16, 24, 30, 32),
    pixelDepth: joi_1.default.number().valid(8, 16, 24, 30, 32)
});
const batteryConfigSchema = joi_1.default.object({
    charging: joi_1.default.boolean(),
    chargingTime: joi_1.default.number().min(0),
    dischargingTime: joi_1.default.number().min(0),
    level: joi_1.default.number().min(0).max(1)
});
const hardwareConfigSchema = joi_1.default.object({
    hardwareConcurrency: joi_1.default.number().min(1).max(128),
    deviceMemory: joi_1.default.number().valid(0.25, 0.5, 1, 2, 4, 8, 16, 32, 64)
});
const languageConfigSchema = joi_1.default.object({
    languages: joi_1.default.array().items(joi_1.default.string()),
    language: joi_1.default.string(),
    platform: joi_1.default.string()
});
const pluginConfigSchema = joi_1.default.object({
    plugins: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required(),
        filename: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        version: joi_1.default.string()
    })),
    mimeTypes: joi_1.default.array().items(joi_1.default.object({
        type: joi_1.default.string().required(),
        suffixes: joi_1.default.string().required(),
        description: joi_1.default.string().required()
    }))
});
const connectionConfigSchema = joi_1.default.object({
    effectiveType: joi_1.default.string().valid('slow-2g', '2g', '3g', '4g'),
    rtt: joi_1.default.number().min(0),
    downlink: joi_1.default.number().min(0),
    saveData: joi_1.default.boolean()
});
const userAgentConfigSchema = joi_1.default.object({
    userAgent: joi_1.default.string(),
    platform: joi_1.default.string(),
    vendor: joi_1.default.string().allow(''),
    appVersion: joi_1.default.string()
});
const engineEmulationConfigSchema = joi_1.default.object({
    javascript: joi_1.default.boolean(),
    css: joi_1.default.boolean(),
    dom: joi_1.default.boolean(),
    hardware: joi_1.default.boolean(),
    network: joi_1.default.boolean()
});
const featuresSchema = joi_1.default.object({
    canvas: joi_1.default.boolean(),
    webgl: joi_1.default.boolean(),
    audio: joi_1.default.boolean(),
    font: joi_1.default.boolean(),
    webrtc: joi_1.default.boolean(),
    timezone: joi_1.default.boolean(),
    screen: joi_1.default.boolean(),
    battery: joi_1.default.boolean(),
    hardware: joi_1.default.boolean(),
    language: joi_1.default.boolean(),
    plugins: joi_1.default.boolean(),
    connection: joi_1.default.boolean(),
    userAgent: joi_1.default.boolean(),
    tcp: joi_1.default.boolean(),
    dns: joi_1.default.boolean()
});
exports.protectionOptionsSchema = joi_1.default.object({
    canvasRgba: canvasRgbaSchema,
    webglData: webglDataSchema,
    fontFingerprint: fontFingerprintSchema,
    audioFingerprint: audioFingerprintSchema,
    webRTCProtect: joi_1.default.boolean(),
    deviceMemory: joi_1.default.number().valid(0.25, 0.5, 1, 2, 4, 8, 16, 32, 64),
    timezoneConfig: timezoneConfigSchema,
    screenConfig: screenConfigSchema,
    batteryConfig: batteryConfigSchema,
    hardwareConfig: hardwareConfigSchema,
    languageConfig: languageConfigSchema,
    pluginConfig: pluginConfigSchema,
    connectionConfig: connectionConfigSchema,
    userAgentConfig: userAgentConfigSchema,
    enableLogging: joi_1.default.boolean(),
    logLevel: joi_1.default.string().valid('debug', 'info', 'warn', 'error'),
    features: featuresSchema,
    rotationInterval: joi_1.default.number().min(0),
    profile: joi_1.default.string().valid('chrome', 'firefox', 'safari', 'edge', 'custom'),
    engineEmulation: engineEmulationConfigSchema
});
function validateOptions(options) {
    const { error, value } = exports.protectionOptionsSchema.validate(options, {
        abortEarly: false,
        allowUnknown: false
    });
    if (error) {
        throw new Error(`Invalid options: ${error.details.map(d => d.message).join(', ')}`);
    }
    return value;
}
//# sourceMappingURL=validation.js.map