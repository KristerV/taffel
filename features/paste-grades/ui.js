// UI for paste grades feature
const PasteGradesUI = {
  showPopup(onSubmit, onCancel) {
    const overlay = document.createElement('div');
    overlay.id = 'paste-grades-overlay';
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

    const popup = document.createElement('div');
    popup.id = 'paste-grades-popup';
    popup.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    popup.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">
        Kleebi hinded
      </h2>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
        Kleebi email + hinne paarid (tab-eraldatud):
      </p>
      <textarea
        id="paste-grades-textarea"
        placeholder="email@example.com&#9;5&#10;another@example.com&#9;4&#10;..."
        style="
          width: 100%;
          height: 200px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          resize: vertical;
          box-sizing: border-box;
        "
      ></textarea>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
        Hinded: 1, 2, 3, 4, 5, A, MA, X
      </p>
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="paste-grades-cancel-btn" style="
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Tuhista</button>
        <button id="paste-grades-submit-btn" style="
          padding: 8px 16px;
          border: none;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Sisesta hinded</button>
      </div>
      <div id="paste-grades-status" style="
        margin-top: 10px;
        padding: 10px;
        border-radius: 4px;
        font-size: 13px;
        display: none;
      "></div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const textarea = document.getElementById('paste-grades-textarea');
    const submitBtn = document.getElementById('paste-grades-submit-btn');
    const cancelBtn = document.getElementById('paste-grades-cancel-btn');

    submitBtn.onclick = () => {
      const data = textarea.value.trim();
      if (data) {
        onSubmit(data);
      } else {
        this.showStatus('Palun kleebi hinded', 'error');
      }
    };

    cancelBtn.onclick = () => {
      this.closePopup();
      if (onCancel) onCancel();
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closePopup();
        if (onCancel) onCancel();
      }
    };

    textarea.focus();
  },

  closePopup() {
    const overlay = document.getElementById('paste-grades-overlay');
    if (overlay) overlay.remove();
  },

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('paste-grades-status');
    if (!statusDiv) return;

    const colors = {
      info: { bg: '#e3f2fd', text: '#1976d2' },
      success: { bg: '#e8f5e9', text: '#388e3c' },
      error: { bg: '#ffebee', text: '#d32f2f' }
    };

    const color = colors[type] || colors.info;
    statusDiv.style.display = 'block';
    statusDiv.style.background = color.bg;
    statusDiv.style.color = color.text;
    statusDiv.textContent = message;
  },

  setSubmitEnabled(enabled) {
    const btn = document.getElementById('paste-grades-submit-btn');
    if (btn) {
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.5';
    }
  }
};
