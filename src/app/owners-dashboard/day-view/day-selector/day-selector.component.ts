import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-day-selector',
  templateUrl: './day-selector.component.html',
  styleUrls: ['./day-selector.component.css']
})
export class DaySelectorComponent implements OnChanges {
  @Input() currentValue: moment.Moment;

  @Output() onDateChanged = new EventEmitter();

  @Input() options: {
    minDate: moment.Moment,
    maxDate: moment.Moment
  };

  disablePrevious = true;
  disableNext = true;

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

  // ngOnInit() {
    // this.currentValue = moment(this.currentValue);
  // }

  ngOnChanges(o: SimpleChanges) {
    if (o.currentValue && o.currentValue.currentValue) {
      this.currentValue = moment(this.currentValue);
    }
    if (this.options && this.options.minDate) {
      this.setDisable();
    }
  }

  prevDay = (e)=>{
    e.stopPropagation();
    if (this.currentValue.isSame(this.options.minDate, 'day')) return;
    this.onDateChanged.emit(moment(this.currentValue).subtract(1, 'day'));
  }

  nextDay = (e)=>{
    e.stopPropagation();
    if (this.currentValue.isSame(this.options.maxDate, 'day')) return;
    this.onDateChanged.emit(moment(this.currentValue).add(1, 'day'));
  }

}
