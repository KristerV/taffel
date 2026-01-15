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
        placeholder="Status    Email    Progress    Last 3 Days    Percentage&#10;Offline    martin.veeberg@tptlive.ee    223/224    25    100%&#10;Offline    gert.talva@tptlive.ee    174/224    0    78%&#10;..."
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
      <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="font-size: 14px; color: #666; min-width: 200px;">
            Min completion %:
          </label>
          <input
            id="tinkr-min-percentage-input"
            type="number"
            value="90"
            min="0"
            max="100"
            style="
              width: 60px;
              padding: 6px 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
            "
          />
          <span style="font-size: 13px; color: #999;">
            (below this = missing)
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="font-size: 14px; color: #666; min-width: 200px;">
            Min Lessons last 3 days:
          </label>
          <input
            id="tinkr-min-recent-input"
            type="number"
            value="5"
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
            (at least X Lessons)
          </span>
        </div>
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
    const minPercentageInput = document.getElementById('tinkr-min-percentage-input');
    const minRecentInput = document.getElementById('tinkr-min-recent-input');
    const submitBtn = document.getElementById('tinkr-submit-btn');
    const cancelBtn = document.getElementById('tinkr-cancel-btn');

    submitBtn.onclick = () => {
      const data = textarea.value.trim();
      const minPercentage = parseInt(minPercentageInput.value) || 90;
      const minRecent = parseInt(minRecentInput.value) || 5;

      if (data) {
        onSubmit(data, minPercentage, minRecent);
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
${results.notInTinkr.length > 0 ? `\nTahvelis aga mitte Tinkris: ${results.notInTinkr.length}` : ''}
${results.notFound.length > 0 ? `\nTinkris aga mitte Tahvelis: ${results.notFound.length}` : ''}
    `.trim();

    this.showStatus(message, 'success');

    // Log details to console
    console.log('Tinkr marking results:', results);
    if (results.notInTinkr.length > 0) {
      console.log('Students in Tahvel but not in Tinkr:', results.notInTinkr);
    }
    if (results.notFound.length > 0) {
      console.log('Students in Tinkr but not in Tahvel:', results.notFound);
    }

    // Close popup after 3 seconds
    setTimeout(() => {
      this.closePopup();
    }, 3000);
  }
};
