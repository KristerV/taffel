// Fill Missing Lessons Feature
const FillMissingLessons = {
  init() {
    // Wait for the page content to be ready
    setTimeout(() => {
      FillMissingLessonsUI.injectButton(
        () => this.handleFillDates(1),
        () => this.handleFillDates(null)
      );
    }, 1000);
  },

  async handleFillDates(limit = null) {
    const journalId = TahvelUtils.getJournalId();
    const token = TahvelUtils.getXSRFToken();

    if (!journalId) {
      FillMissingLessonsUI.showStatus('Error: Could not determine journal ID', 'error');
      return;
    }

    if (!token) {
      FillMissingLessonsUI.showStatus('Error: Not logged in to Tahvel', 'error');
      return;
    }

    FillMissingLessonsUI.setButtonsEnabled(false);
    FillMissingLessonsUI.showStatus('Fetching data...', 'info');

    try {
      // Step 1: Get current user (teacher ID)
      FillMissingLessonsUI.showStatus('Getting teacher info...', 'info');
      const userData = await FillMissingLessonsAPI.fetchUserData();
      const teacherId = userData.teacher;

      if (!teacherId) {
        throw new Error('Teacher ID not found. Are you logged in as a teacher?');
      }

      console.log('Teacher ID:', teacherId);

      // Step 2: Get journal students
      FillMissingLessonsUI.showStatus('Fetching students...', 'info');
      const students = await FillMissingLessonsAPI.fetchJournalStudents(journalId);
      console.log('Students:', students.length);

      // Step 3: Get existing journal entries
      FillMissingLessonsUI.showStatus('Fetching existing entries...', 'info');
      const existingEntries = await FillMissingLessonsAPI.fetchJournalEntries(journalId);
      console.log('Existing entries:', existingEntries.length);

      const existingDates = new Set(existingEntries.map(e => e.entryDate));

      // Step 4: Get timetable events
      FillMissingLessonsUI.showStatus('Fetching timetable...', 'info');
      const timetableData = await FillMissingLessonsAPI.fetchTimetable(teacherId);
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
          const startLessonNr = FillMissingLessonsConstants.TIME_SLOTS[earliestTime] || 1;
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
        FillMissingLessonsUI.showStatus('No missing dates found!', 'success');
        FillMissingLessonsUI.setButtonsEnabled(true);
        setTimeout(() => FillMissingLessonsUI.hideStatus(), 3000);
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
        FillMissingLessonsUI.showStatus('Cancelled', 'info');
        FillMissingLessonsUI.setButtonsEnabled(true);
        setTimeout(() => FillMissingLessonsUI.hideStatus(), 2000);
        return;
      }

      // Step 8: Insert missing lessons
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < datesToAdd.length; i++) {
        const { date, startLessonNr, lessonCount } = datesToAdd[i];
        const dateStr = new Date(date).toLocaleDateString();

        FillMissingLessonsUI.showStatus(`Inserting ${i + 1}/${datesToAdd.length}: ${dateStr}...`, 'info');

        try {
          const payload = FillMissingLessonsAPI.createEntryPayload(date, startLessonNr, lessonCount, students, teacherId);
          await FillMissingLessonsAPI.postJournalEntry(journalId, payload, token);
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
        FillMissingLessonsUI.showStatus(`Success! Inserted ${successCount} ${successCount === 1 ? 'lesson' : 'lessons'}.`, 'success');
      } else {
        FillMissingLessonsUI.showStatus(`Completed: ${successCount} success, ${failCount} failed.`, 'warning');
      }

      FillMissingLessonsUI.setButtonsEnabled(true);

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      FillMissingLessonsUI.showStatus(`Error: ${error.message}`, 'error');
      FillMissingLessonsUI.setButtonsEnabled(true);
    }
  }
};
