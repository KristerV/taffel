// Tahvel Auto-Fill Extension - Content Script
// Main entry point that initializes all features

(function() {
  'use strict';

  // Array of features to initialize
  const features = [
    {
      name: 'navbar-buttons',
      shouldInit: () => true, // Always show navbar buttons
      init: () => NavbarButtons.init()
    },
    {
      name: 'button-injection',
      shouldInit: () => TahvelUtils.isJournalEditPage(),
      init: () => ButtonInjection.init()
    },
    {
      name: 'fill-missing-lessons',
      shouldInit: () => TahvelUtils.isJournalEditPage(),
      init: () => FillMissingLessons.init()
    },
    {
      name: 'mark-all-missing',
      shouldInit: () => TahvelUtils.isJournalEditPage(),
      init: () => MarkAllMissing.init()
    },
    {
      name: 'tinkr',
      shouldInit: () => TahvelUtils.isJournalEditPage(),
      init: () => Tinkr.init()
    }
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
})();
