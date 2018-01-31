import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-day-diners-table',
  templateUrl: './day-diners-table.component.html',
  styleUrls: ['./day-diners-table.component.css']
})
export class DayDinersTableComponent implements OnInit {

  @Input() data: any;

  decPipe: any = new DecimalPipe('en-US');//TODO use currency pipe instead

  rows: any = {
    header: {},
    diners: {},
    ppa: {},
  };

  constructor() {}

  render(shifts, dinersAndPPAByShift) {
    this.rows.header.morning = shifts.morning.name;
    this.rows.header.afternoon = shifts.afternoon.name;
    this.rows.header.evening = shifts.evening.name;

    this.rows.diners.morning = _.get(dinersAndPPAByShift, 'morning.diners', 0) * 1;
    this.rows.diners.afternoon = _.get(dinersAndPPAByShift, 'afternoon.diners', 0) * 1;
    this.rows.diners.evening = _.get(dinersAndPPAByShift, 'evening.diners', 0) * 1;

    this.rows.ppa.morning = _.get(dinersAndPPAByShift, 'morning.ppa', 0) * 1;
    this.rows.ppa.afternoon = _.get(dinersAndPPAByShift, 'afternoon.ppa', 0) * 1;
    this.rows.ppa.evening = _.get(dinersAndPPAByShift, 'evening.ppa', 0) * 1;
  }

  ngOnInit() {
    this.render(this.data.shifts, this.data.dinersAndPPAByShift);
  }

}
