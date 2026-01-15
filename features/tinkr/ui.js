// Unified Tinkr UI
const TinkrUI = {
  currentMode: null,

  // Show menu with tool options
  showMenu() {
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

    const popup = document.createElement('div');
    popup.id = 'tinkr-popup';
    popup.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      width: 90%;
    `;

    popup.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">
        Tinkr
      </h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="tinkr-menu-missing" class="tahvel-brand-button" style="
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          text-align: left;
        ">Märgi puudujad</button>
        <button id="tinkr-menu-grades" class="tahvel-brand-button" style="
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          text-align: left;
        ">Eksami hinded</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('tinkr-menu-missing').onclick = () => {
      this.closePopup();
      this.showToolPopup('missing');
    };

    document.getElementById('tinkr-menu-grades').onclick = () => {
      this.closePopup();
      this.showToolPopup('grades');
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closePopup();
      }
    };
  },

  // Show the actual tool popup
  showToolPopup(mode) {
    this.currentMode = mode;

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

    const title = mode === 'missing' ? 'Märgi puudujad' : 'Eksami hinded';
    const submitText = mode === 'missing' ? 'Märgi puudujaks' : 'Sisesta hinded';

    let contentHtml = '';
    if (mode === 'missing') {
      contentHtml = `
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          Kopeeri Tinkr õpilaste nimekiri siia:
        </p>
        <textarea
          id="tinkr-data-textarea"
          placeholder="Status    Email    Progress    Last 3 Days    Percentage&#10;Offline    martin.veeberg@tptlive.ee    223/224    25    100%&#10;..."
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
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 14px; color: #666; min-width: 180px;">Min completion %:</label>
            <input id="tinkr-min-percentage-input" type="number" value="90" min="0" max="100" style="
              width: 60px;
              padding: 6px 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
            "/>
            <span style="font-size: 13px; color: #999;">(below = missing)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 14px; color: #666; min-width: 180px;">Min lessons last 3 days:</label>
            <input id="tinkr-min-recent-input" type="number" value="5" min="0" max="50" style="
              width: 60px;
              padding: 6px 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
            "/>
            <span style="font-size: 13px; color: #999;">(at least X)</span>
          </div>
        </div>
      `;
    } else if (mode === 'grades') {
      contentHtml = `
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          Kleebi Tinkr eksami tulemused (email + hinne, tab-eraldatud):
        </p>
        <textarea
          id="tinkr-data-textarea"
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
      `;
    }

    popup.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">
        ${title}
      </h2>
      <div id="tinkr-mode-content">${contentHtml}</div>
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="tinkr-cancel-btn" style="
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Tühista</button>
        <button id="tinkr-submit-btn" style="
          padding: 8px 16px;
          border: none;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">${submitText}</button>
      </div>
      <div id="tinkr-status" style="
        margin-top: 10px;
        padding: 10px;
        border-radius: 4px;
        font-size: 13px;
        display: none;
        max-height: 400px;
        overflow-y: auto;
      "></div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('tinkr-cancel-btn').onclick = () => this.closePopup();
    document.getElementById('tinkr-submit-btn').onclick = () => this.handleSubmit();

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closePopup();
      }
    };

    // Focus textarea
    const textarea = document.getElementById('tinkr-data-textarea');
    if (textarea) textarea.focus();
  },

  handleSubmit() {
    const textarea = document.getElementById('tinkr-data-textarea');
    const data = textarea ? textarea.value.trim() : '';

    if (!data) {
      this.showStatus('Palun sisesta andmed', 'error');
      return;
    }

    if (this.currentMode === 'missing') {
      this.processMissing(data);
    } else if (this.currentMode === 'grades') {
      this.processGrades(data);
    }
  },

  async processMissing(tinkrText) {
    try {
      this.setSubmitEnabled(false);
      this.showStatus('Töötlen andmeid...', 'info');

      const minPercentage = parseInt(document.getElementById('tinkr-min-percentage-input').value) || 90;
      const minRecent = parseInt(document.getElementById('tinkr-min-recent-input').value) || 5;

      // Parse Tinkr data
      const students = TinkrParser.parse(tinkrText);

      // Validate
      const validation = TinkrParser.validate(students);
      if (!validation.valid) {
        this.showStatus(`Viga: ${validation.errors.join(', ')}`, 'error');
        this.setSubmitEnabled(true);
        return;
      }

      // Show parsing results
      const toMark = TinkrParser.filterShouldBeMarkedMissing(students, minPercentage, minRecent);
      this.showStatus(`Leitud ${students.length} õpilast, neist ${toMark.length} tuleb märkida puudujaks. Märgin...`, 'info');

      // Match and mark students
      const results = await MarkMissingTinkrAPI.matchAndMarkStudents(
        students,
        minPercentage,
        minRecent,
        (progress) => {
          this.showStatus(`Märgitud ${progress.marked}/${progress.matched} sobivat õpilast...`, 'info');
        }
      );

      // Show results
      this.showMissingResults(results);

    } catch (error) {
      console.error('Error processing Tinkr data:', error);
      this.showStatus(`Viga: ${error.message}`, 'error');
      this.setSubmitEnabled(true);
    }
  },

  processGrades(text) {
    try {
      this.setSubmitEnabled(false);
      this.showStatus('Töötlen...', 'info');

      // Parse pasted data
      const gradeData = GradeParser.parse(text);

      if (gradeData.length === 0) {
        this.showStatus('Ei leidnud hindeid. Formaat: email@domain.com [tab] hinne', 'error');
        this.setSubmitEnabled(true);
        return;
      }

      // Get student rows from the table
      const rows = document.querySelectorAll('tbody tr');
      let matched = 0;
      let notFound = [];

      // For each grade entry, find matching student and set grade
      for (const { email, grade } of gradeData) {
        let found = false;

        for (const row of rows) {
          const nameCell = row.querySelector('.student-cell span span');
          if (!nameCell) continue;

          const studentName = nameCell.textContent.trim();

          // Use TinkrMatcher for fuzzy matching
          const matchResult = TinkrMatcher.matchStudent(studentName, email, 80);

          if (matchResult.matched) {
            // Find the grade select in this row
            const select = row.querySelector('select.grade-select');
            if (select) {
              const selectValue = GradeParser.getSelectValue(grade);
              if (selectValue) {
                select.value = selectValue;
                // Trigger change event for Angular
                select.dispatchEvent(new Event('change', { bubbles: true }));
                matched++;
                found = true;
                console.log(`Set grade ${grade} for ${studentName} (${email})`);
              }
            }
            break;
          }
        }

        if (!found) {
          notFound.push(email);
        }
      }

      // Show results
      let html = `
        <div style="margin-bottom: 8px;">
          <strong>Tulemused:</strong><br>
          Sisestatud: ${matched}/${gradeData.length}
        </div>
      `;

      if (notFound.length > 0) {
        html += `
          <div style="margin-top: 10px; padding: 8px; background: #fff3e0; border-radius: 4px;">
            <strong style="color: #f57c00;">Ei leitud (${notFound.length}):</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px;">
              ${notFound.map(e => `<li>${e}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      const statusDiv = document.getElementById('tinkr-status');
      statusDiv.style.display = 'block';
      statusDiv.style.background = matched > 0 ? '#e8f5e9' : '#ffebee';
      statusDiv.style.color = '#333';
      statusDiv.innerHTML = html;

      this.showCloseButton();

    } catch (error) {
      console.error('Error processing grades:', error);
      this.showStatus(`Viga: ${error.message}`, 'error');
      this.setSubmitEnabled(true);
    }
  },

  showMissingResults(results) {
    const statusDiv = document.getElementById('tinkr-status');
    if (!statusDiv) return;

    let html = `
      <div style="margin-bottom: 8px;">
        <strong>Tulemused:</strong><br>
        Kokku: ${results.total} õpilast Tahvelis<br>
        Märgitud puudujaks: ${results.marked}<br>
        Juba märgitud: ${results.skipped}
      </div>
    `;

    // Show all matches log
    if (results.allMatches && results.allMatches.length > 0) {
      html += `
        <div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
          <strong>Kõik õpilased:</strong>
          <table style="width: 100%; margin-top: 8px; font-size: 11px; font-family: monospace; border-collapse: collapse;">
            <tr style="text-align: left; border-bottom: 1px solid #ddd;">
              <th style="padding: 4px;">Nimi</th>
              <th style="padding: 4px;">Lühend</th>
              <th style="padding: 4px;">Tinkr lühend</th>
            </tr>
            ${results.allMatches.map(m => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 4px;">${m.tahvelName.split(',')[0].trim()}</td>
                <td style="padding: 4px;">${m.tahvelShortname}</td>
                <td style="padding: 4px;">${m.matched
                  ? m.tinkrShortname
                  : '<span style="color: #d32f2f; font-weight: bold;">[no match]</span>'
                }</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }

    // Show students not in Tahvel
    if (results.notFound.length > 0) {
      html += `
        <div style="margin-top: 10px; padding: 8px; background: #e3f2fd; border-radius: 4px;">
          <strong style="color: #1976d2;">Tinkris, aga mitte Tahvelis (${results.notFound.length}):</strong>
          <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px;">
            ${results.notFound.map(s => `<li>${s.email} (${s.progress})</li>`).join('')}
          </ul>
        </div>
      `;
    }

    statusDiv.style.display = 'block';
    statusDiv.style.background = '#e8f5e9';
    statusDiv.style.color = '#333';
    statusDiv.innerHTML = html;

    this.showCloseButton();
    console.log('Tinkr marking results:', results);
  },

  showCloseButton() {
    const cancelBtn = document.getElementById('tinkr-cancel-btn');
    if (cancelBtn) cancelBtn.textContent = 'Sulge';

    const submitBtn = document.getElementById('tinkr-submit-btn');
    if (submitBtn) submitBtn.style.display = 'none';

    const modeSelect = document.getElementById('tinkr-mode-select');
    if (modeSelect) modeSelect.disabled = true;
  },

  closePopup() {
    const overlay = document.getElementById('tinkr-popup-overlay');
    if (overlay) overlay.remove();
  },

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

  setSubmitEnabled(enabled) {
    const submitBtn = document.getElementById('tinkr-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = !enabled;
      submitBtn.style.opacity = enabled ? '1' : '0.5';
      submitBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  }
};
