import {Component, Inject} from '@angular/core';
import {MatBottomSheetRef} from '@angular/material';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import {DataService} from '../../../../tabit/data/data.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import {DatePipe} from '@angular/common';
import {environment} from '../../../../environments/environment';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {OwnersDashboardService} from '../../owners-dashboard.service';

@Component({
    selector: 'app-month-selector-dialog',
    templateUrl: 'month-picker-dialog.html',
    styleUrls: ['month-picker-dialog.scss'],
    providers: [DatePipe]
})
export class MonthPickerDialogComponent {

    currentMonth: moment.Moment;
    selection: moment.Moment;
    months: any;
    onDateChanged: any;
    tabitHelper;
    env;
    public incTax;

    constructor(
        private datePipe: DatePipe,
        public bottomSheetRef: MatBottomSheetRef<MonthPickerDialogComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) data,
        private dataService: DataService,
        public ownersDashboardService: OwnersDashboardService) {

        this.env = environment;
        this.tabitHelper = new TabitHelper();
        this.onDateChanged = data.onDateChanged;
        this.currentMonth = data.selected;

        combineLatest(this.dataService.databaseV2$, this.dataService.vat$)
            .subscribe(data => {
                let database = data[0];
                this.incTax = data[1];

                this.months = [];
                _.each(database._data, month => {

                    let summaryCardData = {
                        loading: false,
                        title: this.datePipe.transform(month.latestDay, 'MMMM yyyy'),
                        tag: '',
                        sales: 0,
                        diners: 0,
                        ppa: 0,
                        aggregations: {},
                        averages: {weekly: {percentage: 0, change: 0}},
                        reductions: {},
                        statusClass: ''
                    };

                    let previousMonth = database.getMonth(moment(month.latestDay).subtract(1, 'months'));

                    summaryCardData.diners = month.diners || month.orders;
                    summaryCardData.ppa = this.incTax ? month.ppaIncludeVat : month.ppaIncludeVat / month.vat;
                    summaryCardData.sales = this.incTax ? month.ttlsalesIncludeVat : month.ttlsalesExcludeVat;

                    summaryCardData.averages = {
                        /*yearly: {
                            percentage: month.aggregations.sales.lastYearWeekAvg ? ((month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg) - 1) : 0,
                            change: month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg
                        },*/
                        weekly: {
                            percentage: previousMonth && previousMonth.weekAvg ? ((month.weekAvg / previousMonth.weekAvg) - 1) : 0,
                            change: previousMonth ? (month.weekAvg / previousMonth.weekAvg) * 100 : 0
                        }
                    };

                    summaryCardData.reductions = {
                        cancellations: {
                            percentage: month.prcVoidsAmount / 100,
                            change: previousMonth ? (month.prcVoidsAmount / previousMonth.prcVoidsAmount * 100) : 0
                        },
                        employee: {
                            percentage: month.prcEmployeesAmount / 100,
                            change: previousMonth ? (month.prcEmployeesAmount / previousMonth.prcEmployeesAmount * 100) : 0
                        },
                        operational: {
                            percentage: month.prcOperationalAmount / 100,
                            change: previousMonth ? (month.prcOperationalAmount / previousMonth.prcOperationalAmount * 100) : 0
                        },
                        retention: {
                            percentage: month.prcMrAmount / 100,
                            change: previousMonth ? (month.prcMrAmount / previousMonth.prcMrAmount * 100) : 0
                        }
                    };

                    if (summaryCardData.averages.weekly.percentage) {
                        let value = previousMonth ? (month.weekAvg / previousMonth.weekAvg) * 100 : 0;
                        summaryCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                    }
                    else {
                        summaryCardData.statusClass = '';
                    }

                    summaryCardData.loading = false;

                    if (month.latestDay) {
                        let date = moment(month.latestDay);
                        let selected = false;

                        if (this.currentMonth.isSame(date, 'month')) {
                            selected = true;
                        }

                        this.months.push({
                            date: moment(month.latestDay),
                            sales: month.ttlsalesIncludeVat,
                            salesWithoutVat: month.ttlsalesExcludeVat,
                            selected: selected,
                            summary: summaryCardData
                        });

                        this.months = _.orderBy(this.months, 'date', 'desc');
                    }
                });
            });
    }

    select(event: MouseEvent, month): void {
        this.selection = month.date;
        this.currentMonth = month.date;
        this.bottomSheetRef.dismiss();
        event.preventDefault();
    }
}

