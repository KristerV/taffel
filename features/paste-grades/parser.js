// Parser for pasted grade data (email + grade pairs)
const GradeParser = {
  // Grade value mapping for the select dropdown
  GRADE_MAP: {
    '1': '1: Object',
    '2': '2: Object',
    '3': '3: Object',
    '4': '4: Object',
    '5': '5: Object',
    'A': '6: Object',
    'MA': '7: Object',
    'X': '8: Object'
  },

  // Parse pasted text into email->grade pairs
  parse(text) {
    const results = [];
    const lines = text.trim().split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Split by tab or multiple spaces
      const parts = trimmed.split(/\t+|\s{2,}/);

      if (parts.length >= 2) {
        const email = parts[0].trim();
        const grade = parts[parts.length - 1].trim().toUpperCase();

        if (email.includes('@') && this.GRADE_MAP[grade]) {
          results.push({ email, grade });
        }
      }
    }

    return results;
  },

  // Get the select option value for a grade
  getSelectValue(grade) {
    return this.GRADE_MAP[grade.toUpperCase()] || null;
  }
};
