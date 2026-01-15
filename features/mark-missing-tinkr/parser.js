// Parser for Tinkr student data
const TinkrParser = {
  // Parse Tinkr text data into structured format
  // Expected format (tab-separated):
  // Status    Email    Progress    Last 3 Days    Percentage
  // Offline    name@domain.com    223/224    0    100%
  parse(tinkrText) {
    console.log('TinkrParser: Starting parse, text length:', tinkrText.length);
    const students = [];
    const lines = tinkrText.split('\n');
    console.log('TinkrParser: Total lines:', lines.length);

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and header
      if (!trimmed || trimmed.startsWith('Status')) {
        continue;
      }

      // Split by tabs or multiple spaces
      const parts = trimmed.split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p);

      // Expected: [Status, Email, Progress, Last3Days, Percentage]
      if (parts.length < 5) {
        console.log('TinkrParser: Skipping invalid line:', trimmed);
        continue;
      }

      const [status, email, progress, lastThreeDays, percentage] = parts;

      // Parse progress (e.g., "223/224")
      const progressMatch = progress.match(/^(\d+)\/(\d+)$/);
      if (!progressMatch) {
        console.log('TinkrParser: Invalid progress format:', progress);
        continue;
      }

      // Parse percentage (e.g., "100%")
      const percentMatch = percentage.match(/^(\d+)%$/);
      if (!percentMatch) {
        console.log('TinkrParser: Invalid percentage format:', percentage);
        continue;
      }

      students.push({
        status,
        email,
        completed: parseInt(progressMatch[1]),
        total: parseInt(progressMatch[2]),
        lastThreeDays: parseInt(lastThreeDays),
        percentage: parseInt(percentMatch[1])
      });
    }

    console.log('TinkrParser: Parsed students:', students.length);
    console.log('TinkrParser: First 3 students:', students.slice(0, 3));

    // Deduplicate by normalized email (keep first occurrence only)
    const seen = new Set();
    const deduplicated = students.filter(student => {
      const normalized = student.email.toLowerCase().replace(/[^a-z]/g, '');
      if (seen.has(normalized)) {
        console.log(`TinkrParser: Skipping duplicate: ${student.email} (already have this student)`);
        return false;
      }
      seen.add(normalized);
      return true;
    });

    console.log('TinkrParser: After deduplication:', deduplicated.length);

    return deduplicated;
  },

  // Filter students who should be marked missing
  // Rules:
  // 1. Not online
  // 2. Percentage < minPercentage AND lastThreeDays < minRecentLessons
  filterShouldBeMarkedMissing(students, minPercentage = 90, minRecentLessons = 5) {
    console.log(`TinkrParser: Filtering students to mark missing (min percentage: ${minPercentage}%, min recent: ${minRecentLessons})`);
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

      // Must have lastThreeDays data
      if (student.lastThreeDays === undefined) {
        console.log('  - Skipping (no Last 3 Days data):', student.email);
        return false;
      }

      // Check overall progress (use percentage from Tinkr data, or calculate from completed/total)
      const percentage = student.percentage !== undefined ? student.percentage : Math.round((student.completed / student.total) * 100);
      const overallBad = percentage < minPercentage;

      // Check recent work
      const recentBad = student.lastThreeDays < minRecentLessons;

      // Mark if BOTH overall AND recent are bad
      const shouldMark = overallBad && recentBad;
      console.log(`  - ${student.email}: ${percentage}% (need: ${minPercentage}%), Last 3 Days: ${student.lastThreeDays} (need: ${minRecentLessons}) -> ${shouldMark ? 'MARK' : 'SKIP'}`);
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
