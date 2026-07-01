export class StatisticsController {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
  }

  setState(state) {
    this.state = state;
    this.ui.renderStatistics(this.state);
  }
}
