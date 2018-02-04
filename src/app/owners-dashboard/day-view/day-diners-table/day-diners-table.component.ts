import { Component, OnInit, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-day-diners-table',
  templateUrl: './day-diners-table.component.html',
  styleUrls: ['./day-diners-table.component.css']
})
export class DayDinersTableComponent implements OnInit {

  @Input() data$: Observable<any>;

  decPipe: any = new DecimalPipe('en-US');//TODO use currency pipe instead

  rows: any = {
    header: {},
    diners: {},
    ppa: {},
  };

  constructor() {}

  // render(shifts, dinersAndPPAByShift) {
  // }
  
  ngOnInit() {
    //this.render(this.data.shifts, this.data.dinersAndPPAByShift);
    this.data$.subscribe(data=>{
      this.rows.header.morning = data.shifts.morning.name;
      this.rows.header.afternoon = data.shifts.afternoon.name;
      this.rows.header.evening = data.shifts.evening.name;
    
      this.rows.diners.morning = _.get(data.dinersAndPPAByShift, 'morning.diners', 0) * 1;
      this.rows.diners.afternoon = _.get(data.dinersAndPPAByShift, 'afternoon.diners', 0) * 1;
      this.rows.diners.evening = _.get(data.dinersAndPPAByShift, 'evening.diners', 0) * 1;
    
      this.rows.ppa.morning = _.get(data.dinersAndPPAByShift, 'morning.ppa', 0) * 1;
      this.rows.ppa.afternoon = _.get(data.dinersAndPPAByShift, 'afternoon.ppa', 0) * 1;
      this.rows.ppa.evening = _.get(data.dinersAndPPAByShift, 'evening.ppa', 0) * 1;      
    });
  }

}
