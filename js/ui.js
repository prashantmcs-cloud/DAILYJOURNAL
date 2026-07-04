import { storage } from './storage.js';

export class UIController {
  constructor() {
    this.toastTimer = null;
    this.state = { entries: [], moods: [], settings: {} };
  }

  escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' })[char]);
  }

  setState(state) {
    this.state = state;
  }

  renderDashboard(state) {
    const entries = [...state.entries].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const moods = [...state.moods].sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const greeting = this.getGreeting();
    document.getElementById('greetingText').textContent = greeting;
    document.getElementById('heroTitle').textContent = 'Let your day unfold with intention.';
    document.getElementById('heroSubtitle').textContent = 'Capture your thoughts, track your mood, and revisit your growth.';
    document.getElementById('dashboardStats').innerHTML = `
      <div class="stat-pill"><span>Entries</span><strong>${entries.length}</strong></div>
      <div class="stat-pill"><span>Moods</span><strong>${moods.length}</strong></div>
      <div class="stat-pill"><span>Favorites</span><strong>${entries.filter((entry) => entry.favorite).length}</strong></div>
    `;

    const latestMood = moods[0]?.mood || 'Good';
    document.getElementById('moodBadge').textContent = latestMood;
    document.getElementById('moodSummary').innerHTML = `<div class="entry-card"><p class="muted">Latest mood logged: <strong>${this.escapeHtml(latestMood)}</strong></p><p>${this.escapeHtml(moods[0]?.notes || 'No mood notes yet.')}</p></div>`;

    document.getElementById('weeklyChart').innerHTML = this.renderWeeklyChart(moods);
    document.getElementById('recentEntries').innerHTML = this.renderEntries(entries.slice(0, 3));
    document.getElementById('recentMoods').innerHTML = this.renderMoods(moods.slice(0, 3));
    document.getElementById('moodPicker').innerHTML = ['Amazing', 'Happy', 'Good', 'Okay', 'Sad', 'Terrible'].map((mood) => `<button class="chip" data-log-mood="${mood}" type="button">${mood}</button>`).join('');
  }

  renderJournal(state, query = '', filter = 'all', sort = 'newest') {
    let entries = [...state.entries];
    const normalizedQuery = query.toLowerCase();
    entries = entries.filter((entry) => {
      const haystack = `${entry.title} ${entry.content} ${entry.mood} ${(entry.tags || []).join(' ')} ${entry.createdAt}`.toLowerCase();
      const matchesQuery = haystack.includes(normalizedQuery);
      const matchesFilter = filter === 'all' || (filter === 'favorites' && entry.favorite) || (filter === 'pinned' && entry.pinned);
      return matchesQuery && matchesFilter;
    });

    if (sort === 'oldest') {
      entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'mood') {
      entries.sort((a, b) => a.mood.localeCompare(b.mood));
    } else {
      entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const list = document.getElementById('journalEntriesList');
    if (!entries.length) {
      list.innerHTML = '<div class="empty-state">No entries match your current filters.</div>';
      return;
    }

    list.innerHTML = entries.map((entry) => this.renderEntryCard(entry)).join('');
    list.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => this.handleEntryAction(button.dataset.action, button.dataset.id));
    });
  }

  renderCalendar(state, currentDate = new Date(), selectedDate = new Date()) {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('calendarMonthLabel');
    const details = document.getElementById('calendarDetails');
    const detailHeading = document.getElementById('calendarDetailHeading');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const toLocalIso = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const selectedIso = toLocalIso(selectedDate);
    const currentIso = toLocalIso(new Date());
    label.textContent = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const days = [];
    for (let i = 0; i < startOffset; i += 1) days.push('');
    for (let i = 1; i <= totalDays; i += 1) days.push(i);
    while (days.length % 7 !== 0) days.push('');

    grid.innerHTML = days.map((day) => {
      if (!day) return '<div class="day-cell day-cell--empty"></div>';
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEntry = state.entries.some((entry) => entry.createdAt.startsWith(iso));
      const hasMood = state.moods.some((entry) => entry.date.startsWith(iso));
      const current = currentIso === iso;
      const selected = selectedIso === iso;
      return `<button class="day-cell ${current ? 'current' : ''} ${selected ? 'selected' : ''} ${hasEntry ? 'has-entry' : ''} ${hasMood ? 'has-mood' : ''}" type="button" data-calendar-day data-date="${iso}" aria-label="Select ${iso}">${day}</button>`;
    }).join('');

    const dayEntries = state.entries.filter((entry) => entry.createdAt.startsWith(selectedIso));
    const dayMoods = state.moods.filter((entry) => entry.date.startsWith(selectedIso));
    detailHeading.textContent = `Highlights for ${selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
    if (dayEntries.length || dayMoods.length) {
      details.innerHTML = [
        ...dayEntries.slice(0, 3).map((entry) => `<div class="entry-card"><strong>${this.escapeHtml(entry.title)}</strong><p class="muted">${this.escapeHtml(entry.content.slice(0, 80))}${entry.content.length > 80 ? '…' : ''}</p></div>`),
        ...dayMoods.slice(0, 3).map((mood) => `<div class="mood-card"><strong>${mood.emoji} ${this.escapeHtml(mood.mood)}</strong><p class="muted">${this.escapeHtml(mood.notes || 'No notes.')}</p></div>`)
      ].join('');
    } else {
      details.innerHTML = '<div class="empty-state">No entries or moods for this day yet.</div>';
    }
  }

  renderStatistics(state) {
    const entries = state.entries;
    const moods = state.moods;
    const total = entries.length;
    const favoriteCount = entries.filter((entry) => entry.favorite).length;
    const pinnedCount = entries.filter((entry) => entry.pinned).length;
    const words = entries.reduce((sum, entry) => sum + (entry.content || '').split(/\s+/).filter(Boolean).length, 0);
    const averageWords = total ? Math.round(words / total) : 0;
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {});
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><h4>${total}</h4><p>Total journals</p></div>
      <div class="stat-card"><h4>${favoriteCount}</h4><p>Favorites</p></div>
      <div class="stat-card"><h4>${pinnedCount}</h4><p>Pinned</p></div>
      <div class="stat-card"><h4>${averageWords}</h4><p>Average words</p></div>
      <div class="stat-card"><h4>${words}</h4><p>Total words</p></div>
      <div class="stat-card"><h4>${dominantMood}</h4><p>Most common mood</p></div>
    `;

    document.getElementById('moodDistribution').innerHTML = Object.entries(moodCounts).map(([name, count]) => `
      <div class="chart-bar"><strong>${name}</strong><span><i style="width:${(count / Math.max(1, moods.length)) * 100}%"></i></span>${count}</div>
    `).join('');
  }

  renderSettings(state) {
    document.getElementById('themeSelect').value = state.settings.theme || 'system';
    document.getElementById('fontSizeRange').value = state.settings.fontSize || 16;
    document.getElementById('animationsToggle').checked = state.settings.animations !== false;
  }

  renderAll(state = this.state) {
    this.renderDashboard(state);
    this.renderJournal(state);
    this.renderCalendar(state);
    this.renderStatistics(state);
    this.renderSettings(state);
  }

  updateStorageUsed(size) {
    document.getElementById('storageUsed').textContent = `Storage: ${size} KB`;
  }

  updateThemeButton(theme) {
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  renderEntryCard(entry) {
    return `
      <article class="entry-card ${entry.pinned ? 'pinned' : ''}">
        <div class="entry-meta">
          <div>
            <strong>${this.escapeHtml(entry.title)}</strong>
            <p class="muted">${new Date(entry.createdAt).toLocaleString()}</p>
          </div>
          <span class="badge">${this.escapeHtml(entry.mood)}</span>
        </div>
        <p>${this.escapeHtml(entry.content.slice(0, 140))}${entry.content.length > 140 ? '…' : ''}</p>
        <div class="badge-row">${(entry.tags || []).map((tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}</div>
        <div class="entry-actions">
          <div class="badge-row">
            <button class="chip" type="button" data-action="toggleFavorite" data-id="${entry.id}">★ Favorite</button>
            <button class="chip" type="button" data-action="togglePin" data-id="${entry.id}">📌 Pin</button>
            <button class="chip" type="button" data-action="duplicate" data-id="${entry.id}">⧉ Duplicate</button>
            <button class="chip" type="button" data-action="edit" data-id="${entry.id}">✎ Edit</button>
            <button class="chip" type="button" data-action="delete" data-id="${entry.id}">🗑 Delete</button>
          </div>
        </div>
      </article>
    `;
  }

  renderEntries(entries) {
    if (!entries.length) {
      return '<div class="empty-state">No journal entries yet. Start writing.</div>';
    }
    return entries.map((entry) => `
      <article class="entry-card">
        <div class="entry-meta">
          <strong>${this.escapeHtml(entry.title)}</strong>
          <span class="badge">${this.escapeHtml(entry.mood)}</span>
        </div>
        <p class="muted">${this.escapeHtml(entry.content.slice(0, 70))}${entry.content.length > 70 ? '…' : ''}</p>
      </article>
    `).join('');
  }

  renderMoods(moods) {
    if (!moods.length) {
      return '<div class="empty-state">No mood logs yet.</div>';
    }
    return moods.map((mood) => `
      <article class="mood-card">
        <div class="entry-meta">
          <strong>${mood.emoji} ${this.escapeHtml(mood.mood)}</strong>
          <span class="badge">${new Date(mood.date).toLocaleDateString()}</span>
        </div>
        <p class="muted">${this.escapeHtml(mood.notes || 'No notes.')}</p>
      </article>
    `).join('');
  }

  renderWeeklyChart(moods) {
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().split('T')[0];
    });

    return lastSevenDays.map((day) => {
      const count = moods.filter((mood) => mood.date.startsWith(day)).length;
      return `<div class="chart-bar"><strong>${day.slice(5)}</strong><span><i style="width:${Math.min(100, count * 40)}%"></i></span>${count}</div>`;
    }).join('');
  }

  handleEntryAction(action, id) {
    const entry = this.state?.entries?.find((item) => item.id === id);
    if (!entry) return;
    if (action === 'edit') {
      this.openEditor(entry);
      return;
    }
    if (action === 'delete') {
      this.state.entries = this.state.entries.filter((item) => item.id !== id);
      storage.save(this.state);
      this.showToast('Entry deleted');
      this.renderAll(this.state);
      return;
    }
    if (action === 'toggleFavorite') {
      entry.favorite = !entry.favorite;
      storage.save(this.state);
      this.showToast(entry.favorite ? 'Added to favorites' : 'Removed from favorites');
      this.renderAll(this.state);
      return;
    }
    if (action === 'togglePin') {
      entry.pinned = !entry.pinned;
      storage.save(this.state);
      this.showToast(entry.pinned ? 'Pinned entry' : 'Unpinned entry');
      this.renderAll(this.state);
      return;
    }
    if (action === 'duplicate') {
      const duplicate = { ...entry, id: crypto.randomUUID(), title: `${entry.title} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.state.entries.unshift(duplicate);
      storage.save(this.state);
      this.showToast('Entry duplicated');
      this.renderAll(this.state);
    }
  }

  openEditor(entry) {
    const modal = document.getElementById('entryModal');
    const title = document.getElementById('modalTitle');
    const id = document.getElementById('entryId');
    const entryTitle = document.getElementById('entryTitle');
    const entryContent = document.getElementById('entryContent');
    const entryMood = document.getElementById('entryMood');
    const entryTags = document.getElementById('entryTags');

    id.value = entry.id;
    title.textContent = 'Edit journal entry';
    entryTitle.value = entry.title;
    entryContent.value = entry.content;
    entryMood.value = entry.mood;
    entryTags.value = (entry.tags || []).join(', ');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    entryTitle.focus();
  }
}
