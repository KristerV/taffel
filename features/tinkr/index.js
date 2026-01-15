// Unified Tinkr Feature - combines mark missing and paste grades
const Tinkr = {
  init() {
    ButtonInjection.registerButton({
      id: 'tinkr-btn',
      text: 'Tinkr',
      className: 'tahvel-brand-button tinkr-button',
      onClick: () => this.handleTinkr()
    });
  },

  handleTinkr() {
    TinkrUI.showMenu();
  }
};
