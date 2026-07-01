import { storage } from './storage.js';
import { Utils } from './utils.js';

export class MoodTracker {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
    this.utils = new Utils();
  }

  setState(state) {
    this.state = state;
  }

  logMood(mood, notes = '') {
    const now = new Date();
    const entry = {
      id: this.utils.generateId(),
      mood,
      emoji: this.getEmoji(mood),
      color: this.getColor(mood),
      notes,
      date: now.toISOString()
    };

    this.state.moods.unshift(entry);
    storage.save(this.state);
    this.ui.showToast(`Mood logged: ${mood}`);
  }

  getEmoji(mood) {
    const map = {
      Amazing: '😊',
      Happy: '😁',
      Good: '🙂',
      Okay: '😐',
      Sad: '😔',
      Terrible: '😢'
    };
    return map[mood] || '🙂';
  }

  getColor(mood) {
    const map = {
      Amazing: '#4f46e5',
      Happy: '#06b6d4',
      Good: '#22c55e',
      Okay: '#f59e0b',
      Sad: '#f97316',
      Terrible: '#ef4444'
    };
    return map[mood] || '#4f46e5';
  }
}
