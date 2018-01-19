import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import * as moment from 'moment';



@Component({
  selector: 'app-month-selector',
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.css']
})
export class MonthSelectorComponent implements OnInit {
  @Input() currentValue: moment.Moment;

  @Output() onDateChanged = new EventEmitter();

  //currentValue: Date = new Date();
  minDateValue: moment.Moment = moment('2017-01-01 00:00:00Z');
  maxDateValue: moment.Moment = moment();

  ngOnInit() {
    this.currentValue = moment(this.currentValue);
  }

  prevMonth = ()=>{
    if (this.currentValue.isSame(this.minDateValue, 'month')) return;
    this.onDateChanged.emit(moment(this.currentValue).subtract(1, 'months'));
  }

  nextMonth = ()=>{
    if (this.currentValue.isSame(this.maxDateValue, 'month')) return;
    this.onDateChanged.emit(moment(this.currentValue).add(1, 'months'));
  }

}
