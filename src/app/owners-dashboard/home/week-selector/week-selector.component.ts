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
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-week-selector',
    templateUrl: 'week-selector.html',
    styleUrls: ['week-selector.scss'],
    providers: [DatePipe]
})
export class WeekSelectorComponent {

    currentMonth: moment.Moment;
    selection: moment.Moment;
    months: any;
    onDateChanged: any;
    tabitHelper;
    env;
    public incTax;
    public weeks: any;

    constructor(
        private datePipe: DatePipe,
        public bottomSheetRef: MatBottomSheetRef<WeekSelectorComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) data,
        private dataService: DataService,
        public translate: TranslateService,
        public ownersDashboardService: OwnersDashboardService) {
        this.env = environment;
        this.tabitHelper = new TabitHelper();
        this.onDateChanged = data.onDateChanged;
        this.currentMonth = data.selected;
        this.weeks = [];

        combineLatest(this.dataService.databaseV2$, this.dataService.currentRestTime$, this.dataService.vat$)
            .subscribe(async data => {
                let database = data[0];
                let restTime = data[1];
                let incVat = data[2];

                let weeks = database.getWeeks();
                let settings = database.getSettings();
                if (settings.weekStartDay === 1) {
                    restTime = moment(restTime).locale('en_GB');
                }

                _.forEach(weeks, byYear => {
                    byYear.forEach(week => {
                        let title = '';
                        if (restTime.weekYear() === week.details.year && restTime.week() === week.details.number) {
                            this.translate.get('weekToDate').subscribe((res: string) => {
                                title = res;
                            });
                        }
                        else {
                            this.translate.get('weekSales').subscribe((res: string) => {
                                title = res;
                            });
                        }

                        if (!week.startDate) {
                            return;
                        }

                        title += ' ' + week.details.number + ', ' + week.startDate.format(this.env.region === 'us' ? 'M/D/YY' : 'D/M/YY');

                        let dinersOrders = week.diners || week.orders;
                        let sales = incVat ? week.sales.total : week.sales.totalWithoutVat;
                        let weekToDateCard = {
                            loading: false,
                            title: title,
                            tag: '',
                            sales: sales,
                            diners: dinersOrders,
                            ppa: sales / dinersOrders,
                            ppaOrders: sales / week.orders,
                            averages: {
                                weekly: {
                                    percentage: 0,
                                    change: 0
                                },
                                yearly: {
                                    percentage: 0,
                                    change: 0
                                }
                            },
                            reductions: {},
                            statusClass: ''
                        };

                        let previousWeek = database.getWeekByDate(moment(week.startDate).subtract(1, 'week'));
                        let lastYearWeek = database.getWeek(week.details.year - 1, week.details.number);

                        let previousWeeksAvgs = {
                            sales: 0,
                            cancellations: 0,
                            employees: 0,
                            operational: 0,
                            retention: 0,
                        };
                        let weekCounter = 0;
                        for (let i = 1; i <= 4; i++) {
                            let historicWeek = database.getWeekByDate(moment(week.startDate).subtract(i, 'weeks'));
                            if (historicWeek) {
                                if (restTime.weekYear() === week.details.year && restTime.week() === week.details.number) {
                                    let counter = 0;
                                    _.forEach(historicWeek.days, day => {
                                        if (counter < week.daysInWeek) {
                                            previousWeeksAvgs.sales += _.get(day, ['sales', 'total']);
                                            previousWeeksAvgs.cancellations += _.get(day, ['reductions', 'cancellations']);
                                            previousWeeksAvgs.employees += _.get(day, ['reductions', 'employees']);
                                            previousWeeksAvgs.operational += _.get(day, ['reductions', 'operational']);
                                            previousWeeksAvgs.retention += _.get(day, ['reductions', 'retention']);
                                            counter++;
                                        }
                                    });
                                }
                                else {
                                    previousWeeksAvgs.sales += _.get(historicWeek, ['sales', 'total']);
                                    previousWeeksAvgs.cancellations += _.get(previousWeek, ['reductions', 'cancellations']);
                                    previousWeeksAvgs.employees += _.get(previousWeek, ['reductions', 'employees']);
                                    previousWeeksAvgs.operational += _.get(previousWeek, ['reductions', 'operational']);
                                    previousWeeksAvgs.retention += _.get(previousWeek, ['reductions', 'retention']);
                                }
                                weekCounter++;
                            }

                            _.set(historicWeek, 'weekAvg', {data: previousWeeksAvgs, counter: weekCounter});
                        }

                        if (weekCounter) {
                            previousWeeksAvgs.sales = previousWeeksAvgs.sales / weekCounter;
                            previousWeeksAvgs.cancellations = previousWeeksAvgs.cancellations / weekCounter;
                            previousWeeksAvgs.employees = previousWeeksAvgs.employees / weekCounter;
                            previousWeeksAvgs.operational = previousWeeksAvgs.operational / weekCounter;
                            previousWeeksAvgs.retention = previousWeeksAvgs.retention / weekCounter;
                        }

                        let lastYearWeeksAvgs = {
                            sales: 0,
                            cancellations: 0,
                            employees: 0,
                            operational: 0,
                            retention: 0,
                        };
                        if (lastYearWeek) {
                            if (restTime.weekYear() === week.details.year && restTime.week() === week.details.number) {
                                let counter = 0;
                                _.forEach(lastYearWeek.days, day => {
                                    if (counter < week.daysInWeek) {
                                        lastYearWeeksAvgs.sales += _.get(day, ['sales', 'total']);
                                        lastYearWeeksAvgs.cancellations += _.get(day, ['reductions', 'cancellations']);
                                        lastYearWeeksAvgs.employees += _.get(day, ['reductions', 'employees']);
                                        lastYearWeeksAvgs.operational += _.get(day, ['reductions', 'operational']);
                                        lastYearWeeksAvgs.retention += _.get(day, ['reductions', 'retention']);
                                        counter++;
                                    }
                                });
                            }
                            else {
                                lastYearWeeksAvgs.sales += _.get(lastYearWeek, ['sales', 'total']);
                                lastYearWeeksAvgs.cancellations += _.get(lastYearWeek, ['reductions', 'cancellations']);
                                lastYearWeeksAvgs.employees += _.get(lastYearWeek, ['reductions', 'employees']);
                                lastYearWeeksAvgs.operational += _.get(lastYearWeek, ['reductions', 'operational']);
                                lastYearWeeksAvgs.retention += _.get(lastYearWeek, ['reductions', 'retention']);
                            }
                        }


                        weekToDateCard.averages = {
                            yearly: {
                                percentage: ((week.sales.total / lastYearWeeksAvgs.sales) - 1),
                                change: (week.sales.total / lastYearWeeksAvgs.sales) * 100
                            },
                            weekly: {
                                percentage: ((week.sales.total / previousWeeksAvgs.sales) - 1),
                                change: (week.sales.total / previousWeeksAvgs.sales) * 100
                            }
                        };


                        let cancellationsPct = +(week.reductions.cancellations / week.sales.total).toFixed(3);
                        let employeePct = +(week.reductions.employees / week.sales.total).toFixed(3);
                        let operationalPct = +(week.reductions.operational / week.sales.total).toFixed(3);
                        let retentionPct = +(week.reductions.retention / week.sales.total).toFixed(3);

                        let prevWeekCancellationsPct = +(previousWeeksAvgs.cancellations / previousWeeksAvgs.sales).toFixed(3);
                        let prevWeekEmployeePct = +(previousWeeksAvgs.employees / previousWeeksAvgs.sales).toFixed(3);
                        let prevWeekOperationalPct = +(previousWeeksAvgs.operational / previousWeeksAvgs.sales).toFixed(3);
                        let prevWeekRetentionPct = +(previousWeeksAvgs.retention / previousWeeksAvgs.sales).toFixed(3);

                        weekToDateCard.reductions = {
                            cancellations: {
                                percentage: cancellationsPct || 0,
                                change: cancellationsPct / prevWeekCancellationsPct * 100 || 0
                            },
                            employee: {
                                percentage: employeePct || 0,
                                change: employeePct / prevWeekEmployeePct * 100 || 0
                            },
                            operational: {
                                percentage: operationalPct || 0,
                                change: operationalPct / prevWeekOperationalPct * 100 || 0
                            },
                            retention: {
                                percentage: retentionPct || 0,
                                change: retentionPct / prevWeekRetentionPct * 100 || 0
                            }
                        };

                        if (weekToDateCard.averages.weekly.percentage) {
                            let value = (weekToDateCard.averages.weekly.change);
                            weekToDateCard.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                        }

                        this.weeks.unshift(weekToDateCard);
                    });
                });
            });
    }

    goHome() {
        this.ownersDashboardService.toolbarConfig.home.goHome();
        this.bottomSheetRef.dismiss();
    }
}

