import {Component, Inject} from '@angular/core';
import {MatBottomSheetRef} from '@angular/material';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';
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

                    let monthState = moment().isSame(month.latestDay, 'month') ? tmpTranslations.get('home.month.notFinalTitle') : '';
                    let summaryCardData = {
                        loading: false,
                        title: this.datePipe.transform(month.latestDay, 'MMMM yyyy', '', this.env.tbtLocale) + ' ' + monthState,
                        tag: '',
                        sales: 0,
                        diners: 0,
                        ppa: 0,
                        aggregations: {},
                        averages: {weekly: {percentage: 0, change: 0}, yearly: {percentage: 0, change: 0}},
                        reductions: {},
                        statusClass: '',
                        showDrillArrow: true
                    };

                    let previousMonth = database.getMonth(moment(month.latestDay).subtract(1, 'months'));
                    let lastYearMonth = database.getMonth(moment(month.latestDay).subtract(1, 'years'));

                    summaryCardData.diners = month.diners || month.orders;
                    summaryCardData.ppa = this.incTax ? month.ppaIncludeVat : month.ppaIncludeVat / month.vat;
                    summaryCardData.sales = this.incTax ? month.ttlsalesIncludeVat : month.ttlsalesExcludeVat;

                    let previousMonthWeekAvg = 0;
                    let lastYearWeekAvg = 0;
                    let currentdaysCounter = 0;
                    let date = moment(month.latestDay);
                    if (date.isSame(moment(), 'month') && date.date() < 7) {
                        _.forEach(month.aggregations.days, (data, weekday) => {
                            if (data && weekday !== moment().day()) {
                                currentdaysCounter++;
                                let lastYearSalesAmount = _.get(lastYearMonth, ['aggregations', 'days', weekday, 'sales', 'avg']);
                                if (lastYearSalesAmount) {
                                    lastYearWeekAvg += lastYearSalesAmount;
                                }

                                let lastMonthSalesAmount = _.get(previousMonth, ['aggregations', 'days', weekday, 'sales', 'avg']);
                                if (lastMonthSalesAmount) {
                                    previousMonthWeekAvg += lastMonthSalesAmount;
                                }
                            }
                        });

                        previousMonthWeekAvg = previousMonthWeekAvg / currentdaysCounter;
                        lastYearWeekAvg = lastYearWeekAvg / currentdaysCounter;
                    }
                    else {
                        previousMonthWeekAvg = _.get(previousMonth, 'weekAvg', 0);
                        lastYearWeekAvg = _.get(lastYearMonth, 'weekAvg', 0);
                    }

                    summaryCardData.averages = {
                        yearly: {
                            percentage: lastYearMonth && lastYearWeekAvg ? ((month.weekAvg / lastYearWeekAvg) - 1) : 0,
                            change: lastYearMonth ? (month.weekAvg / lastYearWeekAvg) * 100 : 0
                        },
                        weekly: {
                            percentage: previousMonth && previousMonthWeekAvg ? ((month.weekAvg / previousMonthWeekAvg) - 1) : 0,
                            change: previousMonth ? (month.weekAvg / previousMonthWeekAvg) * 100 : 0
                        }
                    };

                    let cancellationsPct = (month.prcVoidsAmount / 100 || 0).toFixed(3);
                    let employeePct = (month.prcEmployeesAmount / 100 || 0).toFixed(3);
                    let operationalPct = (month.prcOperationalAmount / 100 || 0).toFixed(3);
                    let retentionPct = (month.prcMrAmount / 100 || 0).toFixed(3);


                    let prevMonthCancellationsPct = 1;
                    let prevMonthEmployeePct = 1;
                    let prevMonthOperationalPct = 1;
                    let prevMonthRetentionPct = 1;
                    if(previousMonth) {
                        prevMonthCancellationsPct = (previousMonth.prcVoidsAmount / 100 || 0).toFixed(3);
                        prevMonthEmployeePct = (previousMonth.prcEmployeesAmount / 100 || 0).toFixed(3);
                        prevMonthOperationalPct = (previousMonth.prcOperationalAmount / 100 || 0).toFixed(3);
                        prevMonthRetentionPct = (previousMonth.prcMrAmount / 100 || 0).toFixed(3);
                    }

                    summaryCardData.reductions = {
                        cancellations: {
                            percentage: cancellationsPct|| 0,
                            change: cancellationsPct / prevMonthCancellationsPct * 100 || 0
                        },
                        employee: {
                            percentage: employeePct || 0,
                            change: employeePct / prevMonthEmployeePct * 100 || 0
                        },
                        operational: {
                            percentage: operationalPct || 0,
                            change: operationalPct / prevMonthOperationalPct * 100 || 0
                        },
                        retention: {
                            percentage: retentionPct || 0,
                            change: retentionPct / prevMonthRetentionPct * 100 || 0
                        }
                    };

                    if (summaryCardData.averages.weekly.percentage) {
                        let value = previousMonth ? (month.weekAvg / previousMonthWeekAvg) * 100 : 0;
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
        this.onDateChanged(this.selection);
        this.bottomSheetRef.dismiss();
        event.preventDefault();
    }

    goHome() {
        this.ownersDashboardService.toolbarConfig.home.goHome();
        this.bottomSheetRef.dismiss();
    }
}

