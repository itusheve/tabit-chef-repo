import { Component } from '@angular/core';

@Component({
  selector: 'app-day-shifts',
  templateUrl: './day-shifts.component.html',
  styleUrls: ['./day-shifts.component.css']
})
export class DayShiftsComponent {

  shifts: any;
  show = false;

  constructor() {}

  render(shifts) {
    this.shifts = shifts;
    this.show = true;
  }

}
