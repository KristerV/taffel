// API functions for marking students missing
const MarkAllMissingAPI = {
  async getCurrentPageStudents() {
    // Get all student rows from the current page
    const studentRows = document.querySelectorAll('tbody[formArrayName="students"] tr');
    const students = [];

    studentRows.forEach((row, index) => {
      const studentNameCell = row.querySelector('td:nth-child(2) span');
      if (studentNameCell) {
        // Find the "P" (absenceWithoutReason) checkbox button
        const checkbox = row.querySelector('checkbox[formcontrolname="absenceWithoutReason"] button');
        students.push({
          index,
          name: studentNameCell.textContent.trim(),
          checkbox,
          row
        });
      }
    });

    return students;
  },

  markStudentMissing(student) {
    if (!student.checkbox) return false;

    // Check if already checked by looking at the parent checkbox element's classes
    const checkboxElement = student.checkbox.closest('checkbox');

    // Angular adds specific classes when the checkbox is checked
    // Check for common Angular form states or look at the visual state
    const isChecked = checkboxElement && (
      checkboxElement.classList.contains('ng-valid') &&
      !checkboxElement.classList.contains('ng-pristine')
    );

    // If not already checked, click to mark as missing
    if (!isChecked) {
      student.checkbox.click();
      return true;
    }

    return false; // Already marked, skip
  },

  getAllStudentsOnCurrentPage() {
    return this.getCurrentPageStudents();
  }
};
