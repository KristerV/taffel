// Shared utility for injecting buttons into the mass-grade modal
const ButtonInjection = {
  // Registry of buttons to inject
  buttons: [],

  // Register a new button
  registerButton(config) {
    // config = { id, text, className, onClick }
    this.buttons.push(config);
  },

  // Poll for modal and inject all registered buttons
  init() {
    setInterval(() => {
      const massGradeCell = document.querySelector('td.mass-grade[colspan="3"]');

      if (!massGradeCell) return;

      // Check if we've already injected buttons
      const hasInjected = this.buttons.every(btn => document.getElementById(btn.id));

      if (hasInjected) return;

      // Clear cell and inject all buttons
      this.injectAllButtons(massGradeCell);
    }, 200);
  },

  // Inject all registered buttons
  injectAllButtons(massGradeCell) {
    // Clear the cell
    massGradeCell.innerHTML = '';

    // Create wrapper with gap
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';

    // Create and append each button
    this.buttons.forEach(config => {
      const button = document.createElement('button');
      button.id = config.id;
      button.className = config.className;
      button.textContent = config.text;
      button.onclick = config.onClick;

      wrapper.appendChild(button);
    });

    massGradeCell.appendChild(wrapper);
    console.log(`ButtonInjection: Injected ${this.buttons.length} buttons`);
  },

  // Helper to update button text
  updateButtonText(buttonId, text) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.textContent = text;
    }
  },

  // Helper to enable/disable button
  setButtonEnabled(buttonId, enabled) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? '1' : '0.5';
    }
  }
};
