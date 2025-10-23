// UI functions for Tinkr missing marker
const MarkMissingTinkrUI = {
  // Show popup with textarea for Tinkr data input
  showPopup(onSubmit, onCancel) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'tinkr-popup-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'tinkr-popup';
    popup.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    // Create content
    popup.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">
        Tinkr õpilaste andmed
      </h2>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
        Kopeeri Tinkr õpilaste nimekiri siia:
      </p>
      <textarea
        id="tinkr-data-textarea"
        placeholder="Status     Help     Email     Current Activity     Progress     Percentage&#10;Offline&#10;    —     martin.veeberg@tptlive.ee     —&#10;149/149&#10;    100%&#10;..."
        style="
          width: 100%;
          height: 250px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          resize: vertical;
          box-sizing: border-box;
        "
      ></textarea>
      <div style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
        <label style="font-size: 14px; color: #666;">
          Lubatud puuduolevaid tunde:
        </label>
        <input
          id="tinkr-threshold-input"
          type="number"
          value="3"
          min="0"
          max="50"
          style="
            width: 60px;
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          "
        />
        <span style="font-size: 13px; color: #999;">
          (kokku - X tundi)
        </span>
      </div>
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
        <button
          id="tinkr-cancel-btn"
          style="
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          "
        >
          Tühista
        </button>
        <button
          id="tinkr-submit-btn"
          style="
            padding: 8px 16px;
            border: none;
            background: #007bff;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          "
        >
          Märgi puudujaks
        </button>
      </div>
      <div id="tinkr-status" style="
        margin-top: 10px;
        padding: 10px;
        border-radius: 4px;
        font-size: 13px;
        display: none;
      "></div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Event listeners
    const textarea = document.getElementById('tinkr-data-textarea');
    const thresholdInput = document.getElementById('tinkr-threshold-input');
    const submitBtn = document.getElementById('tinkr-submit-btn');
    const cancelBtn = document.getElementById('tinkr-cancel-btn');

    submitBtn.onclick = () => {
      const data = textarea.value.trim();
      const threshold = parseInt(thresholdInput.value) || 3;

      if (data) {
        onSubmit(data, threshold);
      } else {
        this.showStatus('Palun sisesta Tinkr andmed', 'error');
      }
    };

    cancelBtn.onclick = () => {
      this.closePopup();
      if (onCancel) onCancel();
    };

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closePopup();
        if (onCancel) onCancel();
      }
    };

    // Focus textarea
    textarea.focus();
  },

  // Close popup
  closePopup() {
    const overlay = document.getElementById('tinkr-popup-overlay');
    if (overlay) {
      overlay.remove();
    }
  },

  // Show status message in popup
  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('tinkr-status');
    if (!statusDiv) return;

    const colors = {
      info: { bg: '#e3f2fd', text: '#1976d2' },
      success: { bg: '#e8f5e9', text: '#388e3c' },
      error: { bg: '#ffebee', text: '#d32f2f' },
      warning: { bg: '#fff3e0', text: '#f57c00' }
    };

    const color = colors[type] || colors.info;

    statusDiv.style.display = 'block';
    statusDiv.style.background = color.bg;
    statusDiv.style.color = color.text;
    statusDiv.textContent = message;
  },

  // Disable submit button
  setSubmitEnabled(enabled) {
    const submitBtn = document.getElementById('tinkr-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = !enabled;
      submitBtn.style.opacity = enabled ? '1' : '0.5';
      submitBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  },

  // Show results summary
  showResults(results) {
    const message = `
Kokku: ${results.total} õpilast Tahvelis
Sobivad: ${results.matched} leitud Tinkrist
Märgitud: ${results.marked} uut
Juba märgitud: ${results.skipped}
${results.notFound.length > 0 ? `\nTinkris aga mitte Tahvelis: ${results.notFound.length}` : ''}
    `.trim();

    this.showStatus(message, 'success');

    // Log details to console
    console.log('Tinkr marking results:', results);

    // Close popup after 3 seconds
    setTimeout(() => {
      this.closePopup();
    }, 3000);
  }
};
