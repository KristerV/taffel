// Parser for Tinkr student data
const TinkrParser = {
  // Parse Tinkr text data into structured format
  parse(tinkrText) {
    console.log('TinkrParser: Starting parse, text length:', tinkrText.length);
    const students = [];
    const lines = tinkrText.split('\n');
    console.log('TinkrParser: Total lines:', lines.length);

    let currentStudent = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and headers
      if (!trimmed || trimmed === 'Student List' || trimmed.includes('Status')) {
        continue;
      }

      // Detect status lines (Online/Offline)
      if (trimmed === 'Online' || trimmed === 'Offline') {
        if (currentStudent) {
          students.push(currentStudent);
        }
        currentStudent = { status: trimmed };
        continue;
      }

      // Skip help column (—)
      if (trimmed === '—') {
        continue;
      }

      // Detect email (contains @)
      if (trimmed.includes('@')) {
        if (currentStudent) {
          // Extract just the email part (remove em dashes, spaces, etc)
          const emailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) {
            currentStudent.email = emailMatch[1];
          }
        }
        continue;
      }

      // Detect progress (e.g., "149/149" or "148/149")
      const progressMatch = trimmed.match(/^(\d+)\/(\d+)$/);
      if (progressMatch && currentStudent) {
        currentStudent.completed = parseInt(progressMatch[1]);
        currentStudent.total = parseInt(progressMatch[2]);
        continue;
      }

      // Detect percentage (e.g., "100%")
      const percentMatch = trimmed.match(/^(\d+)%$/);
      if (percentMatch && currentStudent) {
        currentStudent.percentage = parseInt(percentMatch[1]);
        // We have all data for this student, add to array
        students.push(currentStudent);
        currentStudent = null;
        continue;
      }
    }

    // Add last student if not already added
    if (currentStudent && currentStudent.email) {
      students.push(currentStudent);
    }

    console.log('TinkrParser: Parsed students:', students.length);
    console.log('TinkrParser: First 3 students:', students.slice(0, 3));

    return students;
  },

  // Filter students who should be marked missing
  // Rules:
  // 1. Not online
  // 2. Progress < (total - allowedMissing) lessons
  filterShouldBeMarkedMissing(students, allowedMissing = 3) {
    console.log(`TinkrParser: Filtering students to mark missing (allowed missing: ${allowedMissing})`);
    const filtered = students.filter(student => {
      // Must be offline
      if (student.status === 'Online') {
        console.log('  - Skipping (Online):', student.email);
        return false;
      }

      // Must have progress data
      if (!student.completed || !student.total) {
        console.log('  - Skipping (no progress):', student.email);
        return false;
      }

      // Must have less than (total - allowedMissing) lessons completed
      const requiredLessons = student.total - allowedMissing;
      const shouldMark = student.completed < requiredLessons;
      console.log(`  - ${student.email}: ${student.completed}/${student.total} (required: ${requiredLessons}) -> ${shouldMark ? 'MARK' : 'SKIP'}`);
      return shouldMark;
    });

    console.log('TinkrParser: Should mark missing:', filtered.length, 'students');
    return filtered;
  },

  // Validate parsed data
  validate(students) {
    const errors = [];

    if (!students || students.length === 0) {
      errors.push('No students found in Tinkr data');
      return { valid: false, errors };
    }

    const validStudents = students.filter(s => s.email && s.total);
    if (validStudents.length === 0) {
      errors.push('No valid student data found (missing emails or progress)');
      return { valid: false, errors };
    }

    if (validStudents.length < students.length) {
      errors.push(`${students.length - validStudents.length} students have incomplete data`);
    }

    return { valid: true, errors, validCount: validStudents.length };
  }
};
