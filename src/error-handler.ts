/**
 * Production-ready error handling for injection scripts
 */

export function getErrorHandlerScript(enableLogging: boolean = false): string {
  return `
    // Global error handler for injection scripts
    window.__afpErrorHandler = {
      errors: [],
      maxErrors: 100, // Prevent memory leaks from too many errors
      
      // Handle errors gracefully
      handle: function(error, context = 'unknown') {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          context: context,
          timestamp: Date.now(),
          stack: error?.stack?.substring(0, 200) // Limit stack size
        };
        
        // Store error (with size limit)
        if (this.errors.length >= this.maxErrors) {
          this.errors.shift(); // Remove oldest error
        }
        this.errors.push(errorInfo);
        
        ${enableLogging ? `
        // Only log in development/debug mode
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('AFP Error:', errorInfo);
        }
        ` : ''}
        
        return null; // Safe fallback
      },
      
      // Get error statistics (for debugging)
      getStats: function() {
        const contextCounts = {};
        this.errors.forEach(error => {
          contextCounts[error.context] = (contextCounts[error.context] || 0) + 1;
        });
        
        return {
          totalErrors: this.errors.length,
          contexts: contextCounts,
          recentErrors: this.errors.slice(-5) // Last 5 errors
        };
      }
    };
    
    // Global error event handler
    window.addEventListener('error', function(event) {
      if (window.__afpErrorHandler) {
        window.__afpErrorHandler.handle(event.error, 'global');
      }
    });
  `;
}

// Safe wrapper for operations that might fail
export function wrapWithErrorHandling(script: string, context: string): string {
  return `
    try {
      ${script}
    } catch (error) {
      if (window.__afpErrorHandler) {
        window.__afpErrorHandler.handle(error, '${context}');
      }
    }
  `;
}