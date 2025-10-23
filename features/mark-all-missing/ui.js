// UI functions for button injection
const MarkAllMissingUI = {
  injectButton(onClick) {
    // Find the mass-grade cell
    const massGradeCell = document.querySelector('td.mass-grade[colspan="3"]');

    if (!massGradeCell) {
      console.log('Mark-all-missing: Could not find mass-grade cell');
      return false;
    }

    // Check if button already exists
    if (document.getElementById('mark-all-missing-btn')) {
      return false;
    }

    // Clear the cell content
    massGradeCell.innerHTML = '';

    // Create button
    const button = document.createElement('button');
    button.id = 'mark-all-missing-btn';
    button.className = 'mark-all-missing-button';
    button.textContent = 'Märgi kõik puudujaks';
    button.onclick = onClick;

    // Insert button
    massGradeCell.appendChild(button);

    console.log('Mark-all-missing: Button injected');
    return true;
  },

  setButtonEnabled(enabled) {
    const button = document.getElementById('mark-all-missing-btn');
    if (button) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? '1' : '0.5';
    }
  },

  updateButtonText(text) {
    const button = document.getElementById('mark-all-missing-btn');
    if (button) {
      button.textContent = text;
    }
  }
};
