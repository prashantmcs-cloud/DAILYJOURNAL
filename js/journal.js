import { storage } from './storage.js';
import { Utils } from './utils.js';

export class JournalApp {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
    this.utils = new Utils();
    this.modal = document.getElementById('entryModal');
    this.form = document.getElementById('entryForm');
    this.entryId = document.getElementById('entryId');
    this.entryTitle = document.getElementById('entryTitle');
    this.entryContent = document.getElementById('entryContent');
    this.entryMood = document.getElementById('entryMood');
    this.entryTags = document.getElementById('entryTags');
  }

  setState(state) {
    this.state = state;
    this.populateMoodOptions();
  }

  openModal(entry = null) {
    this.resetForm();
    if (entry) {
      this.entryId.value = entry.id;
      this.entryTitle.value = entry.title;
      this.entryContent.value = entry.content;
      this.entryMood.value = entry.mood;
      this.entryTags.value = (entry.tags || []).join(', ');
      document.getElementById('modalTitle').textContent = 'Edit journal entry';
    } else {
      document.getElementById('modalTitle').textContent = 'New journal entry';
    }

    this.modal.classList.remove('hidden');
    this.modal.setAttribute('aria-hidden', 'false');
    this.entryTitle.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    this.resetForm();
  }

  saveEntry(event) {
    const formData = new FormData(this.form);
    const title = String(formData.get('title') || '').trim();
    const content = String(formData.get('content') || '').trim();
    const mood = this.entryMood.value;
    const tags = this.entryTags.value.split(',').map((t) => t.trim()).filter(Boolean);

    if (!title || !content) {
      this.ui.showToast('Title and content are required');
      return;
    }

    const now = new Date();
    const entryPayload = {
      id: this.entryId.value || this.utils.generateId(),
      title,
      content,
      mood,
      tags,
      createdAt: this.entryId.value ? this.state.entries.find((entry) => entry.id === this.entryId.value)?.createdAt || now.toISOString() : now.toISOString(),
      updatedAt: now.toISOString(),
      favorite: this.entryId.value ? this.state.entries.find((entry) => entry.id === this.entryId.value)?.favorite || false : false,
      pinned: this.entryId.value ? this.state.entries.find((entry) => entry.id === this.entryId.value)?.pinned || false : false
    };

    const entries = [...this.state.entries];
    const existingIndex = entries.findIndex((entry) => entry.id === entryPayload.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = entryPayload;
    } else {
      entries.unshift(entryPayload);
    }

    this.state.entries = entries;
    storage.save(this.state);
    this.ui.showToast(existingIndex >= 0 ? 'Entry updated' : 'Entry created');
    this.closeModal();
  }

  resetForm() {
    this.form.reset();
    this.entryId.value = '';
    this.entryMood.value = 'Good';
  }

  populateMoodOptions() {
    const moods = ['Amazing', 'Happy', 'Good', 'Okay', 'Sad', 'Terrible'];
    this.entryMood.innerHTML = moods
      .map((mood) => `<option value="${mood}">${mood}</option>`)
      .join('');
  }
}
