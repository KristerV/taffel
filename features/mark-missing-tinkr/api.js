// API functions for marking students based on Tinkr data
const MarkMissingTinkrAPI = {
  // Get all students from current Tahvel page
  async getTahvelStudents() {
    const studentRows = document.querySelectorAll('tbody[formArrayName="students"] tr');
    const students = [];

    studentRows.forEach((row, index) => {
      const studentCell = row.querySelector('td:nth-child(2) .student-cell');
      if (studentCell) {
        const checkbox = row.querySelector('checkbox[formcontrolname="absenceWithoutReason"] button');

        // Get all text from the cell, which may include prefixes like "AP ", "V ", "H " etc
        let fullText = studentCell.textContent.trim();

        // Remove common prefixes (AP = Ajutisel Puhkusel, V = Vabastatud, H = Hilinemine, etc)
        fullText = fullText.replace(/^(AP|V|H|P|PR)\s+/i, '');

        students.push({
          index,
          name: fullText,
          checkbox,
          row
        });
      }
    });

    return students;
  },

  // Mark a student as missing (same logic as mark-all-missing)
  markStudentMissing(student) {
    if (!student.checkbox) return false;

    const checkboxElement = student.checkbox.closest('checkbox');

    const isChecked = checkboxElement && (
      checkboxElement.classList.contains('ng-valid') &&
      !checkboxElement.classList.contains('ng-pristine')
    );

    if (!isChecked) {
      student.checkbox.click();
      return true;
    }

    return false;
  },

  // Match Tahvel students with Tinkr students and mark missing
  async matchAndMarkStudents(tinkrStudents, allowedMissing, onProgress) {
    const tahvelStudents = await this.getTahvelStudents();
    console.log('MarkMissingTinkrAPI: Tahvel students:', tahvelStudents.length);
    console.log('MarkMissingTinkrAPI: First 3 Tahvel students:', tahvelStudents.slice(0, 3).map(s => s.name));

    // Filter Tinkr students who should be marked missing
    const tinkrToMark = TinkrParser.filterShouldBeMarkedMissing(tinkrStudents, allowedMissing);
    console.log('MarkMissingTinkrAPI: Tinkr students to mark:', tinkrToMark.length);
    console.log('MarkMissingTinkrAPI: Tinkr emails to mark:', tinkrToMark.map(s => s.email));

    const results = {
      total: tahvelStudents.length,
      matched: 0,
      marked: 0,
      skipped: 0,
      notFound: [],
      details: []
    };

    console.log('MarkMissingTinkrAPI: Starting to match students...');
    console.log('MarkMissingTinkrAPI: All Tahvel students:', tahvelStudents.map(s => s.name));

    // Match each Tahvel student with Tinkr data
    for (const tahvelStudent of tahvelStudents) {
      // Find matching Tinkr student
      const match = TinkrMatcher.findTinkrStudent(
        tahvelStudent.name,
        tinkrToMark
      );

      if (match) {
        results.matched++;

        // Mark as missing
        const marked = this.markStudentMissing(tahvelStudent);

        if (marked) {
          results.marked++;
          results.details.push({
            tahvelName: tahvelStudent.name,
            tinkrEmail: match.tinkrStudent.email,
            progress: `${match.tinkrStudent.completed}/${match.tinkrStudent.total}`,
            matchMethod: match.matchResult.method,
            similarity: match.matchResult.similarity,
            action: 'marked'
          });
        } else {
          results.skipped++;
          results.details.push({
            tahvelName: tahvelStudent.name,
            tinkrEmail: match.tinkrStudent.email,
            progress: `${match.tinkrStudent.completed}/${match.tinkrStudent.total}`,
            matchMethod: match.matchResult.method,
            similarity: match.matchResult.similarity,
            action: 'already_marked'
          });
        }

        // Progress callback
        if (onProgress) {
          onProgress(results);
        }

        // Small delay between clicks
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Find Tinkr students who weren't matched
    for (const tinkrStudent of tinkrToMark) {
      const wasMatched = results.details.some(d => d.tinkrEmail === tinkrStudent.email);
      if (!wasMatched) {
        results.notFound.push({
          email: tinkrStudent.email,
          progress: `${tinkrStudent.completed}/${tinkrStudent.total}`
        });
      }
    }

    console.log('MarkMissingTinkrAPI: Final results:', results);

    return results;
  }
};
