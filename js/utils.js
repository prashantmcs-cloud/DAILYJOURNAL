import { storage } from './storage.js';

export class Utils {
  generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  exportData(format) {
    const data = storage.load();
    const entries = data.entries || [];
    let output = '';
    let mime = 'text/plain;charset=utf-8';

    if (format === 'json') {
      output = JSON.stringify(data, null, 2);
      mime = 'application/json';
    } else if (format === 'txt') {
      output = entries.map((entry) => `${entry.title}\n${entry.mood}\n${entry.content}\n`).join('\n---\n');
    } else {
      output = entries.map((entry) => `# ${entry.title}\n\n- Mood: ${entry.mood}\n- Tags: ${(entry.tags || []).join(', ')}\n- Date: ${entry.createdAt}\n\n${entry.content}\n`).join('\n---\n');
    }

    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reflect-journal.${format === 'md' ? 'md' : format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.entries) {
          throw new Error('Invalid journal file');
        }
        const state = storage.load();
        const shouldReplace = window.confirm('Replace existing data or merge with current entries?\nClick OK to replace, Cancel to merge.');
        if (shouldReplace) {
          state.entries = parsed.entries || [];
          state.moods = parsed.moods || [];
          state.settings = { ...state.settings, ...(parsed.settings || {}) };
        } else {
          state.entries = [...(parsed.entries || []), ...state.entries];
          state.moods = [...(parsed.moods || []), ...state.moods];
        }
        storage.save(state);
        window.location.reload();
      } catch (error) {
        alert('Unable to import file. Please choose a valid journal export.');
      }
    };
    reader.readAsText(file);
  }

  resetData() {
    if (window.confirm('Reset all journal data? This cannot be undone.')) {
      storage.reset();
      window.location.reload();
    }
  }
}
