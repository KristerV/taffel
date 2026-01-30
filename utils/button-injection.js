// Shared utility for injecting buttons into the mass-grade modal
const ButtonInjection = {
  buttons: [],
  initialized: false,

  registerButton(config) {
    if (this.buttons.some(btn => btn.id === config.id)) return;
    this.buttons.push(config);

    // Try to inject immediately if already watching
    if (this.initialized) {
      this.tryInject();
    }
  },

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Watch for mass-grade cell continuously (modal can open/close)
    TahvelUtils.onElementReady('td.mass-grade[colspan="3"]', () => {
      this.tryInject();
    }, { timeout: 0, continuous: true });
  },

  tryInject() {
    const massGradeCell = document.querySelector('td.mass-grade[colspan="3"]');
    if (!massGradeCell) return;
    if (this.buttons.length === 0) return;

    const hasInjected = this.buttons.every(btn => document.getElementById(btn.id));
    if (hasInjected) return;

    this.injectAllButtons(massGradeCell);
  },

  injectAllButtons(massGradeCell) {
    massGradeCell.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';

    this.buttons.forEach(config => {
      const button = document.createElement('button');
      button.id = config.id;
      button.className = config.className;
      button.textContent = config.text;
      button.onclick = config.onClick;
      wrapper.appendChild(button);
    });

    massGradeCell.appendChild(wrapper);
  },

  updateButtonText(buttonId, text) {
    const button = document.getElementById(buttonId);
    if (button) button.textContent = text;
  },

  setButtonEnabled(buttonId, enabled) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? '1' : '0.5';
    }
  }
};
