import Joi from 'joi';
import { ProtectionOptions } from './types';

const canvasRgbaSchema = Joi.array().items(Joi.number().min(-5).max(5)).length(4);

const webglDataSchema = Joi.object().pattern(
  Joi.number(),
  Joi.alternatives().try(
    Joi.number(),
    Joi.string(),
    Joi.object().pattern(Joi.number(), Joi.number()),
    Joi.array().items(Joi.number())
  )
);

const fontFingerprintSchema = Joi.object({
  noise: Joi.number().min(-2).max(2),
  sign: Joi.number().valid(-1, 1)
});

const audioFingerprintSchema = Joi.object({
  getChannelDataIndexRandom: Joi.number().min(0).max(1),
  getChannelDataResultRandom: Joi.number().min(0).max(1),
  createAnalyserIndexRandom: Joi.number().min(0).max(1),
  createAnalyserResultRandom: Joi.number().min(0).max(1)
});

const timezoneConfigSchema = Joi.object({
  timezone: Joi.string(),
  locale: Joi.string()
});

const screenConfigSchema = Joi.object({
  width: Joi.number().positive(),
  height: Joi.number().positive(),
  availWidth: Joi.number().positive(),
  availHeight: Joi.number().positive(),
  colorDepth: Joi.number().valid(8, 16, 24, 30, 32),
  pixelDepth: Joi.number().valid(8, 16, 24, 30, 32)
});

const batteryConfigSchema = Joi.object({
  charging: Joi.boolean(),
  chargingTime: Joi.number().min(0),
  dischargingTime: Joi.number().min(0),
  level: Joi.number().min(0).max(1)
});

const hardwareConfigSchema = Joi.object({
  hardwareConcurrency: Joi.number().min(1).max(128),
  deviceMemory: Joi.number().valid(0.25, 0.5, 1, 2, 4, 8, 16, 32, 64)
});

const languageConfigSchema = Joi.object({
  languages: Joi.array().items(Joi.string()),
  language: Joi.string(),
  platform: Joi.string()
});

const pluginConfigSchema = Joi.object({
  plugins: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    filename: Joi.string().required(),
    description: Joi.string().required(),
    version: Joi.string()
  })),
  mimeTypes: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    suffixes: Joi.string().required(),
    description: Joi.string().required()
  }))
});

const connectionConfigSchema = Joi.object({
  effectiveType: Joi.string().valid('slow-2g', '2g', '3g', '4g'),
  rtt: Joi.number().min(0),
  downlink: Joi.number().min(0),
  saveData: Joi.boolean()
});

const userAgentConfigSchema = Joi.object({
  userAgent: Joi.string(),
  platform: Joi.string(),
  vendor: Joi.string().allow(''),
  appVersion: Joi.string()
});

const engineEmulationConfigSchema = Joi.object({
  javascript: Joi.boolean(),
  css: Joi.boolean(),
  dom: Joi.boolean(),
  hardware: Joi.boolean(),
  network: Joi.boolean()
});

const featuresSchema = Joi.object({
  canvas: Joi.boolean(),
  webgl: Joi.boolean(),
  audio: Joi.boolean(),
  font: Joi.boolean(),
  webrtc: Joi.boolean(),
  timezone: Joi.boolean(),
  screen: Joi.boolean(),
  battery: Joi.boolean(),
  hardware: Joi.boolean(),
  language: Joi.boolean(),
  plugins: Joi.boolean(),
  connection: Joi.boolean(),
  userAgent: Joi.boolean(),
  tcp: Joi.boolean(),
  dns: Joi.boolean()
});

export const protectionOptionsSchema = Joi.object<ProtectionOptions>({
  canvasRgba: canvasRgbaSchema,
  webglData: webglDataSchema,
  fontFingerprint: fontFingerprintSchema,
  audioFingerprint: audioFingerprintSchema,
  webRTCProtect: Joi.boolean(),
  deviceMemory: Joi.number().valid(0.25, 0.5, 1, 2, 4, 8, 16, 32, 64),
  timezoneConfig: timezoneConfigSchema,
  screenConfig: screenConfigSchema,
  batteryConfig: batteryConfigSchema,
  hardwareConfig: hardwareConfigSchema,
  languageConfig: languageConfigSchema,
  pluginConfig: pluginConfigSchema,
  connectionConfig: connectionConfigSchema,
  userAgentConfig: userAgentConfigSchema,
  enableLogging: Joi.boolean(),
  logLevel: Joi.string().valid('debug', 'info', 'warn', 'error'),
  features: featuresSchema,
  rotationInterval: Joi.number().min(0),
  profile: Joi.string().valid('chrome', 'firefox', 'safari', 'edge', 'custom'),
  engineEmulation: engineEmulationConfigSchema
});

export function validateOptions(options: ProtectionOptions): ProtectionOptions {
  const { error, value } = protectionOptionsSchema.validate(options, { 
    abortEarly: false,
    allowUnknown: false 
  });
  
  if (error) {
    throw new Error(`Invalid options: ${error.details.map(d => d.message).join(', ')}`);
  }
  
  return value;
}