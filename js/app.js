import { storage } from './storage.js';
import { JournalApp } from './journal.js';
import { MoodTracker } from './mood.js';
import { CalendarView } from './calendar.js';
import { SearchController } from './search.js';
import { StatisticsController } from './statistics.js';
import { ThemeController } from './theme.js';
import { UIController } from './ui.js';
import { Utils } from './utils.js';

class App {
  constructor() {
    this.storage = storage;
    this.state = this.storage.load();
    this.ui = new UIController();
    this.journal = new JournalApp(this.state, this.ui);
    this.mood = new MoodTracker(this.state, this.ui);
    this.calendar = new CalendarView(this.state, this.ui);
    this.search = new SearchController(this.state, this.ui);
    this.statistics = new StatisticsController(this.state, this.ui);
    this.theme = new ThemeController(this.ui);
    this.utils = new Utils();
    this.bindEvents();
    this.init();
  }

  init() {
    this.theme.init();
    this.render();
    document.documentElement.style.setProperty('--font-size', `${this.state.settings.fontSize || 16}px`);
    this.ui.showToast('Welcome back to Reflect Journal');
  }

  bindEvents() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.showView(btn.dataset.view));
    });

    document.getElementById('newEntryButton').addEventListener('click', () => this.journal.openModal());
    document.getElementById('sidebarNewEntry').addEventListener('click', () => this.journal.openModal());
    document.getElementById('viewJournalButton').addEventListener('click', () => this.showView('journal'));
    document.getElementById('journalNewEntry').addEventListener('click', () => this.journal.openModal());

    document.getElementById('themeToggle').addEventListener('click', () => this.theme.toggle());
    document.addEventListener('click', (event) => {
      const moodButton = event.target.closest('[data-log-mood]');
      if (moodButton) {
        this.mood.logMood(moodButton.dataset.logMood);
        this.render();
      }
    });
    document.getElementById('themeSelect').addEventListener('change', (e) => this.theme.setTheme(e.target.value));
    document.getElementById('fontSizeRange').addEventListener('input', (e) => {
      this.state.settings.fontSize = Number(e.target.value);
      this.storage.save(this.state);
      document.documentElement.style.setProperty('--font-size', `${e.target.value}px`);
    });
    document.getElementById('animationsToggle').addEventListener('change', (e) => {
      this.state.settings.animations = e.target.checked;
      this.storage.save(this.state);
      document.documentElement.classList.toggle('reduce-motion', !e.target.checked);
    });

    document.getElementById('exportJson').addEventListener('click', () => this.utils.exportData('json'));
    document.getElementById('exportTxt').addEventListener('click', () => this.utils.exportData('txt'));
    document.getElementById('exportMarkdown').addEventListener('click', () => this.utils.exportData('md'));
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', (e) => this.utils.importData(e.target.files[0]));
    document.getElementById('resetData').addEventListener('click', () => this.utils.resetData());

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.journal.openModal();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('entryForm').requestSubmit();
      }
      if (e.key === 'Escape') {
        this.journal.closeModal();
      }
    });

    document.getElementById('closeModal').addEventListener('click', () => this.journal.closeModal());
    document.getElementById('cancelEntry').addEventListener('click', () => this.journal.closeModal());
    document.getElementById('entryForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.journal.saveEntry(e);
      this.render();
    });

    document.getElementById('prevMonth').addEventListener('click', () => this.calendar.changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => this.calendar.changeMonth(1));
    document.getElementById('calendarGrid').addEventListener('click', (event) => {
      const dayButton = event.target.closest('[data-calendar-day]');
      if (dayButton) {
        this.calendar.selectDate(dayButton.dataset.date);
      }
    });
    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => this.search.setFilter(btn.dataset.filter));
    });
    document.getElementById('searchInput').addEventListener('input', (e) => this.search.search(e.target.value));
    document.getElementById('sortSelect').addEventListener('change', (e) => this.search.sort(e.target.value));
  }

  render() {
    this.state = this.storage.load();
    this.journal.setState(this.state);
    this.mood.setState(this.state);
    this.calendar.setState(this.state);
    this.search.setState(this.state);
    this.statistics.setState(this.state);
    this.ui.setState(this.state);
    this.ui.renderDashboard(this.state);
    this.ui.renderJournal(this.state);
    this.ui.renderCalendar(this.state, this.calendar.currentDate, this.calendar.selectedDate);
    this.ui.renderStatistics(this.state);
    this.ui.renderSettings(this.state);
    this.ui.updateStorageUsed(this.storage.estimateSize());
  }

  showView(view) {
    document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
    document.querySelectorAll('.view').forEach((panel) => panel.classList.toggle('active', panel.id === `${view}View`));
  }
}

new App();
