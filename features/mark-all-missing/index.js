// Mark All Missing Feature
const MarkAllMissing = {
  init() {
    // Poll for the modal every second
    setInterval(() => {
      const massGradeCell = document.querySelector('td.mass-grade[colspan="3"]');
      const existingButton = document.getElementById('mark-all-missing-btn');

      // If modal exists and button doesn't, inject it
      if (massGradeCell && !existingButton) {
        console.log('Mark-all-missing: Modal detected, injecting button');
        MarkAllMissingUI.injectButton(() => this.handleMarkAllMissing());
      }
    }, 1000);
  },

  async handleMarkAllMissing() {
    MarkAllMissingUI.setButtonEnabled(false);
    MarkAllMissingUI.updateButtonText('Märgin...');

    try {
      // Get all students on the current page
      const students = await MarkAllMissingAPI.getAllStudentsOnCurrentPage();

      if (students.length === 0) {
        MarkAllMissingUI.updateButtonText('Õpilasi ei leitud');
        setTimeout(() => {
          MarkAllMissingUI.updateButtonText('Märgi kõik puudujaks');
          MarkAllMissingUI.setButtonEnabled(true);
        }, 2000);
        return;
      }

      // Confirm with user
      const confirmed = confirm(
        `Märgin ${students.length} õpilast puudujaks.\n\nJätkan?`
      );

      if (!confirmed) {
        MarkAllMissingUI.updateButtonText('Märgi kõik puudujaks');
        MarkAllMissingUI.setButtonEnabled(true);
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
      MarkAllMissingUI.updateButtonText(`✓ ${markedCount} märgitud`);

      // Reset button after 2 seconds
      setTimeout(() => {
        MarkAllMissingUI.updateButtonText('Märgi kõik puudujaks');
        MarkAllMissingUI.setButtonEnabled(true);
      }, 2000);

    } catch (error) {
      console.error('Error marking students missing:', error);
      MarkAllMissingUI.updateButtonText('Viga!');

      setTimeout(() => {
        MarkAllMissingUI.updateButtonText('Märgi kõik puudujaks');
        MarkAllMissingUI.setButtonEnabled(true);
      }, 2000);
    }
  }
};
