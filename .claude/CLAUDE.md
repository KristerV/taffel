# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tahvel Auto-Fill is a browser extension (Firefox/Chrome) that adds automation features to the Tahvel education system (tahvel.edu.ee). It's a content script extension that injects functionality into specific pages.

## Architecture

### Feature-Based Structure

The extension uses a modular feature system where each feature is self-contained:

```
features/
  feature-name/
    index.js      # Entry point, registers with content.js
    ui.js         # DOM manipulation and UI creation
    api.js        # API calls to Tahvel backend
    constants.js  # Feature-specific constants (optional)
    parser.js     # Data parsing logic (optional)
    matcher.js    # Matching/filtering logic (optional)
```

### Content Script Initialization

`content.js` is the main entry point. Features register themselves with:
- `name`: Feature identifier
- `shouldInit()`: Function that returns boolean (when to activate)
- `init()`: Function to initialize the feature

Features are auto-initialized on page load and on hash change (SPA navigation).

### Shared Utilities

**`utils/common.js` (TahvelUtils):**
- `getJournalId()`: Extract journal ID from URL hash
- `getXSRFToken()`: Get CSRF token from cookies
- `isJournalEditPage()`: Check if on journal edit page

**`utils/button-injection.js` (ButtonInjection):**
Shared system for injecting buttons into the mass-grade modal cell. Features register buttons with:
```javascript
ButtonInjection.registerButton({
  id: 'unique-btn-id',
  text: 'Button Text',
  className: 'tahvel-brand-button my-button-class',
  onClick: () => handleClick()
});
```

The system polls for `td.mass-grade[colspan="3"]` and injects all registered buttons.

## Brand System & Styling

### CSS Variables

All colors are defined in `:root` in `styles.css`:

```css
--brand-primary: #fbbf24      /* Main yellow */
--brand-hover: #f59e0b        /* Hover state */
--brand-active: #d97706       /* Active state */
--brand-active-hover: #b45309 /* Active hover */
--brand-light: #fef3c7        /* Light background */
--text-primary: #1f2937       /* Dark text */
--text-white: #ffffff         /* White text */
--status-info: #2196F3        /* Info messages */
--status-success: #4CAF50     /* Success messages */
--status-error: #f44336       /* Error messages */
--status-warning: #ff9800     /* Warning messages */
```

### Brand Button Class

**Always use `.tahvel-brand-button` as the base class for buttons:**

```javascript
button.className = 'tahvel-brand-button my-specific-class';
```

This provides:
- Yellow background (`var(--brand-primary)`)
- Hover effects
- Disabled state styling
- Consistent padding and transitions

Add feature-specific classes after for custom overrides (margin, etc).

## Tahvel API Patterns

### Authentication
All API calls require XSRF token from cookies. Get it via `TahvelUtils.getXSRFToken()`.

### Common Endpoints
- `/students?size=1000` - Get all students
- `/journalEntries?...` - Get/create journal entries
- `/journals/{id}` - Get journal details
- `/timetableevents/timetable/journal/{id}` - Get timetable for journal

### API Call Structure
```javascript
const response = await fetch(url, {
  headers: {
    'X-XSRF-TOKEN': TahvelUtils.getXSRFToken(),
    'Content-Type': 'application/json'
  },
  method: 'POST', // or GET
  body: JSON.stringify(data)
});
```

## Feature Implementation Patterns

### 1. Page-Specific Features (Journal Edit Pages)

For features that only work on journal edit pages:

```javascript
const MyFeature = {
  init() {
    // Use ButtonInjection for modal buttons
    ButtonInjection.registerButton({...});

    // OR inject directly into page
    const btn = document.createElement('button');
    btn.className = 'tahvel-brand-button';
    // ...
  }
};

// Register in content.js
{
  name: 'my-feature',
  shouldInit: () => TahvelUtils.isJournalEditPage(),
  init: () => MyFeature.init()
}
```

### 2. Global Features (All Pages)

For features that work everywhere (like navbar buttons):

```javascript
const MyFeature = {
  init() {
    // Poll for target element
    const pollInterval = setInterval(() => {
      const target = document.querySelector('#target');
      if (target) {
        // Inject UI
        clearInterval(pollInterval);
      }
    }, 500);

    // Clear after timeout
    setTimeout(() => clearInterval(pollInterval), 10000);
  }
};

// Register in content.js
{
  name: 'my-feature',
  shouldInit: () => true, // Always active
  init: () => MyFeature.init()
}
```

### 3. Time Slot Mapping

Tahvel uses specific time slots that map to lesson numbers (defined in `features/fill-missing-lessons/constants.js`):

```javascript
'08:15' → Lesson 1
'09:10' → Lesson 2
'10:05' → Lesson 3
'11:00' → Lesson 4
'12:30' → Lesson 5
'13:25' → Lesson 6
'14:20' → Lesson 7
'15:15' → Lesson 8
```

## Development Workflow

### Loading the Extension

**Firefox:**
1. `about:debugging` → This Firefox → Load Temporary Add-on
2. Select `manifest.json`
3. Extension removed on browser close

**Chrome/Edge:**
1. `chrome://extensions` or `edge://extensions`
2. Enable Developer mode
3. Load unpacked → select extension folder

### Making Changes

1. Edit files in the extension directory
2. Reload extension in browser (see above)
3. Refresh the Tahvel page to see changes
4. Check browser console (F12) for debug output

### Adding a New Feature

1. Create `features/my-feature/` directory
2. Create at minimum: `index.js` (entry point) and `ui.js` (UI logic)
3. Add to `manifest.json` content_scripts.js array (before `content.js`)
4. Register in `content.js` features array
5. Use `tahvel-brand-button` class for any buttons
6. Use CSS variables for colors

### Manifest Updates

When adding JavaScript files, add them to `manifest.json` in order of dependency:
```json
"js": [
  "utils/common.js",           // First: utilities
  "features/my-feature/ui.js", // Second: feature files
  "features/my-feature/index.js",
  "content.js"                 // Last: main entry point
]
```

## Domain-Specific Knowledge

### Tinkr Integration
The "mark-missing-tinkr" feature parses student attendance data from Tinkr (a learning platform). Students are marked missing if:
- Status is "Offline" (not "Online")
- Completed lessons < (Total lessons - Allowed missing threshold)

The parser expects Tinkr's "Student List" text format with status, email, and progress data.

### Journal Entry Structure
Journal entries in Tahvel require:
- `journalId`: The journal being updated
- `entryDate`: Date in YYYY-MM-DD format
- `lessonNr`: Starting lesson number
- `lessons`: Number of consecutive lessons
- `students`: Array of student IDs with optional `absenceInserted` boolean

### SPA Navigation
Tahvel is a single-page application using hash-based routing (`#/page/subpage`). The extension listens to `hashchange` events to re-initialize features on navigation.
