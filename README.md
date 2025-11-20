# Tahvel Auto-Fill Extension

A browser extension that automatically fills missing lesson dates in Tahvel journals.

## Features

- **Auto-Fill Dates**: Automatically creates journal entries for all missing lesson dates
- **Smart Detection**: Groups multiple time slots on the same day into one entry
- **Progress Tracking**: Shows real-time progress as lessons are being inserted
- **Error Handling**: Displays clear error messages if something goes wrong
- **Teacher Agnostic**: Works for any teacher logged into Tahvel

## How It Works

1. Fetches your teacher ID from your logged-in session
2. Gets all students in the current journal
3. Retrieves existing journal entries to avoid duplicates
4. Fetches your timetable events for the current journal
5. Groups events by date and calculates the correct starting lesson number
6. Creates journal entries for all missing dates with a single click

## Installation (Firefox)

### Development Mode

1. Open Firefox and navigate to `about:debugging`
2. Click on "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the `tahvel-extension` folder
5. Select the `manifest.json` file
6. The extension is now loaded!

**Note**: Temporary extensions are removed when Firefox closes. You'll need to reload it each time.

### Permanent Installation (unsigned)

1. Open Firefox and navigate to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false` (this allows unsigned extensions)
4. Open `about:addons`
5. Click the gear icon and select "Install Add-on From File"
6. Select the `tahvel-extension` folder (or a packaged .xpi file)

## Installation (Chrome/Edge)

1. Open Chrome/Edge and navigate to `chrome://extensions` or `edge://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `tahvel-extension` folder
5. The extension is now loaded!

## Usage

1. Log in to Tahvel at https://tahvel.edu.ee
2. Navigate to any journal edit page (e.g., `https://tahvel.edu.ee/#/journal/426366/edit`)
3. You'll see a green "Fill Dates" button at the top of the page
4. Click the button
5. The extension will:
   - Fetch all necessary data
   - Calculate missing dates
   - Show a confirmation dialog with the count
6. Click "OK" to proceed
7. Watch the progress as lessons are inserted
8. The page will automatically reload when done

## Time Slot Mapping

The extension automatically determines the starting lesson number based on the earliest time slot:

- **08:15** → Lesson 1
- **09:10** → Lesson 2
- **10:05** → Lesson 3
- **11:00** → Lesson 4
- **12:30** → Lesson 5 (after lunch)
- **13:25** → Lesson 6
- **14:20** → Lesson 7
- **15:15** → Lesson 8

## Troubleshooting

### Button doesn't appear
- Make sure you're on a journal edit page (`/journal/{id}/edit`)
- Try refreshing the page
- Check the browser console for errors (F12)

### "Not logged in" error
- Make sure you're logged into Tahvel
- Try refreshing your session by logging out and back in

### Insertions fail
- Check that you have permission to edit the journal
- Verify that your timetable data is correct
- Look at the browser console for detailed error messages

## Development

### Color Scheme

The extension uses a consistent amber/yellow color palette as its brand color:

- **Primary Brand Color**: `#fbbf24` (amber-400)
- **Hover State**: `#f59e0b` (amber-500)
- **Active State**: `#d97706` (amber-600)
- **Active Hover**: `#b45309` (amber-700)
- **Text Color**: `#1f2937` (gray-800)
- **Active Text**: `#ffffff` (white)

**Status Colors:**
- **Info**: `#2196F3` (blue)
- **Success**: `#4CAF50` (green)
- **Error**: `#f44336` (red)
- **Warning**: `#ff9800` (orange)

All buttons and UI elements should follow this color scheme for consistency.

### File Structure

```
tahvel-extension/
├── manifest.json       # Extension configuration
├── content.js          # Main logic (injected into Tahvel pages)
├── styles.css          # UI styling
├── icon.png            # Extension icon
└── README.md           # This file
```

### Debugging

1. Open the browser console (F12) on a Tahvel page
2. Look for messages starting with "Tahvel Auto-Fill:"
3. All API requests and responses are logged

### Making Changes

1. Edit the files in the `tahvel-extension` folder
2. In Firefox: Go to `about:debugging` and click "Reload" next to the extension
3. In Chrome: Go to `chrome://extensions` and click the reload icon
4. Refresh the Tahvel page to see your changes

## Future Enhancements

- [ ] Support for bulk operations across multiple journals
- [ ] Customizable lesson names
- [ ] Import/export of timetable data
- [ ] More granular control over which dates to fill
- [ ] Support for different lesson durations

## License

MIT
