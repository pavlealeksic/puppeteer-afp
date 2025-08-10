"use strict";
/**
 * DOM Implementation Fingerprinting Emulation
 * Replicates browser-specific DOM method behaviors and characteristics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.domEngineConfigs = exports.DOMEngineEmulator = void 0;
class DOMEngineEmulator {
    constructor(config) {
        this.mutationObservers = new Set();
        this.eventTimings = new Map();
        this.nodeCounters = new Map();
        this.config = config;
        this.initializeEventTimings();
    }
    initializeEventTimings() {
        const baseTimings = {
            'node-creation': 0.01,
            'node-removal': 0.005,
            'attribute-modification': 0.002,
            'text-modification': 0.001,
            'tree-traversal': 0.05,
            'event-dispatch': 0.01,
            'mutation-observation': 0.02,
            'style-computation': 0.1
        };
        const engineMultipliers = this.getEngineMultipliers();
        Object.entries(baseTimings).forEach(([key, value]) => {
            const multiplier = engineMultipliers[key] || 1;
            this.eventTimings.set(key, value * multiplier);
        });
    }
    getEngineMultipliers() {
        switch (this.config.engine) {
            case 'blink':
                return {
                    'node-creation': 0.8,
                    'node-removal': 0.7,
                    'attribute-modification': 0.9,
                    'text-modification': 0.8,
                    'tree-traversal': 0.6,
                    'event-dispatch': 0.9,
                    'mutation-observation': 0.8,
                    'style-computation': 0.7
                };
            case 'gecko':
                return {
                    'node-creation': 1.2,
                    'node-removal': 1.1,
                    'attribute-modification': 1.0,
                    'text-modification': 1.1,
                    'tree-traversal': 1.3,
                    'event-dispatch': 1.1,
                    'mutation-observation': 1.2,
                    'style-computation': 1.4
                };
            case 'webkit':
                return {
                    'node-creation': 1.0,
                    'node-removal': 0.9,
                    'attribute-modification': 0.95,
                    'text-modification': 0.9,
                    'tree-traversal': 1.0,
                    'event-dispatch': 1.0,
                    'mutation-observation': 1.1,
                    'style-computation': 1.0
                };
            default:
                return {};
        }
    }
    getInjectionScript() {
        return `
      (function() {
        const domConfig = ${JSON.stringify(this.config)};
        const eventTimings = ${JSON.stringify(Object.fromEntries(this.eventTimings))};
        
        // Override Document methods
        ${this.getDocumentScript()}
        
        // Override Element methods
        ${this.getElementScript()}
        
        // Override Node methods
        ${this.getNodeScript()}
        
        // Override Event system
        ${this.getEventScript()}
        
        // Override MutationObserver
        ${this.getMutationObserverScript()}
        
        // Override DOM traversal methods
        ${this.getTraversalScript()}
        
        // Override attribute methods
        ${this.getAttributeScript()}
        
        // Override text content methods
        ${this.getTextContentScript()}
        
        // Override DOM manipulation methods
        ${this.getDOMManipulationScript()}
        
        // Override Custom Elements
        ${this.getCustomElementsScript()}
        
        // Override Shadow DOM
        ${this.getShadowDOMScript()}
        
        // Override selection methods
        ${this.getSelectionScript()}
        
        // Override range methods
        ${this.getRangeScript()}
        
      })();
    `;
    }
    getDocumentScript() {
        return `
      // Document method overrides
      const originalCreateElement = Document.prototype.createElement;
      const originalCreateTextNode = Document.prototype.createTextNode;
      const originalGetElementById = Document.prototype.getElementById;
      
      Document.prototype.createElement = function(tagName, options) {
        const createTime = eventTimings['node-creation'];
        if (createTime > 0) {
          setTimeout(() => {}, createTime);
        }
        
        const element = originalCreateElement.call(this, tagName, options);
        
        // Engine-specific element creation behavior
        if (domConfig.engine === 'webkit') {
          // WebKit has specific attribute handling
          element._webkitCreated = true;
        } else if (domConfig.engine === 'gecko') {
          // Firefox tracks element creation order
          element._geckoIndex = Date.now() + Math.random();
        }
        
        return element;
      };
      
      Document.prototype.createTextNode = function(data) {
        const createTime = eventTimings['node-creation'] * 0.5;
        if (createTime > 0) {
          setTimeout(() => {}, createTime);
        }
        
        const textNode = originalCreateTextNode.call(this, data);
        
        // Engine-specific text node behavior
        if (domConfig.engine === 'blink') {
          // Blink normalizes whitespace differently
          textNode.textContent = data;
        }
        
        return textNode;
      };
      
      Document.prototype.getElementById = function(id) {
        const searchTime = eventTimings['tree-traversal'] * 0.1;
        if (searchTime > 0) {
          setTimeout(() => {}, searchTime);
        }
        
        return originalGetElementById.call(this, id);
      };
      
      // Document state simulation
      Object.defineProperty(Document.prototype, 'readyState', {
        get: function() {
          return domConfig.api.documentReadyState;
        },
        configurable: true
      });
      
      Object.defineProperty(Document.prototype, 'baseURI', {
        get: function() {
          return domConfig.api.baseURI || location.href;
        },
        configurable: true
      });
    `;
    }
    getElementScript() {
        return `
      // Element method overrides
      const originalAppendChild = Element.prototype.appendChild;
      const originalRemoveChild = Element.prototype.removeChild;
      const originalInsertBefore = Element.prototype.insertBefore;
      const originalCloneNode = Element.prototype.cloneNode;
      
      Element.prototype.appendChild = function(child) {
        const appendTime = eventTimings['node-creation'] * 0.3;
        if (appendTime > 0) {
          setTimeout(() => {}, appendTime);
        }
        
        const result = originalAppendChild.call(this, child);
        
        // Engine-specific post-append behavior
        if (domConfig.engine === 'blink') {
          // Trigger style recalculation
          setTimeout(() => {
            if (child.nodeType === Node.ELEMENT_NODE) {
              const computedStyle = getComputedStyle(child);
              // Force style computation
              computedStyle.display;
            }
          }, eventTimings['style-computation']);
        }
        
        return result;
      };
      
      Element.prototype.removeChild = function(child) {
        const removeTime = eventTimings['node-removal'];
        if (removeTime > 0) {
          setTimeout(() => {}, removeTime);
        }
        
        return originalRemoveChild.call(this, child);
      };
      
      Element.prototype.insertBefore = function(newNode, referenceNode) {
        const insertTime = eventTimings['node-creation'] * 0.4;
        if (insertTime > 0) {
          setTimeout(() => {}, insertTime);
        }
        
        return originalInsertBefore.call(this, newNode, referenceNode);
      };
      
      Element.prototype.cloneNode = function(deep) {
        const cloneTime = eventTimings['node-creation'] * (deep ? 2 : 1);
        if (cloneTime > 0) {
          setTimeout(() => {}, cloneTime);
        }
        
        const cloned = originalCloneNode.call(this, deep);
        
        // Engine-specific cloning behavior
        if (domConfig.engine === 'gecko') {
          // Firefox preserves more metadata during cloning
          cloned._originalNode = this;
        }
        
        return cloned;
      };
      
      // Override innerHTML for engine-specific parsing
      const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
      if (originalInnerHTMLDescriptor) {
        Object.defineProperty(Element.prototype, 'innerHTML', {
          get: originalInnerHTMLDescriptor.get,
          set: function(value) {
            const parseTime = eventTimings['node-creation'] * value.length * 0.001;
            if (parseTime > 0) {
              setTimeout(() => {}, parseTime);
            }
            
            // Engine-specific HTML parsing
            let processedValue = value;
            if (domConfig.engine === 'webkit') {
              // WebKit has stricter HTML parsing
              processedValue = value.replace(/<([^>]+)>/g, (match, tag) => {
                return '<' + tag.toLowerCase() + '>';
              });
            }
            
            return originalInnerHTMLDescriptor.set.call(this, processedValue);
          },
          configurable: true,
          enumerable: originalInnerHTMLDescriptor.enumerable
        });
      }
    `;
    }
    getNodeScript() {
        return `
      // Node method overrides
      const originalNodeValue = Object.getOwnPropertyDescriptor(Node.prototype, 'nodeValue');
      const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
      
      if (originalNodeValue) {
        Object.defineProperty(Node.prototype, 'nodeValue', {
          get: originalNodeValue.get,
          set: function(value) {
            const modifyTime = eventTimings['text-modification'];
            if (modifyTime > 0) {
              setTimeout(() => {}, modifyTime);
            }
            return originalNodeValue.set.call(this, value);
          },
          configurable: true,
          enumerable: originalNodeValue.enumerable
        });
      }
      
      if (originalTextContent) {
        Object.defineProperty(Node.prototype, 'textContent', {
          get: function() {
            const getText = eventTimings['tree-traversal'] * 0.05;
            if (getText > 0) {
              setTimeout(() => {}, getText);
            }
            
            const content = originalTextContent.get.call(this);
            
            // Engine-specific text content behavior
            if (domConfig.api.textContentBehavior === 'legacy') {
              // Legacy behavior preserves more whitespace
              return content;
            } else {
              // Standard behavior normalizes whitespace
              return content ? content.replace(/\\s+/g, ' ').trim() : content;
            }
          },
          set: function(value) {
            const modifyTime = eventTimings['text-modification'];
            if (modifyTime > 0) {
              setTimeout(() => {}, modifyTime);
            }
            return originalTextContent.set.call(this, value);
          },
          configurable: true,
          enumerable: originalTextContent.enumerable
        });
      }
      
      // Override node comparison methods
      const originalCompareDocumentPosition = Node.prototype.compareDocumentPosition;
      Node.prototype.compareDocumentPosition = function(other) {
        const compareTime = eventTimings['tree-traversal'] * 0.2;
        if (compareTime > 0) {
          setTimeout(() => {}, compareTime);
        }
        return originalCompareDocumentPosition.call(this, other);
      };
      
      const originalContains = Node.prototype.contains;
      Node.prototype.contains = function(other) {
        const containsTime = eventTimings['tree-traversal'] * 0.1;
        if (containsTime > 0) {
          setTimeout(() => {}, containsTime);
        }
        return originalContains.call(this, other);
      };
    `;
    }
    getEventScript() {
        return `
      // Event system overrides
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
      const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
      
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        const addTime = eventTimings['event-dispatch'] * 0.1;
        if (addTime > 0) {
          setTimeout(() => {}, addTime);
        }
        
        // Engine-specific event listener behavior
        let processedOptions = options;
        if (domConfig.engine === 'webkit') {
          // WebKit has different passive event defaults
          if (typeof options === 'object' && options !== null) {
            processedOptions = { ...options };
            if (type === 'touchstart' || type === 'touchmove') {
              processedOptions.passive = processedOptions.passive !== false;
            }
          }
        }
        
        return originalAddEventListener.call(this, type, listener, processedOptions);
      };
      
      EventTarget.prototype.removeEventListener = function(type, listener, options) {
        const removeTime = eventTimings['event-dispatch'] * 0.05;
        if (removeTime > 0) {
          setTimeout(() => {}, removeTime);
        }
        return originalRemoveEventListener.call(this, type, listener, options);
      };
      
      EventTarget.prototype.dispatchEvent = function(event) {
        const dispatchTime = eventTimings['event-dispatch'];
        
        // Engine-specific event dispatch timing
        if (domConfig.events.eventOrder === 'fifo') {
          // First in, first out
          setTimeout(() => {
            return originalDispatchEvent.call(this, event);
          }, dispatchTime);
        } else if (domConfig.events.eventOrder === 'lifo') {
          // Last in, first out (stack-like)
          setTimeout(() => {
            return originalDispatchEvent.call(this, event);
          }, dispatchTime * 0.5);
        } else {
          // Priority-based
          const priority = event.type === 'click' ? 0 : 
                          event.type.startsWith('key') ? 1 : 
                          event.type.startsWith('mouse') ? 2 : 3;
          setTimeout(() => {
            return originalDispatchEvent.call(this, event);
          }, dispatchTime * (1 + priority * 0.1));
        }
        
        return true; // Return immediately for async dispatch
      };
      
      // Custom Event constructor override
      const originalCustomEvent = CustomEvent;
      CustomEvent = function(type, eventInitDict) {
        const event = new originalCustomEvent(type, eventInitDict);
        
        // Engine-specific event properties
        if (domConfig.engine === 'blink') {
          event._blinkTimestamp = performance.now();
        } else if (domConfig.engine === 'gecko') {
          event._geckoOrigin = location.origin;
        }
        
        return event;
      };
    `;
    }
    getMutationObserverScript() {
        return `
      // MutationObserver override
      const originalMutationObserver = MutationObserver;
      const observerInstances = new Set();
      
      MutationObserver = function(callback) {
        const wrappedCallback = function(mutations, observer) {
          const processTime = eventTimings['mutation-observation'];
          
          // Engine-specific mutation processing
          const processedMutations = mutations.map(mutation => {
            const processed = { ...mutation };
            
            if (domConfig.engine === 'blink') {
              // Blink provides more detailed mutation records
              processed._blinkMetadata = {
                timestamp: performance.now(),
                batchId: Math.random()
              };
            } else if (domConfig.engine === 'gecko') {
              // Firefox groups mutations differently
              processed._geckoGroupId = Math.floor(Math.random() * 1000);
            }
            
            return processed;
          });
          
          if (domConfig.mutations.throttling && processTime > 0) {
            setTimeout(() => {
              callback(processedMutations, observer);
            }, processTime);
          } else {
            callback(processedMutations, observer);
          }
        };
        
        const observer = new originalMutationObserver(wrappedCallback);
        observerInstances.add(observer);
        
        // Override observe method
        const originalObserve = observer.observe;
        observer.observe = function(target, options) {
          const observeTime = eventTimings['mutation-observation'] * 0.2;
          if (observeTime > 0) {
            setTimeout(() => {}, observeTime);
          }
          
          // Engine-specific observation options
          let processedOptions = { ...options };
          if (domConfig.engine === 'webkit') {
            // WebKit has different default values for some options
            processedOptions.childList = processedOptions.childList !== false;
          }
          
          return originalObserve.call(this, target, processedOptions);
        };
        
        return observer;
      };
      
      // Copy static properties
      Object.setPrototypeOf(MutationObserver, originalMutationObserver);
      MutationObserver.prototype = originalMutationObserver.prototype;
    `;
    }
    getTraversalScript() {
        return `
      // DOM traversal method overrides
      const traversalMethods = ['firstChild', 'lastChild', 'nextSibling', 'previousSibling', 
                               'parentNode', 'childNodes', 'children'];
      
      traversalMethods.forEach(property => {
        const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, property) ||
                          Object.getOwnPropertyDescriptor(Element.prototype, property);
        
        if (descriptor && descriptor.get) {
          const originalGetter = descriptor.get;
          const targetPrototype = Node.prototype.hasOwnProperty(property) ? 
                                 Node.prototype : Element.prototype;
          
          Object.defineProperty(targetPrototype, property, {
            get: function() {
              const traversalTime = eventTimings['tree-traversal'] * 0.05;
              if (traversalTime > 0) {
                setTimeout(() => {}, traversalTime);
              }
              
              const result = originalGetter.call(this);
              
              // Engine-specific traversal behavior
              if (property === 'childNodes' && domConfig.api.nodeListType === 'static') {
                // Convert live NodeList to static array for some engines
                return Array.from(result);
              }
              
              return result;
            },
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable
          });
        }
      });
      
      // TreeWalker and NodeIterator overrides
      if (typeof document.createTreeWalker !== 'undefined') {
        const originalCreateTreeWalker = document.createTreeWalker;
        document.createTreeWalker = function(root, whatToShow, filter) {
          const walker = originalCreateTreeWalker.call(this, root, whatToShow, filter);
          
          // Engine-specific TreeWalker behavior
          const originalNextNode = walker.nextNode;
          walker.nextNode = function() {
            const walkTime = eventTimings['tree-traversal'] * 0.3;
            if (walkTime > 0) {
              setTimeout(() => {}, walkTime);
            }
            return originalNextNode.call(this);
          };
          
          return walker;
        };
      }
      
      if (typeof document.createNodeIterator !== 'undefined') {
        const originalCreateNodeIterator = document.createNodeIterator;
        document.createNodeIterator = function(root, whatToShow, filter) {
          const iterator = originalCreateNodeIterator.call(this, root, whatToShow, filter);
          
          const originalNextNode = iterator.nextNode;
          iterator.nextNode = function() {
            const iterateTime = eventTimings['tree-traversal'] * 0.2;
            if (iterateTime > 0) {
              setTimeout(() => {}, iterateTime);
            }
            return originalNextNode.call(this);
          };
          
          return iterator;
        };
      }
    `;
    }
    getAttributeScript() {
        return `
      // Attribute method overrides
      const originalSetAttribute = Element.prototype.setAttribute;
      const originalGetAttribute = Element.prototype.getAttribute;
      const originalRemoveAttribute = Element.prototype.removeAttribute;
      const originalHasAttribute = Element.prototype.hasAttribute;
      
      Element.prototype.setAttribute = function(name, value) {
        const setTime = eventTimings['attribute-modification'];
        if (setTime > 0) {
          setTimeout(() => {}, setTime);
        }
        
        // Engine-specific attribute normalization
        let processedName = name;
        let processedValue = value;
        
        if (domConfig.api.attributeNormalization === 'strict') {
          processedName = name.toLowerCase();
          processedValue = String(value);
        } else if (domConfig.engine === 'webkit') {
          // WebKit preserves case for custom attributes
          if (!name.startsWith('data-') && !name.match(/^[a-z]+$/)) {
            processedName = name;
          }
        }
        
        return originalSetAttribute.call(this, processedName, processedValue);
      };
      
      Element.prototype.getAttribute = function(name) {
        const getTime = eventTimings['attribute-modification'] * 0.1;
        if (getTime > 0) {
          setTimeout(() => {}, getTime);
        }
        
        const result = originalGetAttribute.call(this, name);
        
        // Engine-specific attribute value formatting
        if (result !== null && domConfig.engine === 'blink') {
          // Blink normalizes certain attribute values
          if (name === 'class') {
            return result.replace(/\\s+/g, ' ').trim();
          }
        }
        
        return result;
      };
      
      Element.prototype.removeAttribute = function(name) {
        const removeTime = eventTimings['attribute-modification'] * 0.5;
        if (removeTime > 0) {
          setTimeout(() => {}, removeTime);
        }
        return originalRemoveAttribute.call(this, name);
      };
      
      Element.prototype.hasAttribute = function(name) {
        const hasTime = eventTimings['attribute-modification'] * 0.05;
        if (hasTime > 0) {
          setTimeout(() => {}, hasTime);
        }
        return originalHasAttribute.call(this, name);
      };
      
      // Override attributes property
      const originalAttributes = Object.getOwnPropertyDescriptor(Element.prototype, 'attributes');
      if (originalAttributes) {
        Object.defineProperty(Element.prototype, 'attributes', {
          get: function() {
            const getTime = eventTimings['attribute-modification'] * 0.2;
            if (getTime > 0) {
              setTimeout(() => {}, getTime);
            }
            
            const attrs = originalAttributes.get.call(this);
            
            // Engine-specific attribute ordering
            if (domConfig.api.stringifyOrder === 'alphabetical') {
              const sortedAttrs = Array.from(attrs).sort((a, b) => a.name.localeCompare(b.name));
              return sortedAttrs;
            }
            
            return attrs;
          },
          configurable: originalAttributes.configurable,
          enumerable: originalAttributes.enumerable
        });
      }
    `;
    }
    getTextContentScript() {
        return `
      // Text content method overrides
      const textMethods = ['innerText', 'textContent'];
      
      textMethods.forEach(method => {
        const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, method) ||
                          Object.getOwnPropertyDescriptor(HTMLElement.prototype, method);
        
        if (descriptor) {
          const targetPrototype = Element.prototype.hasOwnProperty(method) ? 
                                 Element.prototype : HTMLElement.prototype;
          
          Object.defineProperty(targetPrototype, method, {
            get: function() {
              const getTime = eventTimings['text-modification'] * 0.1;
              if (getTime > 0) {
                setTimeout(() => {}, getTime);
              }
              
              const content = descriptor.get ? descriptor.get.call(this) : this['_' + method];
              
              // Engine-specific text processing
              if (content && domConfig.traversal.whitespaceHandling !== 'preserve') {
                if (domConfig.traversal.whitespaceHandling === 'normalize') {
                  return content.replace(/\\s+/g, ' ').trim();
                } else if (domConfig.traversal.whitespaceHandling === 'ignore') {
                  return content.replace(/\\s/g, '');
                }
              }
              
              return content;
            },
            set: function(value) {
              const setTime = eventTimings['text-modification'];
              if (setTime > 0) {
                setTimeout(() => {}, setTime);
              }
              
              if (descriptor.set) {
                return descriptor.set.call(this, value);
              } else {
                this['_' + method] = value;
              }
            },
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable
          });
        }
      });
    `;
    }
    getDOMManipulationScript() {
        return `
      // DOM manipulation method overrides
      const manipulationMethods = ['insertAdjacentHTML', 'insertAdjacentElement', 'insertAdjacentText'];
      
      manipulationMethods.forEach(method => {
        if (Element.prototype[method]) {
          const originalMethod = Element.prototype[method];
          
          Element.prototype[method] = function(...args) {
            const manipulateTime = eventTimings['node-creation'] * 0.5;
            if (manipulateTime > 0) {
              setTimeout(() => {}, manipulateTime);
            }
            
            // Engine-specific position validation
            const position = args[0];
            if (domConfig.engine === 'webkit') {
              // WebKit is stricter about position validation
              const validPositions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend'];
              if (!validPositions.includes(position)) {
                throw new DOMException('Invalid position', 'SyntaxError');
              }
            }
            
            return originalMethod.apply(this, args);
          };
        }
      });
      
      // Override replaceWith and remove methods
      if (Element.prototype.replaceWith) {
        const originalReplaceWith = Element.prototype.replaceWith;
        Element.prototype.replaceWith = function(...nodes) {
          const replaceTime = eventTimings['node-removal'];
          if (replaceTime > 0) {
            setTimeout(() => {}, replaceTime);
          }
          return originalReplaceWith.apply(this, nodes);
        };
      }
      
      if (Element.prototype.remove) {
        const originalRemove = Element.prototype.remove;
        Element.prototype.remove = function() {
          const removeTime = eventTimings['node-removal'];
          if (removeTime > 0) {
            setTimeout(() => {}, removeTime);
          }
          return originalRemove.call(this);
        };
      }
    `;
    }
    getCustomElementsScript() {
        return `
      // Custom Elements API override
      if (domConfig.features.customElements && typeof customElements !== 'undefined') {
        const originalDefine = customElements.define;
        const originalGet = customElements.get;
        
        customElements.define = function(name, constructor, options) {
          const defineTime = eventTimings['node-creation'] * 2;
          if (defineTime > 0) {
            setTimeout(() => {}, defineTime);
          }
          
          // Engine-specific custom element validation
          if (domConfig.engine === 'webkit') {
            // WebKit has stricter naming requirements
            if (!name.includes('-')) {
              throw new DOMException('Custom element name must contain a hyphen', 'NotSupportedError');
            }
          }
          
          return originalDefine.call(this, name, constructor, options);
        };
        
        customElements.get = function(name) {
          const getTime = eventTimings['tree-traversal'] * 0.1;
          if (getTime > 0) {
            setTimeout(() => {}, getTime);
          }
          return originalGet.call(this, name);
        };
      }
    `;
    }
    getShadowDOMScript() {
        return `
      // Shadow DOM API override
      if (domConfig.features.shadowDOM && Element.prototype.attachShadow) {
        const originalAttachShadow = Element.prototype.attachShadow;
        
        Element.prototype.attachShadow = function(options) {
          const attachTime = eventTimings['node-creation'] * 1.5;
          if (attachTime > 0) {
            setTimeout(() => {}, attachTime);
          }
          
          // Engine-specific shadow DOM behavior
          const processedOptions = { ...options };
          
          if (domConfig.engine === 'webkit') {
            // WebKit has different default delegatesFocus behavior
            processedOptions.delegatesFocus = processedOptions.delegatesFocus || false;
          }
          
          const shadowRoot = originalAttachShadow.call(this, processedOptions);
          
          // Add engine-specific properties
          if (domConfig.engine === 'blink') {
            shadowRoot._blinkShadowId = Math.random().toString(36);
          }
          
          return shadowRoot;
        };
      }
    `;
    }
    getSelectionScript() {
        return `
      // Selection API override
      if (typeof getSelection !== 'undefined') {
        const originalGetSelection = window.getSelection;
        
        window.getSelection = function() {
          const selectionTime = eventTimings['tree-traversal'] * 0.2;
          if (selectionTime > 0) {
            setTimeout(() => {}, selectionTime);
          }
          
          const selection = originalGetSelection.call(this);
          
          // Engine-specific selection behavior
          if (selection && domConfig.engine === 'gecko') {
            // Firefox has different selection string formatting
            const originalToString = selection.toString;
            selection.toString = function() {
              const text = originalToString.call(this);
              return text.replace(/\\r\\n/g, '\\n');
            };
          }
          
          return selection;
        };
      }
    `;
    }
    getRangeScript() {
        return `
      // Range API override
      if (typeof Range !== 'undefined') {
        const originalCreateRange = document.createRange;
        
        document.createRange = function() {
          const createTime = eventTimings['node-creation'] * 0.2;
          if (createTime > 0) {
            setTimeout(() => {}, createTime);
          }
          
          const range = originalCreateRange.call(this);
          
          // Engine-specific range methods
          const originalSetStart = range.setStart;
          range.setStart = function(startNode, startOffset) {
            const setTime = eventTimings['tree-traversal'] * 0.05;
            if (setTime > 0) {
              setTimeout(() => {}, setTime);
            }
            return originalSetStart.call(this, startNode, startOffset);
          };
          
          const originalSetEnd = range.setEnd;
          range.setEnd = function(endNode, endOffset) {
            const setTime = eventTimings['tree-traversal'] * 0.05;
            if (setTime > 0) {
              setTimeout(() => {}, setTime);
            }
            return originalSetEnd.call(this, endNode, endOffset);
          };
          
          return range;
        };
      }
    `;
    }
}
exports.DOMEngineEmulator = DOMEngineEmulator;
// Predefined DOM engine configurations
exports.domEngineConfigs = {
    chrome: {
        engine: 'blink',
        version: '120.0.6099.109',
        features: {
            customElements: true,
            shadowDOM: true,
            webComponents: true,
            intersectionObserver: true,
            mutationObserver: true,
            resizeObserver: true,
            performanceObserver: true,
            adoptedStyleSheets: true
        },
        api: {
            stringifyOrder: 'insertion',
            attributeNormalization: 'strict',
            textContentBehavior: 'standard',
            nodeListType: 'live',
            documentReadyState: 'complete',
            baseURI: 'https://example.com'
        },
        events: {
            bubbling: true,
            capturing: true,
            passive: true,
            once: true,
            eventTiming: 0.01,
            customEvents: true,
            eventOrder: 'fifo'
        },
        mutations: {
            observerTiming: 0.02,
            batchSize: 100,
            throttling: true,
            subtreeModification: true,
            characterData: true,
            attributes: true,
            childList: true
        },
        traversal: {
            nodeIteratorFilter: 'show_all',
            treeWalkerFilter: 'accept',
            traversalOrder: 'document',
            whitespaceHandling: 'normalize'
        }
    },
    firefox: {
        engine: 'gecko',
        version: '120.0',
        features: {
            customElements: true,
            shadowDOM: true,
            webComponents: true,
            intersectionObserver: true,
            mutationObserver: true,
            resizeObserver: true,
            performanceObserver: false,
            adoptedStyleSheets: false
        },
        api: {
            stringifyOrder: 'alphabetical',
            attributeNormalization: 'lenient',
            textContentBehavior: 'legacy',
            nodeListType: 'live',
            documentReadyState: 'complete',
            baseURI: 'https://example.com'
        },
        events: {
            bubbling: true,
            capturing: true,
            passive: false,
            once: true,
            eventTiming: 0.015,
            customEvents: true,
            eventOrder: 'priority'
        },
        mutations: {
            observerTiming: 0.025,
            batchSize: 50,
            throttling: false,
            subtreeModification: true,
            characterData: true,
            attributes: true,
            childList: true
        },
        traversal: {
            nodeIteratorFilter: 'show_element',
            treeWalkerFilter: 'skip',
            traversalOrder: 'document',
            whitespaceHandling: 'preserve'
        }
    },
    safari: {
        engine: 'webkit',
        version: '17.1',
        features: {
            customElements: true,
            shadowDOM: true,
            webComponents: false,
            intersectionObserver: true,
            mutationObserver: true,
            resizeObserver: true,
            performanceObserver: false,
            adoptedStyleSheets: false
        },
        api: {
            stringifyOrder: 'insertion',
            attributeNormalization: 'strict',
            textContentBehavior: 'standard',
            nodeListType: 'static',
            documentReadyState: 'complete',
            baseURI: 'https://example.com'
        },
        events: {
            bubbling: true,
            capturing: true,
            passive: true,
            once: false,
            eventTiming: 0.012,
            customEvents: true,
            eventOrder: 'lifo'
        },
        mutations: {
            observerTiming: 0.03,
            batchSize: 75,
            throttling: true,
            subtreeModification: false,
            characterData: true,
            attributes: true,
            childList: true
        },
        traversal: {
            nodeIteratorFilter: 'show_all',
            treeWalkerFilter: 'accept',
            traversalOrder: 'reverse',
            whitespaceHandling: 'ignore'
        }
    }
};
//# sourceMappingURL=dom-engine.js.map