// API functions for fetching and posting journal data
const FillMissingLessonsAPI = {
  async fetchUserData() {
    const response = await fetch('https://tahvel.edu.ee/hois_back/user');
    if (!response.ok) throw new Error('Failed to fetch user data');
    return response.json();
  },

  async fetchJournalStudents(journalId) {
    const response = await fetch(`https://tahvel.edu.ee/hois_back/journals/${journalId}/journalStudents?allStudents=false`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  async fetchJournalEntries(journalId) {
    const response = await fetch(`https://tahvel.edu.ee/hois_back/journals/${journalId}/journalEntriesByDate?allStudents=false`);
    if (!response.ok) throw new Error('Failed to fetch existing entries');
    return response.json();
  },

  async fetchTimetable(teacherId) {
    const response = await fetch(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByTeacher/14?from=2025-08-25T03:00:00.000Z&lang=ET&teachers=${teacherId}&thru=2026-08-23T03:00:00.000Z`);
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return response.json();
  },

  async postJournalEntry(journalId, payload, token) {
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
  },

  createEntryPayload(date, startLessonNr, lessonCount, students, teacherId) {
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
};
