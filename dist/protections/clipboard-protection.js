"use strict";
/**
 * Clipboard & Selection API Protection
 * Provides comprehensive protection against clipboard-based fingerprinting techniques
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClipboardProtection = void 0;
class ClipboardProtection {
    static getClipboardAPIProtection() {
        return `
      // Clipboard API Fingerprinting Protection
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const originalRead = navigator.clipboard.read;
        const originalReadText = navigator.clipboard.readText;
        const originalWrite = navigator.clipboard.write;
        const originalWriteText = navigator.clipboard.writeText;
        
        // Override clipboard read operations
        navigator.clipboard.read = async function() {
          try {
            // Check permissions first and normalize behavior
            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' });
            if (permissionStatus.state === 'denied') {
              throw new DOMException('Read access denied', 'NotAllowedError');
            }
            
            // Add consistent timing to prevent fingerprinting via timing attacks
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 50));
            
            const result = await originalRead.call(this);
            
            // Normalize clipboard item characteristics
            if (result && Array.isArray(result)) {
              return result.map(item => ({
                types: item.types.filter(type => 
                  ['text/plain', 'text/html', 'image/png'].includes(type)
                ), // Only expose common types
                getType: item.getType.bind(item)
              }));
            }
            
            return result;
          } catch (error) {
            // Normalize error messages
            if (error.name === 'NotAllowedError') {
              throw new DOMException('Clipboard access denied', 'NotAllowedError');
            }
            throw new DOMException('Clipboard read failed', 'DataError');
          }
        };
        
        navigator.clipboard.readText = async function() {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' });
            if (permissionStatus.state === 'denied') {
              throw new DOMException('Read access denied', 'NotAllowedError');
            }
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5 + 25));
            
            return await originalReadText.call(this);
          } catch (error) {
            throw new DOMException('Clipboard text read failed', 'NotAllowedError');
          }
        };
        
        // Override clipboard write operations
        navigator.clipboard.write = async function(data) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' });
            if (permissionStatus.state === 'denied') {
              throw new DOMException('Write access denied', 'NotAllowedError');
            }
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 8 + 30));
            
            return await originalWrite.call(this, data);
          } catch (error) {
            throw new DOMException('Clipboard write failed', 'DataError');
          }
        };
        
        navigator.clipboard.writeText = async function(data) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' });
            if (permissionStatus.state === 'denied') {
              throw new DOMException('Write access denied', 'NotAllowedError');
            }
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 3 + 15));
            
            return await originalWriteText.call(this, data);
          } catch (error) {
            throw new DOMException('Clipboard text write failed', 'DataError');
          }
        };
      }
    `;
    }
    static getSelectionAPIProtection() {
        return `
      // Selection API Fingerprinting Protection
      if (typeof Selection !== 'undefined' && typeof document !== 'undefined') {
        const originalGetSelection = document.getSelection;
        
        document.getSelection = function() {
          const selection = originalGetSelection.call(this);
          
          if (selection) {
            // Create a proxy to normalize selection behavior
            return new Proxy(selection, {
              get: function(target, property) {
                if (property === 'type') {
                  // Normalize selection type to prevent fingerprinting
                  const actualType = target.type;
                  if (actualType === 'Caret') return 'None'; // Hide caret position
                  return actualType;
                }
                
                if (property === 'toString') {
                  return function() {
                    // Normalize text extraction
                    const text = target.toString();
                    // Remove extra whitespace that might vary between browsers
                    return text.replace(/\\s+/g, ' ').trim();
                  };
                }
                
                if (property === 'getRangeAt') {
                  return function(index) {
                    const range = target.getRangeAt(index);
                    
                    // Create normalized range proxy
                    return new Proxy(range, {
                      get: function(rangeTarget, rangeProp) {
                        if (rangeProp === 'getClientRects' || rangeProp === 'getBoundingClientRect') {
                          return function() {
                            const rects = rangeTarget[rangeProp]();
                            
                            // Normalize rectangle measurements
                            if (rangeProp === 'getBoundingClientRect') {
                              return {
                                x: Math.round(rects.x),
                                y: Math.round(rects.y),
                                width: Math.round(rects.width),
                                height: Math.round(rects.height),
                                top: Math.round(rects.top),
                                right: Math.round(rects.right),
                                bottom: Math.round(rects.bottom),
                                left: Math.round(rects.left),
                                toJSON: rects.toJSON?.bind(rects)
                              };
                            }
                            
                            // For getClientRects, normalize each rectangle
                            return Array.from(rects).map(rect => ({
                              x: Math.round(rect.x),
                              y: Math.round(rect.y),
                              width: Math.round(rect.width),
                              height: Math.round(rect.height),
                              top: Math.round(rect.top),
                              right: Math.round(rect.right),
                              bottom: Math.round(rect.bottom),
                              left: Math.round(rect.left)
                            }));
                          };
                        }
                        
                        return rangeTarget[rangeProp];
                      }
                    });
                  };
                }
                
                return target[property];
              }
            });
          }
          
          return selection;
        };
        
        // Override window.getSelection as well
        if (typeof window !== 'undefined') {
          const originalWindowGetSelection = window.getSelection;
          window.getSelection = function() {
            return document.getSelection();
          };
        }
      }
    `;
    }
    static getExecCommandProtection() {
        return `
      // Document.execCommand Protection
      if (typeof document !== 'undefined' && document.execCommand) {
        const originalExecCommand = document.execCommand;
        
        document.execCommand = function(command, showDefaultUI, value) {
          // Normalize execCommand behavior across browsers
          const normalizedCommands = {
            'copy': 'copy',
            'cut': 'cut',
            'paste': 'paste',
            'selectAll': 'selectAll',
            'delete': 'delete',
            'forwardDelete': 'delete',
            'backColor': 'backColor',
            'foreColor': 'foreColor',
            'bold': 'bold',
            'italic': 'italic',
            'underline': 'underline',
            'strikeThrough': 'strikeThrough',
            'insertText': 'insertText',
            'insertHTML': 'insertHTML'
          };
          
          const normalizedCommand = normalizedCommands[command] || command;
          
          try {
            // Add consistent timing to prevent fingerprinting via command execution speed
            const start = performance.now();
            const result = originalExecCommand.call(this, normalizedCommand, showDefaultUI, value);
            const duration = performance.now() - start;
            
            // Ensure minimum execution time for consistency
            if (duration < 1) {
              const delay = 1 - duration + Math.random() * 2; // 1-3ms delay
              const endTime = performance.now() + delay;
              while (performance.now() < endTime) {
                // Busy wait for precise timing
              }
            }
            
            return result;
          } catch (error) {
            // Normalize error handling
            return false;
          }
        };
        
        // Override queryCommandEnabled to normalize capabilities
        const originalQueryCommandEnabled = document.queryCommandEnabled;
        document.queryCommandEnabled = function(command) {
          const enabledCommands = [
            'copy', 'cut', 'paste', 'selectAll', 'delete',
            'bold', 'italic', 'underline', 'insertText'
          ];
          
          if (enabledCommands.includes(command)) {
            return originalQueryCommandEnabled.call(this, command);
          }
          
          return false; // Disable uncommon commands
        };
        
        // Override queryCommandSupported to normalize support detection
        const originalQueryCommandSupported = document.queryCommandSupported;
        document.queryCommandSupported = function(command) {
          const supportedCommands = [
            'copy', 'cut', 'paste', 'selectAll', 'delete',
            'bold', 'italic', 'underline', 'insertText', 'insertHTML'
          ];
          
          return supportedCommands.includes(command);
        };
      }
    `;
    }
    static getPasteEventProtection() {
        return `
      // Paste Event Fingerprinting Protection
      if (typeof document !== 'undefined') {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'paste' && typeof listener === 'function') {
            const normalizedListener = function(event) {
              // Normalize clipboard data access
              if (event.clipboardData) {
                const originalGetData = event.clipboardData.getData;
                const originalTypes = event.clipboardData.types;
                
                // Override getData to normalize format support
                event.clipboardData.getData = function(format) {
                  const normalizedFormats = {
                    'text/plain': 'text/plain',
                    'text': 'text/plain',
                    'Text': 'text/plain',
                    'text/html': 'text/html',
                    'text/uri-list': 'text/uri-list'
                  };
                  
                  const normalizedFormat = normalizedFormats[format] || format;
                  
                  // Only allow common formats
                  if (!Object.values(normalizedFormats).includes(normalizedFormat)) {
                    return '';
                  }
                  
                  return originalGetData.call(this, normalizedFormat);
                };
                
                // Override types property to only show common types
                Object.defineProperty(event.clipboardData, 'types', {
                  get: function() {
                    const actualTypes = Array.from(originalTypes);
                    const allowedTypes = ['text/plain', 'text/html'];
                    return actualTypes.filter(type => allowedTypes.includes(type));
                  },
                  configurable: true
                });
              }
              
              return listener.call(this, event);
            };
            
            return originalAddEventListener.call(this, type, normalizedListener, options);
          }
          
          return originalAddEventListener.call(this, type, listener, options);
        };
      }
    `;
    }
    static getAllClipboardProtections() {
        return `
      ${this.getClipboardAPIProtection()}
      ${this.getSelectionAPIProtection()}
      ${this.getExecCommandProtection()}
      ${this.getPasteEventProtection()}
    `;
    }
}
exports.ClipboardProtection = ClipboardProtection;
//# sourceMappingURL=clipboard-protection.js.map