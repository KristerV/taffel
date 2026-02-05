// Final Grade Feature - Calculate and fill final grades based on averages
const FinalGrade = {
  init() {
    ButtonInjection.registerButton({
      id: 'final-grade-btn',
      text: 'Lõpphinne',
      className: 'tahvel-brand-button',
      onClick: () => this.handleCalculate()
    });
  },

  handleCalculate() {
    const btnId = 'final-grade-btn';

    try {
      ButtonInjection.setButtonEnabled(btnId, false);
      ButtonInjection.updateButtonText(btnId, 'Arvutan...');

      // Extract grades from the table
      const studentGrades = FinalGradeCalculator.extractGrades();

      // Find student rows in the modal
      const modalRows = document.querySelectorAll('tbody[formarrayname="students"] tr');
      let filled = 0;
      let skipped = 0;

      modalRows.forEach(row => {
        const nameSpan = row.querySelector('.student-cell span span:first-child');
        if (!nameSpan) return;

        const studentName = nameSpan.textContent.trim();
        const grades = studentGrades[studentName];

        if (!grades) {
          skipped++;
          return;
        }

        const result = FinalGradeCalculator.calculateFinal(grades);

        if (result.skip) {
          skipped++;
          return;
        }

        // Find the grade select and set value
        const select = row.querySelector('select.grade-select');
        if (!select) {
          skipped++;
          return;
        }

        const selectValue = GradeParser.getSelectValue(result.grade);
        if (selectValue) {
          select.value = selectValue;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        } else {
          skipped++;
        }
      });

      // Show result
      ButtonInjection.updateButtonText(btnId, `✓ ${filled} täidetud`);

      setTimeout(() => {
        ButtonInjection.updateButtonText(btnId, 'Lõpphinne');
        ButtonInjection.setButtonEnabled(btnId, true);
      }, 3000);

    } catch (error) {
      console.error('Error calculating final grades:', error);
      ButtonInjection.updateButtonText(btnId, 'Viga!');

      setTimeout(() => {
        ButtonInjection.updateButtonText(btnId, 'Lõpphinne');
        ButtonInjection.setButtonEnabled(btnId, true);
      }, 3000);
    }
  }
};
