// Tahvel Auto-Fill Extension - Content Script

// Time slot to lesson number mapping
const TIME_SLOTS = {
  '08:15': 1,
  '09:10': 2,
  '10:05': 3,
  '11:00': 4,
  '12:30': 5,
  '13:25': 6,
  '14:20': 7,
  '15:15': 8
};

// Wait for page to load
function init() {
  // Check if we're on a journal edit page
  if (!window.location.hash.includes('/journal/') || !window.location.hash.includes('/edit')) {
    return;
  }

  // Wait for the page content to be ready
  setTimeout(() => {
    injectButton();
  }, 1000);
}

// Inject the "Fill Dates" button
function injectButton() {
  // Check if button already exists
  if (document.getElementById('tahvel-autofill-btn')) {
    return;
  }

  // Find a good place to inject the button (top of the page)
  const header = document.querySelector('.page-header, .view-header, md-toolbar, .md-toolbar-tools');

  if (!header) {
    console.log('Tahvel Auto-Fill: Could not find header to inject button');
    return;
  }

  // Create button
  const button = document.createElement('button');
  button.id = 'tahvel-autofill-btn';
  button.className = 'tahvel-autofill-button';
  button.textContent = 'Fill Dates';
  button.onclick = handleFillDates;

  // Create status div
  const statusDiv = document.createElement('div');
  statusDiv.id = 'tahvel-autofill-status';
  statusDiv.className = 'tahvel-autofill-status';

  // Insert button and status
  header.appendChild(button);
  header.appendChild(statusDiv);

  console.log('Tahvel Auto-Fill: Button injected');
}

// Extract journal ID from URL
function getJournalId() {
  const match = window.location.hash.match(/\/journal\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Get XSRF token
function getXSRFToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}

// Show status message
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('tahvel-autofill-status');
  if (!statusDiv) return;

  statusDiv.textContent = message;
  statusDiv.className = `tahvel-autofill-status tahvel-autofill-${type}`;
  statusDiv.style.display = 'block';
}

// Hide status
function hideStatus() {
  const statusDiv = document.getElementById('tahvel-autofill-status');
  if (statusDiv) {
    statusDiv.style.display = 'none';
  }
}

// Disable/enable button
function setButtonEnabled(enabled) {
  const button = document.getElementById('tahvel-autofill-btn');
  if (button) {
    button.disabled = !enabled;
    button.style.opacity = enabled ? '1' : '0.5';
  }
}

// Main handler
async function handleFillDates() {
  const journalId = getJournalId();
  const token = getXSRFToken();

  if (!journalId) {
    showStatus('Error: Could not determine journal ID', 'error');
    return;
  }

  if (!token) {
    showStatus('Error: Not logged in to Tahvel', 'error');
    return;
  }

  setButtonEnabled(false);
  showStatus('Fetching data...', 'info');

  try {
    // Step 1: Get current user (teacher ID)
    showStatus('Getting teacher info...', 'info');
    const userResponse = await fetch('https://tahvel.edu.ee/hois_back/user');
    if (!userResponse.ok) throw new Error('Failed to fetch user data');
    const userData = await userResponse.json();
    const teacherId = userData.teacher;

    if (!teacherId) {
      throw new Error('Teacher ID not found. Are you logged in as a teacher?');
    }

    console.log('Teacher ID:', teacherId);

    // Step 2: Get journal students
    showStatus('Fetching students...', 'info');
    const studentsResponse = await fetch(`https://tahvel.edu.ee/hois_back/journals/${journalId}/journalStudents?allStudents=false`);
    if (!studentsResponse.ok) throw new Error('Failed to fetch students');
    const students = await studentsResponse.json();

    console.log('Students:', students.length);

    // Step 3: Get existing journal entries
    showStatus('Fetching existing entries...', 'info');
    const entriesResponse = await fetch(`https://tahvel.edu.ee/hois_back/journals/${journalId}/journalEntriesByDate?allStudents=false`);
    if (!entriesResponse.ok) throw new Error('Failed to fetch existing entries');
    const existingEntries = await entriesResponse.json();

    console.log('Existing entries:', existingEntries.length);

    const existingDates = new Set(existingEntries.map(e => e.entryDate));

    // Step 4: Get timetable events
    showStatus('Fetching timetable...', 'info');
    const timetableResponse = await fetch(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByTeacher/14?from=2025-08-25T03:00:00.000Z&lang=ET&teachers=${teacherId}&thru=2026-08-23T03:00:00.000Z`);
    if (!timetableResponse.ok) throw new Error('Failed to fetch timetable');
    const timetableData = await timetableResponse.json();

    console.log('Timetable events:', timetableData.timetableEvents.length);

    // Step 5: Filter and group events for this journal by date
    const journalEvents = timetableData.timetableEvents.filter(e => e.journalId === journalId);
    console.log('Events for this journal:', journalEvents.length);

    // Group by date
    const eventsByDate = {};
    journalEvents.forEach(event => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = [];
      }
      eventsByDate[event.date].push(event);
    });

    // Step 6: Find missing dates
    const missingDates = [];
    for (const [date, events] of Object.entries(eventsByDate)) {
      if (!existingDates.has(date)) {
        // Sort events by time to find the earliest
        events.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
        const earliestTime = events[0].timeStart;
        const startLessonNr = TIME_SLOTS[earliestTime] || 1;
        const lessonCount = events.length;

        missingDates.push({
          date,
          startLessonNr,
          lessonCount,
          events
        });
      }
    }

    missingDates.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Missing dates:', missingDates.length);

    if (missingDates.length === 0) {
      showStatus('No missing dates found!', 'success');
      setButtonEnabled(true);
      setTimeout(hideStatus, 3000);
      return;
    }

    // Step 7: Confirm with user
    const confirmed = confirm(
      `Found ${missingDates.length} missing lesson dates.\n\n` +
      `This will create ${missingDates.length} journal entries.\n\n` +
      `First date: ${new Date(missingDates[0].date).toLocaleDateString()}\n` +
      `Last date: ${new Date(missingDates[missingDates.length - 1].date).toLocaleDateString()}\n\n` +
      `Continue?`
    );

    if (!confirmed) {
      showStatus('Cancelled', 'info');
      setButtonEnabled(true);
      setTimeout(hideStatus, 2000);
      return;
    }

    // Step 8: Insert missing lessons
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < missingDates.length; i++) {
      const { date, startLessonNr, lessonCount } = missingDates[i];
      const dateStr = new Date(date).toLocaleDateString();

      showStatus(`Inserting ${i + 1}/${missingDates.length}: ${dateStr}...`, 'info');

      try {
        const payload = createEntryPayload(date, startLessonNr, lessonCount, students, teacherId);
        await postJournalEntry(journalId, payload, token);
        successCount++;
        console.log(`✓ Inserted: ${dateStr}`);
      } catch (error) {
        failCount++;
        console.error(`✗ Failed: ${dateStr}`, error);
      }

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 9: Show results
    if (failCount === 0) {
      showStatus(`Success! Inserted ${successCount} lessons.`, 'success');
    } else {
      showStatus(`Completed: ${successCount} success, ${failCount} failed.`, 'warning');
    }

    setButtonEnabled(true);

    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('Error:', error);
    showStatus(`Error: ${error.message}`, 'error');
    setButtonEnabled(true);
  }
}

// Create journal entry payload
function createEntryPayload(date, startLessonNr, lessonCount, students, teacherId) {
  const studentEntries = students.map(student => ({
    id: null,
    journalStudent: student.id,
    absence: null,
    grade: null,
    verbalGrade: null,
    removeStudentHistory: false,
    addInfo: null,
    hasOverlappingLessonAbsence: false,
    isPraise: false,
    isRemark: false,
    isLessonAbsence: false,
    lessonAbsences: {}
  }));

  return {
    entryType: 'SISSEKANNE_T',
    nameEt: 'Tund',
    entryDate: date,
    startLessonNr: startLessonNr,
    lessons: String(lessonCount),
    content: null,
    homework: null,
    journalEntryCapacityTypes: ['MAHT_a'],
    journalEntryTeachers: [teacherId],
    isTest: null,
    journalEntryStudents: studentEntries
  };
}

// Post journal entry
async function postJournalEntry(journalId, payload, token) {
  const response = await fetch(`https://tahvel.edu.ee/hois_back/journals/${journalId}/journalEntry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': token
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-initialize on hash change (SPA navigation)
window.addEventListener('hashchange', () => {
  setTimeout(init, 500);
});
