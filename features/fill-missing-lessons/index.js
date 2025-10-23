// Fill Missing Lessons Feature
import { getJournalId, getXSRFToken } from '../../utils/common.js';
import { injectButton, showStatus, hideStatus, setButtonsEnabled } from './ui.js';
import {
  fetchUserData,
  fetchJournalStudents,
  fetchJournalEntries,
  fetchTimetable,
  postJournalEntry,
  createEntryPayload
} from './api.js';
import { TIME_SLOTS } from './constants.js';

export function init() {
  // Wait for the page content to be ready
  setTimeout(() => {
    injectButton(
      () => handleFillDates(1),
      () => handleFillDates(null)
    );
  }, 1000);
}

async function handleFillDates(limit = null) {
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

  setButtonsEnabled(false);
  showStatus('Fetching data...', 'info');

  try {
    // Step 1: Get current user (teacher ID)
    showStatus('Getting teacher info...', 'info');
    const userData = await fetchUserData();
    const teacherId = userData.teacher;

    if (!teacherId) {
      throw new Error('Teacher ID not found. Are you logged in as a teacher?');
    }

    console.log('Teacher ID:', teacherId);

    // Step 2: Get journal students
    showStatus('Fetching students...', 'info');
    const students = await fetchJournalStudents(journalId);
    console.log('Students:', students.length);

    // Step 3: Get existing journal entries
    showStatus('Fetching existing entries...', 'info');
    const existingEntries = await fetchJournalEntries(journalId);
    console.log('Existing entries:', existingEntries.length);

    const existingDates = new Set(existingEntries.map(e => e.entryDate));

    // Step 4: Get timetable events
    showStatus('Fetching timetable...', 'info');
    const timetableData = await fetchTimetable(teacherId);
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
      setButtonsEnabled(true);
      setTimeout(hideStatus, 3000);
      return;
    }

    // Step 7: Limit to specified number if provided
    const datesToAdd = limit ? missingDates.slice(0, limit) : missingDates;

    // Confirm with user
    const confirmed = confirm(
      `Found ${missingDates.length} missing lesson dates.\n\n` +
      `This will create ${datesToAdd.length} journal ${datesToAdd.length === 1 ? 'entry' : 'entries'}.\n\n` +
      `First date: ${new Date(datesToAdd[0].date).toLocaleDateString()}\n` +
      (datesToAdd.length > 1 ? `Last date: ${new Date(datesToAdd[datesToAdd.length - 1].date).toLocaleDateString()}\n\n` : '\n') +
      `Continue?`
    );

    if (!confirmed) {
      showStatus('Cancelled', 'info');
      setButtonsEnabled(true);
      setTimeout(hideStatus, 2000);
      return;
    }

    // Step 8: Insert missing lessons
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < datesToAdd.length; i++) {
      const { date, startLessonNr, lessonCount } = datesToAdd[i];
      const dateStr = new Date(date).toLocaleDateString();

      showStatus(`Inserting ${i + 1}/${datesToAdd.length}: ${dateStr}...`, 'info');

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
      showStatus(`Success! Inserted ${successCount} ${successCount === 1 ? 'lesson' : 'lessons'}.`, 'success');
    } else {
      showStatus(`Completed: ${successCount} success, ${failCount} failed.`, 'warning');
    }

    setButtonsEnabled(true);

    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('Error:', error);
    showStatus(`Error: ${error.message}`, 'error');
    setButtonsEnabled(true);
  }
}
