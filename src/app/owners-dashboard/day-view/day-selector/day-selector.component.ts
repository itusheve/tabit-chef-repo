import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import * as moment from 'moment';



@Component({
  selector: 'app-day-selector',
  templateUrl: './day-selector.component.html',
  styleUrls: ['./day-selector.component.css']
})
export class DaySelectorComponent implements OnInit {
  @Input() currentValue: moment.Moment;

  @Output() onDateChanged = new EventEmitter();

  //currentValue: Date = new Date();
  minDateValue: moment.Moment = moment().subtract(2, 'year').startOf('month');//TODO bring from config
  maxDateValue: moment.Moment = moment().subtract(1, 'days');

  ngOnInit() {
    this.currentValue = moment(this.currentValue);
  }

  prevDay = ()=>{
    if (this.currentValue.isSame(this.minDateValue, 'day')) return;
    this.onDateChanged.emit(moment(this.currentValue).subtract(1, 'day'));
  }

  nextDay = ()=>{
    if (this.currentValue.isSame(this.maxDateValue, 'day')) return;
    this.onDateChanged.emit(moment(this.currentValue).add(1, 'day'));
  }

}
