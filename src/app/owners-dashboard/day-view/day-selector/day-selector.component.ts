import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-day-selector',
  templateUrl: './day-selector.component.html',
  styleUrls: ['./day-selector.component.css']
})
export class DaySelectorComponent implements OnInit, OnChanges {
  @Input() currentValue: moment.Moment;

  @Output() onDateChanged = new EventEmitter();

  @Input() options: {
    minDate: moment.Moment,
    maxDate: moment.Moment
  };

  disablePrevious = false;
  disableNext = false;

  private setDisable() {
    if (this.currentValue.isSame(this.options.minDate, 'day')) {
      this.disablePrevious = true;
    } else {
      this.disablePrevious = false;
    }

    if (this.currentValue.isSame(this.options.maxDate, 'day')) {
      this.disableNext = true;
    } else {
      this.disableNext = false;
    }
  }

  ngOnInit() {
    this.currentValue = moment(this.currentValue);
  }

  ngOnChanges() {
    this.setDisable();
  }

  prevDay = ()=>{
    if (this.currentValue.isSame(this.options.minDate, 'day')) return;
    this.onDateChanged.emit(moment(this.currentValue).subtract(1, 'day'));
  }

  nextDay = ()=>{
    if (this.currentValue.isSame(this.options.maxDate, 'day')) return;
    this.onDateChanged.emit(moment(this.currentValue).add(1, 'day'));
  }

}
