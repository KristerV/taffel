// Paste Grades Feature
const PasteGrades = {
  init() {
    ButtonInjection.registerButton({
      id: 'paste-grades-btn',
      text: 'Kleebi hinded',
      className: 'tahvel-brand-button paste-grades-button',
      onClick: () => this.handlePasteGrades()
    });
  },

  handlePasteGrades() {
    PasteGradesUI.showPopup(
      (data) => this.processGrades(data),
      () => console.log('Paste grades cancelled')
    );
  },

  processGrades(text) {
    const btnId = 'paste-grades-btn';

    try {
      PasteGradesUI.setSubmitEnabled(false);
      PasteGradesUI.showStatus('Tootlen...', 'info');

      // Parse pasted data
      const gradeData = GradeParser.parse(text);

      if (gradeData.length === 0) {
        PasteGradesUI.showStatus('Ei leidnud hindeid. Formaat: email@domain.com [tab] hinne', 'error');
        PasteGradesUI.setSubmitEnabled(true);
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
      const message = `Sisestatud: ${matched}/${gradeData.length}` +
        (notFound.length > 0 ? `\nEi leitud: ${notFound.join(', ')}` : '');

      PasteGradesUI.showStatus(message, matched > 0 ? 'success' : 'error');

      ButtonInjection.updateButtonText(btnId, `${matched} sisestatud`);

      setTimeout(() => {
        PasteGradesUI.closePopup();
        ButtonInjection.updateButtonText(btnId, 'Kleebi hinded');
      }, 2000);

    } catch (error) {
      console.error('Error processing grades:', error);
      PasteGradesUI.showStatus(`Viga: ${error.message}`, 'error');
      PasteGradesUI.setSubmitEnabled(true);
    }
  }
};
