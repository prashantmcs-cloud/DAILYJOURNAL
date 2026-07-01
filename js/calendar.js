export class CalendarView {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
    this.currentDate = new Date();
  }

  setState(state) {
    this.state = state;
  }

  changeMonth(step) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + step, 1);
    this.ui.renderCalendar(this.state, this.currentDate);
  }
}
