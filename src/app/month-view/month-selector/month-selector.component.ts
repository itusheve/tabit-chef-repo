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
  minDateValue: Date = new Date(2017, 1, 1);
  maxDateValue: Date = new Date();

  ngOnInit() {
    this.currentValue = moment(this.currentValue);
  }

  prevMonth = ()=>{
    this.onDateChanged.emit(moment(this.currentValue).subtract(1, 'months'));
  }

  nextMonth = ()=>{
    this.onDateChanged.emit(moment(this.currentValue).add(1, 'months'));
  }

}
