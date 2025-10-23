// UI functions for button injection and status messages
const FillMissingLessonsUI = {
  injectButton(onClickOne, onClickAll) {
  // Check if button already exists
  if (document.getElementById('tahvel-autofill-btn')) {
    return;
  }

  // Find the main content area
  const mainContent = document.getElementById('main-content');

  if (!mainContent) {
    console.log('Tahvel Auto-Fill: Could not find main-content to inject button');
    return;
  }

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.id = 'tahvel-autofill-wrapper';
  wrapper.className = 'tahvel-autofill-wrapper';

  // Create label
  const label = document.createElement('span');
  label.textContent = 'Add missing lessons: ';
  label.style.marginRight = '0.5rem';
  label.style.fontWeight = '500';

  // Create "one" button
  const nextButton = document.createElement('button');
  nextButton.id = 'tahvel-autofill-next-btn';
  nextButton.className = 'tahvel-autofill-button';
  nextButton.textContent = 'one';
  nextButton.onclick = onClickOne;

  // Create "all" button
  const allButton = document.createElement('button');
  allButton.id = 'tahvel-autofill-all-btn';
  allButton.className = 'tahvel-autofill-button';
  allButton.textContent = 'all';
  allButton.style.marginLeft = '0.5rem';
  allButton.onclick = onClickAll;

  // Create status div
  const statusDiv = document.createElement('div');
  statusDiv.id = 'tahvel-autofill-status';
  statusDiv.className = 'tahvel-autofill-status';

  // Assemble and insert
  wrapper.appendChild(label);
  wrapper.appendChild(nextButton);
  wrapper.appendChild(allButton);
  wrapper.appendChild(statusDiv);
  mainContent.insertAdjacentElement('afterbegin', wrapper);

  console.log('Tahvel Auto-Fill: Button injected');
  },

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('tahvel-autofill-status');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `tahvel-autofill-status tahvel-autofill-${type}`;
    statusDiv.style.display = 'block';
  },

  hideStatus() {
    const statusDiv = document.getElementById('tahvel-autofill-status');
    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
  },

  setButtonsEnabled(enabled) {
    const nextButton = document.getElementById('tahvel-autofill-next-btn');
    const allButton = document.getElementById('tahvel-autofill-all-btn');

    if (nextButton) {
      nextButton.disabled = !enabled;
      nextButton.style.opacity = enabled ? '1' : '0.5';
    }
    if (allButton) {
      allButton.disabled = !enabled;
      allButton.style.opacity = enabled ? '1' : '0.5';
    }
  }
};
