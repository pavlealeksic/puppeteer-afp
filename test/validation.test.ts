import { validateOptions } from '../dist/validation';
import { ProtectionOptions } from '../dist/types';

describe('Validation', () => {
  describe('validateOptions', () => {
    it('should validate valid options', () => {
      const options: ProtectionOptions = {
        canvasRgba: [1, 2, -3, 4],
        webRTCProtect: true,
        enableLogging: false,
        logLevel: 'info',
        hardwareConfig: {
          hardwareConcurrency: 8,
          deviceMemory: 8
        },
        screenConfig: {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1040,
          colorDepth: 24,
          pixelDepth: 24
        }
      };

      expect(() => validateOptions(options)).not.toThrow();
      const result = validateOptions(options);
      expect(result).toEqual(options);
    });

    it('should reject invalid canvas RGBA values', () => {
      const options: ProtectionOptions = {
        canvasRgba: [10, 2, -3, 4] // 10 is out of range (-5 to 5)
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid canvas RGBA array length', () => {
      const options: ProtectionOptions = {
        canvasRgba: [1, 2, 3] // Should be length 4
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid log level', () => {
      const options: ProtectionOptions = {
        logLevel: 'invalid' as any
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid screen color depth', () => {
      const options: ProtectionOptions = {
        screenConfig: {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1040,
          colorDepth: 15, // Invalid color depth
          pixelDepth: 24
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid hardware concurrency', () => {
      const options: ProtectionOptions = {
        hardwareConfig: {
          hardwareConcurrency: 0, // Should be at least 1
          deviceMemory: 8
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid device memory', () => {
      const options: ProtectionOptions = {
        hardwareConfig: {
          hardwareConcurrency: 8,
          deviceMemory: 3 // Not in valid values list
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid battery level', () => {
      const options: ProtectionOptions = {
        batteryConfig: {
          charging: true,
          chargingTime: 3600,
          dischargingTime: 7200,
          level: 1.5 // Should be between 0 and 1
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject negative battery times', () => {
      const options: ProtectionOptions = {
        batteryConfig: {
          charging: true,
          chargingTime: -100, // Should be positive
          dischargingTime: 7200,
          level: 0.8
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid connection effective type', () => {
      const options: ProtectionOptions = {
        connectionConfig: {
          effectiveType: '5g', // Not in valid list
          rtt: 50,
          downlink: 10,
          saveData: false
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject negative connection values', () => {
      const options: ProtectionOptions = {
        connectionConfig: {
          effectiveType: '4g',
          rtt: -10, // Should be non-negative
          downlink: 10,
          saveData: false
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid font fingerprint noise', () => {
      const options: ProtectionOptions = {
        fontFingerprint: {
          noise: 5, // Should be between -2 and 2
          sign: 1
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid font fingerprint sign', () => {
      const options: ProtectionOptions = {
        fontFingerprint: {
          noise: 1,
          sign: 0 // Should be -1 or 1
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid audio fingerprint values', () => {
      const options: ProtectionOptions = {
        audioFingerprint: {
          getChannelDataIndexRandom: 1.5, // Should be between 0 and 1
          getChannelDataResultRandom: 0.5,
          createAnalyserIndexRandom: 0.3,
          createAnalyserResultRandom: 0.8
        }
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject invalid profile name', () => {
      const options: ProtectionOptions = {
        profile: 'opera' as any // Not in valid list
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should reject negative rotation interval', () => {
      const options: ProtectionOptions = {
        rotationInterval: -1000 // Should be non-negative
      };

      expect(() => validateOptions(options)).toThrow();
    });

    it('should allow empty options', () => {
      const options: ProtectionOptions = {};
      
      expect(() => validateOptions(options)).not.toThrow();
      const result = validateOptions(options);
      expect(result).toEqual({});
    });

    it('should provide detailed error messages', () => {
      const options: ProtectionOptions = {
        canvasRgba: [10, 2, -3, 4], // Invalid
        logLevel: 'invalid' as any, // Invalid
        hardwareConfig: {
          hardwareConcurrency: 0, // Invalid
          deviceMemory: 8
        }
      };

      try {
        validateOptions(options);
        fail('Should have thrown an error');
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain('Invalid options:');
        expect(message).toContain('canvasRgba');
        expect(message).toContain('logLevel');
        expect(message).toContain('hardwareConcurrency');
      }
    });
  });
});