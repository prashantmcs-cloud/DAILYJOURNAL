# Reflect Journal

Reflect Journal is a fully responsive daily journal and mood tracker built with HTML5, CSS3, and vanilla JavaScript. It uses local storage for persistence and provides a polished dashboard experience for writing entries, tracking moods, reviewing history, and exploring insights.

## Features
- Responsive dashboard with date, time, greeting, mood summary, recent entries, and stats
- Journal CRUD with favorite, pin, duplicate, and search/filter/sort support
- Mood tracker with timeline and recent mood history
- Interactive calendar view with entry and mood highlights
- Statistics for words, moods, favorites, and more
- Theme switching, settings, and import/export support

## Folder structure
- index.html
- css/  stylesheets
- js/ for modular application logic
- assets/ for icons, images, and fonts
- testcases/ for AI-Driven Synthetic Monitoring MVP

## Installation
1. Open the project folder in your browser, or run a local static server.
2. Example:
   ```bash
   python3 -m http.server 8000
   ```
3. Visit http://127.0.0.1:8000/

## Usage
- Use the New Entry button or keyboard shortcut Ctrl+N to create a journal entry.
- Use Ctrl+F to focus the search box.
- Use the mood buttons on the dashboard to log your mood quickly.

## LocalStorage schema
```json
{
  "entries": [],
  "moods": [],
  "settings": {},
  "statistics": {},
  "theme": "light"
}
```

## Future improvements
- PWA support
- Offline-first experience
- IndexedDB migration
- Cloud sync and authentication
- Rich text editor and image attachments

## Screenshots
Add screenshots to this section once you capture them.
