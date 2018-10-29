import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {MatBottomSheet} from '@angular/material';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {MonthPickerDialogComponent} from './month-picker-dialog.component';
import {DataService} from '../../../../tabit/data/data.service';

@Component({
    selector: 'app-month-selector',
    templateUrl: './month-selector.component.html',
    styleUrls: ['./month-selector.component.css']
})
export class MonthSelectorComponent implements OnInit {
    options: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    month: moment.Moment;
    final: string;

    @Output() onDateChanged = new EventEmitter();

    public region: any;
    public env: any;

    constructor(private dataService: DataService) {
        this.region = environment.region;
        this.env = environment;
    }

    disablePrevious = '';
    disableNext = '';

    private disableButton() {
        if (this.month.isSame(this.options.minDate, 'month')) {
            this.disablePrevious = 'disabled';
        } else {
            this.disablePrevious = '';
        }

        if (this.month.isSame(this.options.maxDate, 'month')) {
            this.disableNext = 'disabled';
        } else {
            this.disableNext = '';
        }
    }

    ngOnInit() {
        this.dataService.databaseV2$.subscribe(database => {
            this.options = {
                minDate: moment(database.getLowestDate()),
                maxDate: moment()
            };
        });

        this.dataService.selectedMonth$.subscribe(month => {
            this.month = month;
        });
    }

    getFinalState(month: moment.Moment) {
        return moment().isSame(month, 'month') ? 'notFinal' : 'final';
    }

    prevMonth = () => {
        if (this.month.isSame(this.options.minDate, 'month')) return;
        this.onDateChanged.emit(moment(this.month).subtract(1, 'months'));
        this.final = this.getFinalState(this.month);
    }

    nextMonth = () => {
        if (this.month.isSame(this.options.maxDate, 'month')) return;
        this.onDateChanged.emit(moment(this.month).add(1, 'months'));
        this.final = this.getFinalState(this.month);
    }
}

