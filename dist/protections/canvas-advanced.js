"use strict";
/**
 * Advanced Canvas Text Rendering Protection
 * Provides enhanced protection against canvas-based fingerprinting with text rendering variations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedCanvasProtection = void 0;
class AdvancedCanvasProtection {
    static getSubPixelTextRenderingProtection() {
        const variations = JSON.stringify(AdvancedCanvasProtection.textVariations);
        return `
      // Sub-pixel Text Rendering Protection
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override fillText with sub-pixel variations
        const originalFillText = contextProto.fillText;
        contextProto.fillText = function(text, x, y, maxWidth) {
          const variations = ${variations};
          
          // Add consistent but subtle sub-pixel variations
          const textHash = (text + this.font + this.fillStyle).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const subPixelX = (textHash % 100) / 1000 * variations.subPixelShift;
          const subPixelY = ((textHash >> 8) % 100) / 1000 * variations.subPixelShift;
          const baselineShift = ((textHash >> 16) % 100) / 1000 * variations.baselineShift;
          
          // Apply variations
          const adjustedX = x + subPixelX;
          const adjustedY = y + subPixelY + baselineShift;
          
          // Temporary adjust text rendering settings for consistency
          const originalTextAlign = this.textAlign;
          const originalTextBaseline = this.textBaseline;
          const originalFont = this.font;
          
          // Normalize anti-aliasing by slightly adjusting font size
          const fontSizeMatch = this.font.match(/(\\d+(?:\\.\\d+)?)px/);
          if (fontSizeMatch) {
            const currentSize = parseFloat(fontSizeMatch[1]);
            const antiAliasingAdjust = ((textHash >> 24) % 100) / 10000 * variations.antiAliasingVariation;
            const adjustedSize = currentSize + antiAliasingAdjust;
            this.font = this.font.replace(fontSizeMatch[0], adjustedSize + 'px');
          }
          
          const result = originalFillText.call(this, text, adjustedX, adjustedY, maxWidth);
          
          // Restore original settings
          this.textAlign = originalTextAlign;
          this.textBaseline = originalTextBaseline;
          this.font = originalFont;
          
          return result;
        };
        
        // Override strokeText with same variations
        const originalStrokeText = contextProto.strokeText;
        contextProto.strokeText = function(text, x, y, maxWidth) {
          const variations = ${variations};
          
          const textHash = (text + this.font + this.strokeStyle).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const subPixelX = (textHash % 100) / 1000 * variations.subPixelShift;
          const subPixelY = ((textHash >> 8) % 100) / 1000 * variations.subPixelShift;
          
          return originalStrokeText.call(this, text, x + subPixelX, y + subPixelY, maxWidth);
        };
      }
    `;
    }
    static getCanvasPathRenderingProtection() {
        return `
      // Canvas Path Rendering Protection
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override arc drawing for consistent rendering
        const originalArc = contextProto.arc;
        contextProto.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
          // Add micro-variations to prevent exact arc fingerprinting
          const pathHash = (x + y + radius + startAngle + endAngle).toString();
          const hash = pathHash.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const radiusVariation = (hash % 1000) / 100000; // ±0.01px variation
          const adjustedRadius = radius + ((hash % 2) ? radiusVariation : -radiusVariation);
          
          return originalArc.call(this, x, y, adjustedRadius, startAngle, endAngle, anticlockwise);
        };
        
        // Override bezier curves for consistency
        const originalBezierCurveTo = contextProto.bezierCurveTo;
        contextProto.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
          const curveHash = (cp1x + cp1y + cp2x + cp2y + x + y).toString();
          const hash = curveHash.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const microVariation = (hash % 100) / 100000; // Very small variation
          
          return originalBezierCurveTo.call(this, 
            cp1x + microVariation, cp1y + microVariation,
            cp2x + microVariation, cp2y + microVariation,
            x + microVariation, y + microVariation
          );
        };
        
        // Override quadratic curves
        const originalQuadraticCurveTo = contextProto.quadraticCurveTo;
        contextProto.quadraticCurveTo = function(cpx, cpy, x, y) {
          const curveHash = (cpx + cpy + x + y).toString();
          const hash = curveHash.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const microVariation = (hash % 100) / 100000;
          
          return originalQuadraticCurveTo.call(this, 
            cpx + microVariation, cpy + microVariation,
            x + microVariation, y + microVariation
          );
        };
      }
    `;
    }
    static getCanvasGradientProtection() {
        return `
      // Canvas Gradient Fingerprinting Protection
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override linear gradient creation
        const originalCreateLinearGradient = contextProto.createLinearGradient;
        contextProto.createLinearGradient = function(x0, y0, x1, y1) {
          // Add micro-variations to gradient coordinates
          const gradientHash = (x0 + y0 + x1 + y1).toString();
          const hash = gradientHash.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const variation = (hash % 1000) / 100000; // ±0.01 variation
          
          return originalCreateLinearGradient.call(this,
            x0 + variation, y0 + variation,
            x1 + variation, y1 + variation
          );
        };
        
        // Override radial gradient creation
        const originalCreateRadialGradient = contextProto.createRadialGradient;
        contextProto.createRadialGradient = function(x0, y0, r0, x1, y1, r1) {
          const gradientHash = (x0 + y0 + r0 + x1 + y1 + r1).toString();
          const hash = gradientHash.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const variation = (hash % 1000) / 100000;
          
          return originalCreateRadialGradient.call(this,
            x0 + variation, y0 + variation, r0 + variation,
            x1 + variation, y1 + variation, r1 + variation
          );
        };
        
        // Override conic gradient if available
        if (contextProto.createConicGradient) {
          const originalCreateConicGradient = contextProto.createConicGradient;
          contextProto.createConicGradient = function(startAngle, centerX, centerY) {
            const gradientHash = (startAngle + centerX + centerY).toString();
            const hash = gradientHash.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            
            const angleVariation = (hash % 1000) / 100000; // Small angle variation
            const positionVariation = ((hash >> 8) % 1000) / 100000;
            
            return originalCreateConicGradient.call(this,
              startAngle + angleVariation,
              centerX + positionVariation,
              centerY + positionVariation
            );
          };
        }
      }
    `;
    }
    static getCanvasShadowProtection() {
        return `
      // Canvas Shadow Rendering Protection
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override shadow properties to normalize rendering
        const shadowProperties = ['shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor'];
        
        shadowProperties.forEach(property => {
          const originalDescriptor = Object.getOwnPropertyDescriptor(contextProto, property);
          if (originalDescriptor) {
            Object.defineProperty(contextProto, property, {
              get: originalDescriptor.get,
              set: function(value) {
                if (property === 'shadowOffsetX' || property === 'shadowOffsetY') {
                  // Add micro-variations to shadow offset
                  const offsetHash = value.toString().split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                  }, 0);
                  
                  const variation = (offsetHash % 100) / 10000; // ±0.01 variation
                  const adjustedValue = value + ((offsetHash % 2) ? variation : -variation);
                  return originalDescriptor.set.call(this, adjustedValue);
                }
                
                if (property === 'shadowBlur') {
                  // Normalize blur values to prevent exact measurements
                  const normalizedBlur = Math.round(value * 10) / 10; // Round to 0.1
                  return originalDescriptor.set.call(this, normalizedBlur);
                }
                
                return originalDescriptor.set.call(this, value);
              },
              configurable: true
            });
          }
        });
      }
    `;
    }
    static getCanvasCompositeProtection() {
        return `
      // Canvas Composite Operation Protection
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override composite operations for consistency
        const originalCompositeDescriptor = Object.getOwnPropertyDescriptor(
          contextProto, 'globalCompositeOperation'
        );
        
        if (originalCompositeDescriptor) {
          Object.defineProperty(contextProto, 'globalCompositeOperation', {
            get: originalCompositeDescriptor.get,
            set: function(value) {
              // Normalize composite operations to prevent fingerprinting variations
              const normalizedOperations = {
                'source-over': 'source-over',
                'source-in': 'source-over', // Normalize to common operation
                'source-out': 'source-over',
                'source-atop': 'source-over',
                'destination-over': 'source-over',
                'destination-in': 'source-over',
                'destination-out': 'source-over',
                'destination-atop': 'source-over',
                'lighter': 'lighter', // Keep lighter as it's commonly supported
                'copy': 'source-over',
                'xor': 'source-over',
                'multiply': 'source-over',
                'screen': 'source-over',
                'overlay': 'source-over',
                'darken': 'source-over',
                'lighten': 'source-over',
                'color-dodge': 'source-over',
                'color-burn': 'source-over',
                'hard-light': 'source-over',
                'soft-light': 'source-over',
                'difference': 'source-over',
                'exclusion': 'source-over',
                'hue': 'source-over',
                'saturation': 'source-over',
                'color': 'source-over',
                'luminosity': 'source-over'
              };
              
              const normalizedValue = normalizedOperations[value] || 'source-over';
              return originalCompositeDescriptor.set.call(this, normalizedValue);
            },
            configurable: true
          });
        }
      }
    `;
    }
    static getAllAdvancedCanvasProtections() {
        return `
      ${this.getSubPixelTextRenderingProtection()}
      ${this.getCanvasPathRenderingProtection()}
      ${this.getCanvasGradientProtection()}
      ${this.getCanvasShadowProtection()}
      ${this.getCanvasCompositeProtection()}
    `;
    }
}
exports.AdvancedCanvasProtection = AdvancedCanvasProtection;
AdvancedCanvasProtection.textVariations = {
    subPixelShift: 0.1,
    antiAliasingVariation: 0.05,
    kerningAdjustment: 0.02,
    baselineShift: 0.03
};
//# sourceMappingURL=canvas-advanced.js.map