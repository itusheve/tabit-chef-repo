import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';



@Component({
  selector: 'app-month-selector',
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.css']
})
export class MonthSelectorComponent implements OnInit {
  @Input() month$: Observable<moment.Moment>;
  month: moment.Moment;

  @Output() onDateChanged = new EventEmitter();

  //month: Date = new Date();
  minDateValue: moment.Moment = moment('2017-01-01 00:00:00Z');
  maxDateValue: moment.Moment = moment();

  ngOnInit() {
    this.month$.subscribe(month=>this.month=month);
    // this.month = moment(this.month);
  }

  prevMonth = ()=>{
    if (this.month.isSame(this.minDateValue, 'month')) return;
    this.onDateChanged.emit(moment(this.month).subtract(1, 'months'));
  }

  nextMonth = ()=>{
    if (this.month.isSame(this.maxDateValue, 'month')) return;
    this.onDateChanged.emit(moment(this.month).add(1, 'months'));
  }

}
