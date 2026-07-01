export const storage = {
  key: 'journalData',

  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return this.getDefaultState();
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        moods: Array.isArray(parsed.moods) ? parsed.moods : [],
        settings: { theme: 'light', fontSize: 16, animations: true, compactMode: false, ...parsed.settings },
        statistics: parsed.statistics || {},
        theme: parsed.theme || 'light'
      };
    } catch (error) {
      console.error('Failed to parse journal storage', error);
      return this.getDefaultState();
    }
  },

  save(state) {
    localStorage.setItem(this.key, JSON.stringify(state));
  },

  reset() {
    localStorage.removeItem(this.key);
  },

  estimateSize() {
    const data = localStorage.getItem(this.key) || '';
    return Math.max(1, Math.round(data.length / 1024));
  },

  getDefaultState() {
    return {
      entries: [],
      moods: [],
      settings: { theme: 'light', fontSize: 16, animations: true, compactMode: false },
      statistics: {},
      theme: 'light'
    };
  }
};
