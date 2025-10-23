// Extract journal ID from URL
export function getJournalId() {
  const match = window.location.hash.match(/\/journal\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Get XSRF token from cookies
export function getXSRFToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}

// Check if we're on a journal edit page
export function isJournalEditPage() {
  return window.location.hash.includes('/journal/') && window.location.hash.includes('/edit');
}
