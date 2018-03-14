import { Component } from '@angular/core';
import { Shift } from '../../../../tabit/model/Shift.model';

// @Component({
//   selector: 'app-day-shifts',
//   templateUrl: './day-shifts.component.html',
//   styleUrls: ['./day-shifts.component.css']
// })
export class DayShiftsComponent {

  shifts: Shift[];
  show = false;

  constructor() {}

  render(shifts:Shift[]) {
    this.shifts = shifts;
    this.show = true;
  }

}
