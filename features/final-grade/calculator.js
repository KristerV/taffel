// Calculator for final grades based on table data
const FinalGradeCalculator = {
  // Extract grades for all students from the grade table
  extractGrades() {
    const students = {};
    const rows = document.querySelectorAll('tbody[formgroupname="students"] tr');

    rows.forEach(row => {
      const nameLink = row.querySelector('td.sticky-col.col-3 a');
      if (!nameLink) return;

      const studentName = nameLink.textContent.trim();
      const allEntryCells = row.querySelectorAll('td[formgroupname="entries"]');

      // Skip the last entry cell (final grade column)
      const gradeCells = Array.from(allEntryCells).slice(0, -1);
      const grades = [];

      gradeCells.forEach(cell => {
        const gradeCell = cell.querySelector('.grade-cell');
        if (gradeCell) {
          const gradeText = gradeCell.textContent.trim();
          if (gradeText && gradeText !== '-' && gradeText !== '—') {
            grades.push(gradeText);
          }
        }
      });

      students[studentName] = grades;
    });

    return students;
  },

  // Parse a grade string, handling corrected grades like "X * / 5" -> "5"
  parseGrade(gradeText) {
    const text = gradeText.trim().toUpperCase();

    // Check for corrected grade pattern: "X * / 5" or similar
    // Take the last number/grade after the slash
    if (text.includes('/')) {
      const parts = text.split('/');
      const lastPart = parts[parts.length - 1].trim();
      // Extract just the grade character/number
      const match = lastPart.match(/^(\d|A|MA|X|V|P)/i);
      if (match) return match[1].toUpperCase();
    }

    // Extract first grade character/number
    const match = text.match(/^(\d|A|MA|X|V|P)/i);
    return match ? match[1].toUpperCase() : null;
  },

  // Calculate final grade for a student's grades array
  // Returns: { grade: '3', skip: false } or { skip: true, reason: '...' }
  calculateFinal(grades) {
    if (grades.length === 0) {
      return { skip: true, reason: 'no grades' };
    }

    // Parse all grades (handling corrected grades)
    const parsedGrades = grades.map(g => this.parseGrade(g)).filter(g => g !== null);

    // Check for A, MA - skip these students
    if (parsedGrades.includes('A') || parsedGrades.includes('MA')) {
      return { skip: true, reason: 'special grade' };
    }

    // Filter out V and P (attendance marks, not grades)
    const actualGrades = parsedGrades.filter(g => g !== 'V' && g !== 'P');

    if (actualGrades.length === 0) {
      return { skip: true, reason: 'no actual grades' };
    }

    // Convert grades to numbers
    const hasX = actualGrades.includes('X');
    const numericGrades = [];

    for (const grade of actualGrades) {
      if (grade === '1' || grade === 'X') {
        numericGrades.push(2); // Treat 1 and X as 2
      } else if (['2', '3', '4', '5'].includes(grade)) {
        numericGrades.push(parseInt(grade));
      }
      // Ignore other values
    }

    if (numericGrades.length === 0) {
      return { skip: true, reason: 'no valid grades' };
    }

    // Calculate average and round
    const average = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;
    const rounded = Math.round(average);

    // Determine final grade
    if (rounded >= 3) {
      return { grade: String(rounded), skip: false };
    } else {
      // Average rounds to 2 or below
      if (hasX) {
        return { grade: 'X', skip: false };
      } else {
        return { grade: '2', skip: false };
      }
    }
  }
};
