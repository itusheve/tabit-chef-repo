import {Component, Inject} from '@angular/core';
import {MatBottomSheetRef} from '@angular/material';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import {DataService} from '../../../../tabit/data/data.service';

@Component({
    selector: 'app-month-selector-dialog',
    templateUrl: 'month-picker-dialog.html',
    styleUrls: ['month-picker-dialog.css']
})
export class MonthPickerDialogComponent {

    currentMonth: moment.Moment;
    selection: moment.Moment;
    months: any;
    onDateChanged: any;

    constructor(
        private bottomSheetRef: MatBottomSheetRef<MonthPickerDialogComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) data,
        private dataService: DataService) {

        this.onDateChanged = data.onDateChanged;
        this.currentMonth = data.selected;
        this.dataService.databaseV2$.subscribe(database => {
            this.months = [];
            _.each(database._data, month => {

                if(month.latestDay) {
                    let date = moment(month.latestDay);
                    let selected = false;

                    if (this.currentMonth.isSame(date, 'month')) {
                        selected = true;
                    }

                    this.months.push({
                        date: moment(month.latestDay),
                        sales: month.ttlsalesIncludeVat,
                        salesWithoutVat: month.ttlsalesExcludeVat,
                        selected: selected
                    });

                    this.months = _.orderBy(this.months, 'date', 'desc');
                }
            });
        });
    }

    select(event: MouseEvent, month): void {
        this.selection = month.date;
        this.currentMonth = month.date;
        this.onDateChanged.emit(this.selection);
        this.bottomSheetRef.dismiss();
        event.preventDefault();
    }
}

