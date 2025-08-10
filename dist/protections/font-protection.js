"use strict";
/**
 * Advanced Font Fingerprinting Protection
 * Provides comprehensive protection against font-based fingerprinting techniques
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontProtection = void 0;
class FontProtection {
    static getFontEnumerationProtection() {
        return `
      // Advanced Font Enumeration Protection
      if (typeof document !== 'undefined') {
        const commonFonts = ${JSON.stringify(FontProtection.commonFonts)};
        const webSafeFonts = ${JSON.stringify(FontProtection.webSafeFonts)};
        
        // Override font detection via canvas measurement
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
          const element = originalCreateElement.call(this, tagName);
          
          if (tagName.toLowerCase() === 'span' || tagName.toLowerCase() === 'div') {
            // Create consistent font measurement results
            const fontMeasurementCache = new Map();
            
            // Override offset measurements
            const originalOffsetWidth = Object.getOwnPropertyDescriptor(
              HTMLElement.prototype, 'offsetWidth'
            );
            const originalOffsetHeight = Object.getOwnPropertyDescriptor(
              HTMLElement.prototype, 'offsetHeight'
            );
            
            if (originalOffsetWidth) {
              Object.defineProperty(element, 'offsetWidth', {
                get: function() {
                  const fontFamily = this.style.fontFamily;
                  const fontSize = this.style.fontSize;
                  const textContent = this.textContent || this.innerText || '';
                  
                  if (fontFamily && textContent) {
                    const cacheKey = fontFamily + '|' + fontSize + '|' + textContent;
                    
                    if (fontMeasurementCache.has(cacheKey)) {
                      return fontMeasurementCache.get(cacheKey).width;
                    }
                    
                    const baseWidth = originalOffsetWidth.get.call(this);
                    let normalizedWidth = baseWidth;
                    
                    // Normalize measurements for font detection prevention
                    const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
                    
                    if (!webSafeFonts.includes(fontName)) {
                      // For non-web-safe fonts, return measurement as if Arial was used
                      const tempElement = document.createElement('span');
                      tempElement.style.fontFamily = 'Arial';
                      tempElement.style.fontSize = fontSize || '12px';
                      tempElement.textContent = textContent;
                      tempElement.style.visibility = 'hidden';
                      tempElement.style.position = 'absolute';
                      tempElement.style.top = '-9999px';
                      document.body.appendChild(tempElement);
                      
                      normalizedWidth = tempElement.offsetWidth;
                      document.body.removeChild(tempElement);
                    }
                    
                    // Add consistent but undetectable variation
                    const hash = fontName.split('').reduce((a, b) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0);
                    const variation = (hash % 3) - 1; // -1, 0, or 1 pixel
                    normalizedWidth += variation;
                    
                    fontMeasurementCache.set(cacheKey, { 
                      width: normalizedWidth, 
                      height: originalOffsetHeight?.get?.call(this) || 0 
                    });
                    
                    return normalizedWidth;
                  }
                  
                  return originalOffsetWidth.get.call(this);
                },
                configurable: true
              });
            }
            
            if (originalOffsetHeight) {
              Object.defineProperty(element, 'offsetHeight', {
                get: function() {
                  const fontFamily = this.style.fontFamily;
                  const fontSize = this.style.fontSize;
                  const textContent = this.textContent || this.innerText || '';
                  
                  if (fontFamily && textContent) {
                    const cacheKey = fontFamily + '|' + fontSize + '|' + textContent;
                    
                    if (fontMeasurementCache.has(cacheKey)) {
                      return fontMeasurementCache.get(cacheKey).height;
                    }
                    
                    const baseHeight = originalOffsetHeight.get.call(this);
                    let normalizedHeight = baseHeight;
                    
                    const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
                    
                    if (!webSafeFonts.includes(fontName)) {
                      // Normalize to Arial measurements
                      const tempElement = document.createElement('span');
                      tempElement.style.fontFamily = 'Arial';
                      tempElement.style.fontSize = fontSize || '12px';
                      tempElement.textContent = textContent;
                      tempElement.style.visibility = 'hidden';
                      tempElement.style.position = 'absolute';
                      tempElement.style.top = '-9999px';
                      document.body.appendChild(tempElement);
                      
                      normalizedHeight = tempElement.offsetHeight;
                      document.body.removeChild(tempElement);
                    }
                    
                    // Add consistent variation
                    const hash = fontName.split('').reduce((a, b) => {
                      a = ((a << 5) - a) + b.charCodeAt(0);
                      return a & a;
                    }, 0);
                    const variation = (hash % 3) - 1;
                    normalizedHeight += variation;
                    
                    if (fontMeasurementCache.has(cacheKey)) {
                      fontMeasurementCache.get(cacheKey).height = normalizedHeight;
                    } else {
                      fontMeasurementCache.set(cacheKey, { 
                        width: originalOffsetWidth?.get?.call(this) || 0, 
                        height: normalizedHeight 
                      });
                    }
                    
                    return normalizedHeight;
                  }
                  
                  return originalOffsetHeight.get.call(this);
                },
                configurable: true
              });
            }
          }
          
          return element;
        };
        
        // Override document.fonts API
        if (typeof FontFaceSet !== 'undefined' && document.fonts) {
          const originalCheck = document.fonts.check;
          const originalLoad = document.fonts.load;
          
          // Override font availability checking
          document.fonts.check = function(font, text) {
            const fontRegex = /family:?\\s*([^,;]+)/i;
            const fontFamily = font.match(fontRegex)?.[1]?.replace(/['\"]/g, '').trim();
            
            if (fontFamily && !webSafeFonts.includes(fontFamily)) {
              // Always return false for non-web-safe fonts
              return false;
            }
            
            return originalCheck.call(this, font, text);
          };
          
          // Override font loading
          document.fonts.load = async function(font, text) {
            const fontRegex = /family:?\\s*([^,;]+)/i;
            const fontFamily = font.match(fontRegex)?.[1]?.replace(/['\"]/g, '').trim();
            
            if (fontFamily && !webSafeFonts.includes(fontFamily)) {
              // Reject loading of non-web-safe fonts
              return Promise.reject(new Error('Font not available'));
            }
            
            return originalLoad.call(this, font, text);
          };
          
          // Override font iteration
          const originalForEach = document.fonts.forEach;
          document.fonts.forEach = function(callback, thisArg) {
            // Only iterate over web-safe fonts
            const webSafeFontFaces = Array.from(this).filter(fontFace => {
              return webSafeFonts.includes(fontFace.family);
            });
            webSafeFontFaces.forEach(callback, thisArg);
          };
        }
        
        // Override CSS font loading detection
        if (typeof FontFace !== 'undefined') {
          const originalFontFace = FontFace;
          FontFace = function(family, source, descriptors) {
            // Normalize font loading behavior
            if (!webSafeFonts.includes(family)) {
              throw new Error('Font family not supported');
            }
            
            const normalizedDescriptors = {
              ...descriptors,
              display: 'block', // Consistent font display
              unicodeRange: descriptors?.unicodeRange || 'U+0-10FFFF'
            };
            
            return new originalFontFace(family, source, normalizedDescriptors);
          };
          
          Object.setPrototypeOf(FontFace, originalFontFace);
          FontFace.prototype = originalFontFace.prototype;
        }
      }
    `;
    }
    static getTextRenderingProtection() {
        return `
      // Advanced Text Rendering Protection
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const contextProto = CanvasRenderingContext2D.prototype;
        
        // Override measureText for consistent measurements
        const originalMeasureText = contextProto.measureText;
        contextProto.measureText = function(text) {
          const metrics = originalMeasureText.call(this, text);
          
          // Get current font
          const font = this.font || '10px sans-serif';
          const fontRegex = /(?:^|\\s)([^\\s,]+)/;
          const fontFamily = font.match(fontRegex)?.[1] || 'sans-serif';
          
          // Normalize text metrics for font fingerprinting protection
          if (!${JSON.stringify(FontProtection.webSafeFonts)}.includes(fontFamily)) {
            // Return Arial metrics for unknown fonts
            const originalFont = this.font;
            this.font = font.replace(fontFamily, 'Arial');
            const normalizedMetrics = originalMeasureText.call(this, text);
            this.font = originalFont;
            
            return {
              width: normalizedMetrics.width,
              actualBoundingBoxLeft: normalizedMetrics.actualBoundingBoxLeft,
              actualBoundingBoxRight: normalizedMetrics.actualBoundingBoxRight,
              fontBoundingBoxAscent: normalizedMetrics.fontBoundingBoxAscent,
              fontBoundingBoxDescent: normalizedMetrics.fontBoundingBoxDescent,
              actualBoundingBoxAscent: normalizedMetrics.actualBoundingBoxAscent,
              actualBoundingBoxDescent: normalizedMetrics.actualBoundingBoxDescent,
              emHeightAscent: normalizedMetrics.emHeightAscent,
              emHeightDescent: normalizedMetrics.emHeightDescent,
              hangingBaseline: normalizedMetrics.hangingBaseline,
              alphabeticBaseline: normalizedMetrics.alphabeticBaseline,
              ideographicBaseline: normalizedMetrics.ideographicBaseline
            };
          }
          
          // Add slight but consistent variation to prevent exact measurements
          const hash = (fontFamily + text).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const variation = (hash % 100) / 1000; // 0 to 0.099 variation
          
          return {
            width: metrics.width + variation,
            actualBoundingBoxLeft: (metrics.actualBoundingBoxLeft || 0) + variation,
            actualBoundingBoxRight: (metrics.actualBoundingBoxRight || metrics.width) + variation,
            fontBoundingBoxAscent: (metrics.fontBoundingBoxAscent || 12) + variation,
            fontBoundingBoxDescent: (metrics.fontBoundingBoxDescent || 3) + variation,
            actualBoundingBoxAscent: (metrics.actualBoundingBoxAscent || 9) + variation,
            actualBoundingBoxDescent: (metrics.actualBoundingBoxDescent || 2) + variation,
            emHeightAscent: (metrics.emHeightAscent || 9) + variation,
            emHeightDescent: (metrics.emHeightDescent || 2) + variation,
            hangingBaseline: (metrics.hangingBaseline || 7) + variation,
            alphabeticBaseline: (metrics.alphabeticBaseline || 0),
            ideographicBaseline: (metrics.ideographicBaseline || -2) + variation
          };
        };
        
        // Override font property setter
        const originalFontDescriptor = Object.getOwnPropertyDescriptor(contextProto, 'font');
        if (originalFontDescriptor) {
          Object.defineProperty(contextProto, 'font', {
            get: originalFontDescriptor.get,
            set: function(value) {
              // Normalize font specifications
              let normalizedFont = value;
              
              // Extract font family and check if it's web-safe
              const fontFamilyRegex = /(?:^|\\s)(['"]?)([^\\s,'"]+)\\1(?:,|$)/;
              const fontFamilyMatch = value.match(fontFamilyRegex);
              if (fontFamilyMatch) {
                const fontFamily = fontFamilyMatch[2];
                if (!${JSON.stringify(FontProtection.webSafeFonts)}.includes(fontFamily)) {
                  // Replace with Arial for unknown fonts
                  normalizedFont = value.replace(fontFamilyMatch[0], fontFamilyMatch[0].replace(fontFamily, 'Arial'));
                }
              }
              
              return originalFontDescriptor.set.call(this, normalizedFont);
            },
            configurable: true
          });
        }
      }
    `;
    }
    static getFontLoadingProtection() {
        return `
      // Font Loading Event Protection
      if (typeof document !== 'undefined' && document.fonts) {
        // Override font loading events
        const originalAddEventListener = document.fonts.addEventListener;
        const originalRemoveEventListener = document.fonts.removeEventListener;
        
        if (originalAddEventListener) {
          document.fonts.addEventListener = function(type, listener, options) {
            if (type === 'loadingdone' || type === 'loadingerror') {
              // Filter out non-web-safe font events
              const filteredListener = function(event) {
                const safeFonts = event.fontfaces?.filter(fontface => {
                  return ${JSON.stringify(FontProtection.webSafeFonts)}.includes(fontface.family);
                }) || [];
                
                if (safeFonts.length > 0) {
                  const filteredEvent = {
                    ...event,
                    fontfaces: safeFonts
                  };
                  return listener.call(this, filteredEvent);
                }
              };
              
              return originalAddEventListener.call(this, type, filteredListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
          };
        }
      }
      
      // Override CSS Font Loading Module
      if (typeof CSS !== 'undefined' && CSS.supports) {
        const originalSupports = CSS.supports;
        CSS.supports = function(property, value) {
          // Filter font-related feature queries
          if (property === 'font-family' && value) {
            const fontFamily = value.replace(/['"]/g, '').trim();
            if (!${JSON.stringify(FontProtection.webSafeFonts)}.includes(fontFamily)) {
              return false;
            }
          }
          
          return originalSupports.call(this, property, value);
        };
      }
    `;
    }
    static getAllFontProtections() {
        return `
      ${this.getFontEnumerationProtection()}
      ${this.getTextRenderingProtection()}
      ${this.getFontLoadingProtection()}
    `;
    }
}
exports.FontProtection = FontProtection;
FontProtection.commonFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
    'Arial Black', 'Impact', 'Lucida Sans Unicode', 'Tahoma', 'Geneva',
    'Lucida Console', 'Monaco', 'Consolas', 'Menlo', 'DejaVu Sans'
];
FontProtection.webSafeFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New',
    'Verdana', 'Georgia', 'Impact', 'Trebuchet MS', 'Comic Sans MS'
];
//# sourceMappingURL=font-protection.js.map