// Common utility functions
const TahvelUtils = {
  // Extract journal ID from URL
  getJournalId() {
    const match = window.location.hash.match(/\/journal\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  },

  // Get XSRF token from cookies
  getXSRFToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  },

  // Check if we're on a journal edit page
  isJournalEditPage() {
    return window.location.hash.includes('/journal/') && window.location.hash.includes('/edit');
  },

  // Watch for element and call callback when found
  // Uses MutationObserver for instant response (setInterval gets blocked by heavy JS)
  onElementReady(selector, callback, options = {}) {
    const { timeout = 10000, continuous = false } = options;

    // Try immediately
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
      if (!continuous) return null;
    }

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        callback(el);
        if (!continuous) {
          observer.disconnect();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Optional timeout
    if (timeout > 0) {
      setTimeout(() => observer.disconnect(), timeout);
    }

    return observer;
  }
};
