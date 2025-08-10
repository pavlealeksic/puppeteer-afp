/**
 * Global cleanup manager for interval/timeout cleanup in injected scripts
 * This prevents memory leaks from setInterval calls in browser context
 */

export function getCleanupManagerScript(): string {
  return `
    // Global cleanup manager for injected scripts
    window.__afpCleanupManager = {
      intervals: new Set(),
      timeouts: new Set(),
      
      // Register interval for cleanup
      addInterval: function(intervalId) {
        this.intervals.add(intervalId);
        return intervalId;
      },
      
      // Register timeout for cleanup
      addTimeout: function(timeoutId) {
        this.timeouts.add(timeoutId);
        return timeoutId;
      },
      
      // Clear all registered intervals and timeouts
      cleanup: function() {
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.clear();
        this.timeouts.clear();
      },
      
      // Safe setInterval wrapper
      setInterval: function(callback, delay, ...args) {
        const id = setInterval(callback, delay, ...args);
        return this.addInterval(id);
      },
      
      // Safe setTimeout wrapper
      setTimeout: function(callback, delay, ...args) {
        const id = setTimeout(callback, delay, ...args);
        return this.addTimeout(id);
      }
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
      if (window.__afpCleanupManager) {
        window.__afpCleanupManager.cleanup();
      }
    });
    
    // Cleanup on visibility change (tab switching)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && window.__afpCleanupManager) {
        window.__afpCleanupManager.cleanup();
      }
    });
  `;
}

export function wrapSetIntervalCalls(script: string): string {
  // Replace setInterval calls with managed versions
  return script
    .replace(/setInterval\s*\(/g, 'window.__afpCleanupManager.setInterval(')
    .replace(/setTimeout\s*\(/g, 'window.__afpCleanupManager.setTimeout(');
}