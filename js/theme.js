import { storage } from './storage.js';

export class ThemeController {
  constructor(ui) {
    this.ui = ui;
  }

  init() {
    const stored = storage.load().settings?.theme || storage.load().theme || 'system';
    this.apply(stored);
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  setTheme(theme) {
    this.apply(theme);
  }

  apply(theme) {
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    document.documentElement.setAttribute('data-theme', resolved);
    const state = storage.load();
    state.settings.theme = theme;
    state.theme = resolved;
    storage.save(state);
    this.ui.updateThemeButton(resolved);
  }
}
