export class SearchController {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
    this.query = '';
    this.filter = 'all';
    this.sort = 'newest';
  }

  setState(state) {
    this.state = state;
    this.ui.renderJournal(this.state, this.query, this.filter, this.sort);
  }

  search(query) {
    this.query = query.toLowerCase();
    this.ui.renderJournal(this.state, this.query, this.filter, this.sort);
  }

  setFilter(filter) {
    this.filter = filter;
    this.ui.renderJournal(this.state, this.query, this.filter, this.sort);
  }

  sort(value) {
    this.sort = value;
    this.ui.renderJournal(this.state, this.query, this.filter, this.sort);
  }
}
