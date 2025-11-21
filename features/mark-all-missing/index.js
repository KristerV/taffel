// Mark All Missing Feature
const MarkAllMissing = {
  init() {
    // Register button with shared button injection system
    ButtonInjection.registerButton({
      id: 'mark-all-missing-btn',
      text: 'Märgi kõik puudujaks',
      className: 'tahvel-brand-button mark-all-missing-button',
      onClick: () => this.handleMarkAllMissing()
    });
  },

  async handleMarkAllMissing() {
    const btnId = 'mark-all-missing-btn';
    ButtonInjection.setButtonEnabled(btnId, false);
    ButtonInjection.updateButtonText(btnId, 'Märgin...');

    try {
      // Get all students on the current page
      const students = await MarkAllMissingAPI.getAllStudentsOnCurrentPage();

      if (students.length === 0) {
        ButtonInjection.updateButtonText(btnId, 'Õpilasi ei leitud');
        setTimeout(() => {
          ButtonInjection.updateButtonText(btnId, 'Märgi kõik puudujaks');
          ButtonInjection.setButtonEnabled(btnId, true);
        }, 2000);
        return;
      }

      // Confirm with user
      const confirmed = confirm(
        `Märgin ${students.length} õpilast puudujaks.\n\nJätkan?`
      );

      if (!confirmed) {
        ButtonInjection.updateButtonText(btnId, 'Märgi kõik puudujaks');
        ButtonInjection.setButtonEnabled(btnId, true);
        return;
      }

      // Mark each student as missing
      let markedCount = 0;
      for (const student of students) {
        if (MarkAllMissingAPI.markStudentMissing(student)) {
          markedCount++;
        }
        // Small delay between clicks to ensure proper processing
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Show success message
      ButtonInjection.updateButtonText(btnId, `✓ ${markedCount} märgitud`);

      // Reset button after 2 seconds
      setTimeout(() => {
        ButtonInjection.updateButtonText(btnId, 'Märgi kõik puudujaks');
        ButtonInjection.setButtonEnabled(btnId, true);
      }, 2000);

    } catch (error) {
      console.error('Error marking students missing:', error);
      ButtonInjection.updateButtonText(btnId, 'Viga!');

      setTimeout(() => {
        ButtonInjection.updateButtonText(btnId, 'Märgi kõik puudujaks');
        ButtonInjection.setButtonEnabled(btnId, true);
      }, 2000);
    }
  }
};
