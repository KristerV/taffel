// Navbar Buttons Feature
// Adds quick navigation buttons to the main navbar
const NavbarButtons = {
  init() {
    // Poll for navbar and inject buttons
    const pollInterval = setInterval(() => {
      const toolbar = document.querySelector('#main-toolbar');

      if (toolbar) {
        NavbarButtonsUI.injectButtons();
        clearInterval(pollInterval);
      }
    }, 500);

    // Clear interval after 10 seconds to prevent infinite polling
    setTimeout(() => clearInterval(pollInterval), 10000);

    // Update active button on hash change
    window.addEventListener('hashchange', () => {
      NavbarButtonsUI.updateActiveButton();
    });

    console.log('NavbarButtons: Feature initialized');
  }
};
