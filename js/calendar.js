export class CalendarView {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  setState(state) {
    this.state = state;
  }

  changeMonth(step) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + step, 1);
    this.ui.renderCalendar(this.state, this.currentDate, this.selectedDate);
  }

  selectDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    this.selectedDate = new Date(year, month - 1, day);
    this.currentDate = new Date(year, month - 1, 1);
    this.ui.renderCalendar(this.state, this.currentDate, this.selectedDate);
  }
}
