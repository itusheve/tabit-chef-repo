import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material';
import * as moment from 'moment';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-day-selector',
    templateUrl: './day-selector.component.html',
    styleUrls: ['./day-selector.component.css']
})
export class DaySelectorComponent implements OnChanges {
    @Output() onDateChanged = new EventEmitter();

    @Input() currentValue: moment.Moment;
    @Input() dayFromDatabase: any;
    @Input() options: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    public picker;
    public datePickerMaxDate;
    disablePrevious = true;
    disableNext = true;

    public region: any;

    constructor() {
        this.datePickerMaxDate = new Date();
        this.region = environment.region;
    }

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

    prevDay = (e) => {
        e.stopPropagation();
        if (this.currentValue.isSame(this.options.minDate, 'day')) return;
        this.onDateChanged.emit(this.currentValue.subtract(1, 'day'));
    }

    nextDay = (e) => {
        e.stopPropagation();
        if (this.currentValue.isSame(this.options.maxDate, 'day')) return;
        this.onDateChanged.emit(this.currentValue.add(1, 'day'));
    }

    changeDate(event: MatDatepickerInputEvent<Date>) {
        this.currentValue = moment(event.value);
        this.onDateChanged.emit(this.currentValue);
    }

}
