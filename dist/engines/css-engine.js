"use strict";
/**
 * CSS Engine Fingerprinting Emulation
 * Replicates Blink, Gecko, and WebKit CSS rendering differences
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssEngineConfigs = exports.CSSEngineEmulator = void 0;
class CSSEngineEmulator {
    constructor(config) {
        this.styleCache = new Map();
        this.computedStyleTimings = new Map();
        this.layoutTimings = new Map();
        this.config = config;
        this.initializeStyleTimings();
    }
    initializeStyleTimings() {
        const baseTimings = {
            'style-computation': 0.5,
            'layout-calculation': 1.0,
            'paint-operations': 2.0,
            'composite-layers': 0.8,
            'selector-matching': 0.3,
            'css-parsing': 0.2,
            'font-loading': 10.0,
            'image-decoding': 5.0
        };
        const engineMultipliers = this.getEngineMultipliers();
        Object.entries(baseTimings).forEach(([key, value]) => {
            const multiplier = engineMultipliers[key] || 1;
            this.computedStyleTimings.set(key, value * multiplier);
        });
    }
    getEngineMultipliers() {
        switch (this.config.engine) {
            case 'blink':
                return {
                    'style-computation': 0.8, // Blink is highly optimized
                    'layout-calculation': 0.7, // Excellent layout performance
                    'paint-operations': 0.9, // GPU acceleration
                    'composite-layers': 0.6, // Best compositing
                    'selector-matching': 0.8, // Fast selector engine
                    'css-parsing': 0.9, // Good parser
                    'font-loading': 0.8, // Font caching
                    'image-decoding': 0.9 // Hardware decoding
                };
            case 'gecko':
                return {
                    'style-computation': 1.1,
                    'layout-calculation': 1.2,
                    'paint-operations': 1.1,
                    'composite-layers': 1.3, // Gecko compositing is slower
                    'selector-matching': 1.0,
                    'css-parsing': 1.0,
                    'font-loading': 1.2,
                    'image-decoding': 1.1
                };
            case 'webkit':
                return {
                    'style-computation': 0.9,
                    'layout-calculation': 0.95,
                    'paint-operations': 0.85, // WebKit has good painting
                    'composite-layers': 0.9,
                    'selector-matching': 0.9,
                    'css-parsing': 0.95,
                    'font-loading': 0.9,
                    'image-decoding': 0.8 // Safari image optimization
                };
            default:
                return {};
        }
    }
    getInjectionScript() {
        return `
      (function() {
        const cssEngineConfig = ${JSON.stringify(this.config)};
        const styleTimings = ${JSON.stringify(Object.fromEntries(this.computedStyleTimings))};
        
        // Override getComputedStyle for engine-specific behavior
        ${this.getComputedStyleScript()}
        
        // Override CSSStyleSheet methods
        ${this.getStyleSheetScript()}
        
        // Override CSS parsing and rule creation
        ${this.getCSSRuleScript()}
        
        // Override CSS animations and transitions
        ${this.getAnimationScript()}
        
        // Override CSS layout properties
        ${this.getLayoutScript()}
        
        // Override CSS font loading
        ${this.getFontLoadingScript()}
        
        // Override CSS media queries
        ${this.getMediaQueryScript()}
        
        // Override CSS custom properties
        ${this.getCustomPropertiesScript()}
        
        // Override CSS selector API
        ${this.getSelectorAPIScript()}
        
        // Override CSS painting API
        ${this.getPaintingAPIScript()}
        
        // Override CSS transforms and filters
        ${this.getTransformFilterScript()}
        
        // Override viewport and scrolling
        ${this.getViewportScript()}
        
      })();
    `;
    }
    getComputedStyleScript() {
        return `
      const originalGetComputedStyle = window.getComputedStyle;
      
      window.getComputedStyle = function(element, pseudoElement) {
        const startTime = performance.now();
        const result = originalGetComputedStyle.call(this, element, pseudoElement);
        
        // Engine-specific computed style behavior
        const engineSpecificResult = new Proxy(result, {
          get: function(target, property) {
            const value = target[property];
            
            if (typeof property === 'string' && typeof value === 'string') {
              // Apply engine-specific value formatting
              return formatCSSValue(property, value, cssEngineConfig.engine);
            }
            
            return value;
          }
        });
        
        // Simulate computation time
        const computationTime = styleTimings['style-computation'] || 0;
        if (computationTime > 0) {
          const elapsed = performance.now() - startTime;
          if (elapsed < computationTime) {
            // Add artificial delay to match engine characteristics
            const additionalDelay = computationTime - elapsed;
            if (additionalDelay > 0.1) {
              setTimeout(() => {}, additionalDelay);
            }
          }
        }
        
        return engineSpecificResult;
      };
      
      function formatCSSValue(property, value, engine) {
        if (!value) return value;
        
        // Engine-specific value formatting differences
        switch (engine) {
          case 'blink':
            // Blink specific formatting
            if (property.includes('color') && value.startsWith('rgb')) {
              // Blink normalizes colors to specific precision
              return value.replace(/rgb\\(([^)]+)\\)/, (match, values) => {
                const nums = values.split(',').map(n => Math.round(parseFloat(n.trim())));
                return \`rgb(\${nums.join(', ')})\`;
              });
            }
            if (property.includes('font-size')) {
              // Blink uses specific pixel precision
              return value.replace(/(\\d+\\.\\d+)px/, (match, num) => {
                return Math.round(parseFloat(num) * 16) / 16 + 'px';
              });
            }
            break;
            
          case 'gecko':
            // Firefox specific formatting  
            if (property.includes('color') && value.startsWith('rgb')) {
              return value.replace(/rgb\\(([^)]+)\\)/, (match, values) => {
                const nums = values.split(',').map(n => parseInt(n.trim()));
                return \`rgb(\${nums.join(', ')})\`;
              });
            }
            if (value.includes('px')) {
              // Firefox sometimes returns more decimal places
              return value.replace(/(\\d+)px/, (match, num) => {
                return parseFloat(num).toFixed(1) + 'px';
              });
            }
            break;
            
          case 'webkit':
            // WebKit/Safari specific formatting
            if (property.includes('transform') && value !== 'none') {
              // WebKit has specific transform matrix formatting
              return value.replace(/matrix\\(([^)]+)\\)/, (match, values) => {
                const nums = values.split(',').map(n => 
                  parseFloat(n.trim()).toFixed(6));
                return \`matrix(\${nums.join(', ')})\`;
              });
            }
            if (property.includes('border') && value.includes('px')) {
              // WebKit rounds border values differently
              return value.replace(/(\\d+\\.\\d+)px/, (match, num) => {
                return Math.round(parseFloat(num)) + 'px';
              });
            }
            break;
        }
        
        return value;
      }
    `;
    }
    getStyleSheetScript() {
        return `
      if (typeof CSSStyleSheet !== 'undefined') {
        const originalInsertRule = CSSStyleSheet.prototype.insertRule;
        const originalDeleteRule = CSSStyleSheet.prototype.deleteRule;
        
        CSSStyleSheet.prototype.insertRule = function(rule, index) {
          const parseTime = styleTimings['css-parsing'] * rule.length * 0.001;
          if (parseTime > 0) {
            setTimeout(() => {}, parseTime);
          }
          
          // Engine-specific rule validation
          if (cssEngineConfig.parsing.selectorParsing === 'strict') {
            // Strict parsing - reject invalid selectors
            if (rule.includes(':-webkit-') && cssEngineConfig.engine !== 'webkit') {
              throw new DOMException('Invalid selector', 'SyntaxError');
            }
            if (rule.includes(':-moz-') && cssEngineConfig.engine !== 'gecko') {
              throw new DOMException('Invalid selector', 'SyntaxError');  
            }
          }
          
          return originalInsertRule.call(this, rule, index);
        };
        
        CSSStyleSheet.prototype.deleteRule = function(index) {
          const deleteTime = styleTimings['css-parsing'] * 0.1;
          if (deleteTime > 0) {
            setTimeout(() => {}, deleteTime);
          }
          return originalDeleteRule.call(this, index);
        };
      }
    `;
    }
    getCSSRuleScript() {
        return `
      // Override CSS rule creation and modification
      if (typeof CSSRule !== 'undefined') {
        const rulePrototype = CSSRule.prototype;
        
        // Engine-specific rule type support
        const supportedRules = cssEngineConfig.parsing.atRuleSupport || [];
        
        Object.defineProperty(rulePrototype, 'cssText', {
          get: function() {
            const text = this._cssText || '';
            
            // Format according to engine preferences
            switch (cssEngineConfig.engine) {
              case 'blink':
                return text.replace(/;\\s+/g, '; ').replace(/\\{\\s+/g, ' { ');
              case 'gecko':
                return text.replace(/;(?!\\s)/g, '; ').replace(/\\{/g, ' {\\n  ');
              case 'webkit':
                return text.replace(/;\\s*/g, '; ').replace(/\\s*\\{/g, ' {');
              default:
                return text;
            }
          },
          set: function(value) {
            this._cssText = value;
          }
        });
      }
    `;
    }
    getAnimationScript() {
        return `
      // CSS Animation and Transition timing
      const originalAnimate = Element.prototype.animate || function() {};
      
      if (Element.prototype.animate) {
        Element.prototype.animate = function(keyframes, options) {
          const animationTime = styleTimings['paint-operations'];
          
          // Engine-specific animation behavior
          const engineOptions = { ...options };
          
          if (cssEngineConfig.engine === 'webkit') {
            // WebKit has different default easing
            engineOptions.easing = engineOptions.easing || 'ease-in-out';
          } else if (cssEngineConfig.engine === 'gecko') {
            // Firefox handles fill modes differently
            engineOptions.fill = engineOptions.fill || 'both';
          }
          
          const animation = originalAnimate.call(this, keyframes, engineOptions);
          
          // Simulate frame rate differences
          if (animation && animation.updatePlaybackRate) {
            const frameRate = cssEngineConfig.engine === 'blink' ? 60 : 
                             cssEngineConfig.engine === 'webkit' ? 60 : 55;
            animation.updatePlaybackRate(frameRate / 60);
          }
          
          return animation;
        };
      }
      
      // Override transition events
      const originalAddEventListener = Element.prototype.addEventListener;
      Element.prototype.addEventListener = function(type, listener, options) {
        if (type === 'transitionend' || type === 'animationend') {
          const engineListener = function(event) {
            // Engine-specific event timing
            const delay = cssEngineConfig.engine === 'gecko' ? 1 : 0;
            if (delay > 0) {
              setTimeout(() => listener.call(this, event), delay);
            } else {
              listener.call(this, event);
            }
          };
          return originalAddEventListener.call(this, type, engineListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    `;
    }
    getLayoutScript() {
        return `
      // Override layout-related properties and methods
      const layoutProps = ['offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight', 
                          'scrollWidth', 'scrollHeight', 'getBoundingClientRect'];
      
      layoutProps.forEach(prop => {
        if (prop === 'getBoundingClientRect') {
          const originalMethod = Element.prototype[prop];
          Element.prototype[prop] = function() {
            const layoutTime = styleTimings['layout-calculation'];
            if (layoutTime > 0) {
              setTimeout(() => {}, layoutTime);
            }
            
            const rect = originalMethod.call(this);
            
            // Engine-specific precision differences
            if (cssEngineConfig.engine === 'blink') {
              // Blink rounds to 1/64th pixel precision
              return {
                ...rect,
                left: Math.round(rect.left * 64) / 64,
                top: Math.round(rect.top * 64) / 64,
                right: Math.round(rect.right * 64) / 64,
                bottom: Math.round(rect.bottom * 64) / 64,
                width: Math.round(rect.width * 64) / 64,
                height: Math.round(rect.height * 64) / 64
              };
            } else if (cssEngineConfig.engine === 'webkit') {
              // WebKit has different precision
              return {
                ...rect,
                left: Math.round(rect.left * 32) / 32,
                top: Math.round(rect.top * 32) / 32,
                right: Math.round(rect.right * 32) / 32,
                bottom: Math.round(rect.bottom * 32) / 32,
                width: Math.round(rect.width * 32) / 32,
                height: Math.round(rect.height * 32) / 32
              };
            }
            
            return rect;
          };
        } else {
          // Override dimension properties
          const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, prop) ||
                           Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
          
          if (descriptor && descriptor.get) {
            const originalGetter = descriptor.get;
            
            Object.defineProperty(Element.prototype, prop, {
              get: function() {
                const layoutTime = styleTimings['layout-calculation'] * 0.1;
                if (layoutTime > 0) {
                  setTimeout(() => {}, layoutTime);
                }
                
                const value = originalGetter.call(this);
                
                // Engine-specific rounding
                if (cssEngineConfig.engine === 'gecko') {
                  // Firefox tends to round to integers more
                  return Math.round(value);
                } else if (cssEngineConfig.engine === 'blink') {
                  // Blink uses subpixel precision
                  return Math.round(value * 4) / 4;
                }
                
                return value;
              },
              configurable: true,
              enumerable: descriptor.enumerable
            });
          }
        }
      });
    `;
    }
    getFontLoadingScript() {
        return `
      // CSS Font Loading API
      if (typeof FontFace !== 'undefined') {
        const originalFontFace = FontFace;
        
        FontFace = function(family, source, descriptors) {
          const fontFace = new originalFontFace(family, source, descriptors);
          
          // Engine-specific font loading behavior
          const originalLoad = fontFace.load;
          fontFace.load = function() {
            const loadTime = styleTimings['font-loading'];
            
            // Simulate font loading time based on engine
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                originalLoad.call(this)
                  .then(resolve)
                  .catch(reject);
              }, loadTime * (0.8 + Math.random() * 0.4)); // Add realistic variance
            });
          };
          
          return fontFace;
        };
      }
      
      // Override document.fonts if available
      if (document.fonts) {
        const originalAdd = document.fonts.add;
        const originalDelete = document.fonts.delete;
        
        document.fonts.add = function(fontFace) {
          const addTime = styleTimings['font-loading'] * 0.1;
          if (addTime > 0) {
            setTimeout(() => {}, addTime);
          }
          return originalAdd.call(this, fontFace);
        };
        
        document.fonts.delete = function(fontFace) {
          const deleteTime = styleTimings['font-loading'] * 0.05;
          if (deleteTime > 0) {
            setTimeout(() => {}, deleteTime);
          }
          return originalDelete.call(this, fontFace);
        };
      }
    `;
    }
    getMediaQueryScript() {
        return `
      // Media Query handling
      if (typeof matchMedia !== 'undefined') {
        const originalMatchMedia = window.matchMedia;
        
        window.matchMedia = function(query) {
          const result = originalMatchMedia.call(this, query);
          
          // Engine-specific media query behavior
          const engineResult = {
            ...result,
            matches: result.matches
          };
          
          // Some engines have slight differences in media query evaluation
          if (cssEngineConfig.engine === 'gecko' && query.includes('prefers-color-scheme')) {
            // Firefox handles color scheme detection slightly differently
            engineResult.matches = result.matches;
          }
          
          return engineResult;
        };
      }
    `;
    }
    getCustomPropertiesScript() {
        return `
      // CSS Custom Properties (CSS Variables)
      if (cssEngineConfig.parsing.customProperties) {
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
        const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
        
        CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
          if (property.startsWith('--')) {
            // Custom property handling
            const setTime = styleTimings['style-computation'] * 0.2;
            if (setTime > 0) {
              setTimeout(() => {}, setTime);
            }
          }
          return originalSetProperty.call(this, property, value, priority);
        };
        
        CSSStyleDeclaration.prototype.getPropertyValue = function(property) {
          if (property.startsWith('--')) {
            const getTime = styleTimings['style-computation'] * 0.1;
            if (getTime > 0) {
              setTimeout(() => {}, getTime);
            }
          }
          
          const value = originalGetPropertyValue.call(this, property);
          
          // Engine-specific custom property value formatting
          if (property.startsWith('--') && value) {
            switch (cssEngineConfig.engine) {
              case 'blink':
                return value.trim();
              case 'gecko':
                return value; // Firefox preserves whitespace
              case 'webkit':
                return value.replace(/\\s+/g, ' ').trim();
            }
          }
          
          return value;
        };
      }
    `;
    }
    getSelectorAPIScript() {
        return `
      // CSS Selector API
      const selectorMethods = ['querySelector', 'querySelectorAll'];
      
      selectorMethods.forEach(method => {
        const originalMethod = Document.prototype[method] || Element.prototype[method];
        
        if (originalMethod) {
          const override = function(selector) {
            const selectorTime = styleTimings['selector-matching'] * selector.length * 0.01;
            if (selectorTime > 0) {
              setTimeout(() => {}, selectorTime);
            }
            
            // Engine-specific selector parsing
            let processedSelector = selector;
            
            if (cssEngineConfig.engine === 'webkit') {
              // WebKit has stricter selector parsing
              processedSelector = selector.replace(/::-webkit-[^\\s,]+/g, (match) => {
                // WebKit pseudo-elements are supported
                return match;
              });
            } else {
              // Other engines might ignore webkit-specific selectors
              processedSelector = selector.replace(/::-webkit-[^\\s,]+/g, '');
            }
            
            try {
              return originalMethod.call(this, processedSelector);
            } catch (e) {
              // Engine-specific error handling
              if (cssEngineConfig.parsing.errorRecovery === 'aggressive') {
                // Try to recover by simplifying the selector
                const simpleSelector = selector.split(',')[0].split(' ')[0];
                return originalMethod.call(this, simpleSelector);
              }
              throw e;
            }
          };
          
          Document.prototype[method] = override;
          Element.prototype[method] = override;
        }
      });
    `;
    }
    getPaintingAPIScript() {
        return `
      // CSS Painting API simulation
      if (typeof CSS !== 'undefined' && CSS.paintWorklet) {
        const originalAddModule = CSS.paintWorklet.addModule;
        
        CSS.paintWorklet.addModule = function(moduleURL) {
          const paintTime = styleTimings['paint-operations'];
          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              originalAddModule.call(this, moduleURL)
                .then(resolve)
                .catch(reject);
            }, paintTime);
          });
        };
      }
      
      // Override canvas context for CSS-generated content
      if (typeof CanvasRenderingContext2D !== 'undefined') {
        const originalFillText = CanvasRenderingContext2D.prototype.fillText;
        
        CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
          // Engine-specific text rendering differences
          const renderTime = styleTimings['paint-operations'] * 0.01;
          if (renderTime > 0) {
            setTimeout(() => {}, renderTime);
          }
          
          return originalFillText.call(this, text, x, y, maxWidth);
        };
      }
    `;
    }
    getTransformFilterScript() {
        return `
      // CSS Transform and Filter operations
      const transformProps = ['transform', 'filter', 'backdrop-filter'];
      
      transformProps.forEach(prop => {
        const observers = new Set();
        
        // Monitor transform/filter changes
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
        CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
          if (property === prop) {
            const processTime = styleTimings['composite-layers'];
            if (processTime > 0) {
              setTimeout(() => {
                // Trigger composite layer creation
                observers.forEach(observer => observer(property, value));
              }, processTime);
            }
          }
          return originalSetProperty.call(this, property, value, priority);
        };
      });
    `;
    }
    getViewportScript() {
        return `
      // Viewport and scrolling behavior
      const originalScrollTo = Window.prototype.scrollTo || function() {};
      const originalScrollBy = Window.prototype.scrollBy || function() {};
      
      Window.prototype.scrollTo = function(x, y) {
        const scrollTime = cssEngineConfig.layout.scrollBehavior === 'smooth' ? 
                          styleTimings['layout-calculation'] * 2 : 0;
        
        if (scrollTime > 0) {
          // Simulate smooth scrolling timing
          const startX = window.pageXOffset;
          const startY = window.pageYOffset;
          const deltaX = (typeof x === 'object' ? x.left : x) - startX;
          const deltaY = (typeof y === 'object' ? x.top : y) - startY;
          
          const duration = scrollTime;
          const startTime = performance.now();
          
          const smoothScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Engine-specific easing
            let easedProgress;
            switch (cssEngineConfig.engine) {
              case 'blink':
                easedProgress = progress * (2 - progress); // Ease out
                break;
              case 'webkit':
                easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                break;
              case 'gecko':
                easedProgress = progress < 0.5 ? 2 * progress * progress : 
                               1 - Math.pow(-2 * progress + 2, 3) / 2; // Ease in out
                break;
              default:
                easedProgress = progress;
            }
            
            originalScrollTo.call(this, 
              startX + deltaX * easedProgress,
              startY + deltaY * easedProgress
            );
            
            if (progress < 1) {
              requestAnimationFrame(smoothScroll);
            }
          };
          
          requestAnimationFrame(smoothScroll);
        } else {
          return originalScrollTo.call(this, x, y);
        }
      };
      
      // Similar override for scrollBy
      Window.prototype.scrollBy = function(x, y) {
        return this.scrollTo(
          window.pageXOffset + (typeof x === 'object' ? x.left : x),
          window.pageYOffset + (typeof y === 'object' ? x.top : y)
        );
      };
    `;
    }
}
exports.CSSEngineEmulator = CSSEngineEmulator;
// Predefined CSS engine configurations
exports.cssEngineConfigs = {
    chrome: {
        engine: 'blink',
        version: '120.0.6099.109',
        features: ['css-grid', 'css-flexbox', 'css-custom-properties', 'css-containment'],
        rendering: {
            antialiasing: 'subpixel',
            fontSmoothing: 'auto',
            textRendering: 'optimizeLegibility',
            colorProfile: 'srgb',
            pixelRatio: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
            layoutFlushBehavior: 'batched'
        },
        layout: {
            boxModel: 'standard',
            flexboxVersion: 'new',
            gridSupport: 'full',
            scrollBehavior: 'smooth',
            zIndexStacking: 'standard',
            containment: 'strict'
        },
        parsing: {
            vendorPrefixes: ['-webkit-', '-moz-', '-ms-'],
            customProperties: true,
            atRuleSupport: ['@supports', '@media', '@keyframes', '@import'],
            selectorParsing: 'strict',
            errorRecovery: 'conservative',
            unicodeSupport: 'full'
        },
        computedStyles: {
            inheritanceRules: { 'color': true, 'font-family': true, 'font-size': true },
            defaultValues: { 'display': 'block', 'position': 'static' },
            computationOrder: ['display', 'position', 'width', 'height'],
            caching: 'aggressive',
            precision: 6
        }
    },
    firefox: {
        engine: 'gecko',
        version: '120.0',
        features: ['css-grid', 'css-flexbox', 'css-custom-properties'],
        rendering: {
            antialiasing: 'grayscale',
            fontSmoothing: 'always',
            textRendering: 'optimizeLegibility',
            colorProfile: 'srgb',
            pixelRatio: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
            layoutFlushBehavior: 'sync'
        },
        layout: {
            boxModel: 'standard',
            flexboxVersion: 'new',
            gridSupport: 'full',
            scrollBehavior: 'auto',
            zIndexStacking: 'standard',
            containment: 'layout'
        },
        parsing: {
            vendorPrefixes: ['-moz-', '-webkit-'],
            customProperties: true,
            atRuleSupport: ['@supports', '@media', '@keyframes', '@import', '@document'],
            selectorParsing: 'quirks',
            errorRecovery: 'aggressive',
            unicodeSupport: 'full'
        },
        computedStyles: {
            inheritanceRules: { 'color': true, 'font-family': true, 'font-size': true },
            defaultValues: { 'display': 'block', 'position': 'static' },
            computationOrder: ['display', 'position', 'width', 'height'],
            caching: 'conservative',
            precision: 4
        }
    },
    safari: {
        engine: 'webkit',
        version: '17.1',
        features: ['css-grid', 'css-flexbox', 'css-custom-properties'],
        rendering: {
            antialiasing: 'subpixel',
            fontSmoothing: 'auto',
            textRendering: 'auto',
            colorProfile: 'display-p3',
            pixelRatio: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
            layoutFlushBehavior: 'async'
        },
        layout: {
            boxModel: 'standard',
            flexboxVersion: 'new',
            gridSupport: 'full',
            scrollBehavior: 'smooth',
            zIndexStacking: 'webkit-transforms',
            containment: 'paint'
        },
        parsing: {
            vendorPrefixes: ['-webkit-', '-moz-'],
            customProperties: true,
            atRuleSupport: ['@supports', '@media', '@keyframes', '@import'],
            selectorParsing: 'strict',
            errorRecovery: 'conservative',
            unicodeSupport: 'basic'
        },
        computedStyles: {
            inheritanceRules: { 'color': true, 'font-family': true, 'font-size': true },
            defaultValues: { 'display': 'block', 'position': 'static' },
            computationOrder: ['display', 'position', 'width', 'height'],
            caching: 'aggressive',
            precision: 5
        }
    }
};
//# sourceMappingURL=css-engine.js.map