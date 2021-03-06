import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material';
import * as moment from 'moment';
import {environment} from '../../../../environments/environment';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import {OverlayModule} from '@angular/cdk/overlay';

@Component({
    selector: 'app-day-selector',
    templateUrl: './day-selector.component.html',
    styleUrls: ['./day-selector.component.css'],
})
export class DaySelectorComponent implements OnChanges {
    @Output() onDateChanged = new EventEmitter();

    @Input() currentValue: moment.Moment;
    @Input() dayFromDatabase: any;
    @Input() percentageChange: any;
    @Input() options: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    public picker;
    public datePickerMaxDate;
    public env;
    disablePrevious = true;
    disableNext = true;

    public region: any;
    private tabitHelper;
    constructor() {
        this.datePickerMaxDate = new Date();
        this.region = environment.region;
        this.tabitHelper = new TabitHelper();
        this.env = environment;
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
                    // this function move to new service date-selector-service
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
        this.currentValue = moment.utc(event.value.toDateString());
        this.onDateChanged.emit(this.currentValue);
    }

    getPickerBackground(day) {
        if(day) {
            return this.tabitHelper.getColorClassByPercentage(this.percentageChange, true);
        }
        else {
            return 'bg-secondary text-white';
        }

    }
}
