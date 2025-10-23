// Tahvel Auto-Fill Extension - Content Script
// Main entry point that initializes all features

import { isJournalEditPage } from './utils/common.js';
import * as FillMissingLessons from './features/fill-missing-lessons/index.js';

// Array of features to initialize
const features = [
  {
    name: 'fill-missing-lessons',
    shouldInit: isJournalEditPage,
    init: FillMissingLessons.init
  }
  // Add more features here as they are developed
];

// Initialize all features
function initializeFeatures() {
  features.forEach(feature => {
    if (feature.shouldInit()) {
      console.log(`Initializing feature: ${feature.name}`);
      feature.init();
    }
  });
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
  initializeFeatures();
}

// Re-initialize on hash change (SPA navigation)
window.addEventListener('hashchange', () => {
  setTimeout(initializeFeatures, 500);
});
