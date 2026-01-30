// Navbar Buttons Feature
const NavbarButtons = {
  init() {
    TahvelUtils.onElementReady('#main-toolbar', () => {
      NavbarButtonsUI.injectButtons();
    });

    window.addEventListener('hashchange', () => {
      NavbarButtonsUI.updateActiveButton();
    });
  }
};
