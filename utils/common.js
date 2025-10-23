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
  }
};
