import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {take} from 'rxjs/operators';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {CardData} from '../../ui/card/card.component';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';
import {MatBottomSheet} from '@angular/material';
import {MonthPickerDialogComponent} from './month-selector/month-picker-dialog.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [DatePipe]
})
export class HomeComponent implements OnInit {

    currentBdCardData: CardData = {
        loading: true,
        title: '',
        tag: 'currentBd',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
    };

    previousBdCardData: CardData = {
        loading: true,
        title: '',
        tag: 'previousBd',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
    };

    showForecast: boolean;
    forecastCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        aggregations: {},
        type: 'forecast'
    };

    private previousBdNotFinal = false;
    public showPreviousDay = false;
    public tabitHelper;
    public loadingOlapData: boolean;
    public OlapFailed: boolean;
    public olapError: any;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private dataService: DataService,
                private router: Router,
                private monthPickerDialog: MatBottomSheet,
                private datePipe: DatePipe) {

        this.tabitHelper = new TabitHelper();
        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;
        ownersDashboardService.toolbarConfig.settings.show = true;
        ownersDashboardService.toolbarConfig.center.showVatComment = true;
    }

    ngOnInit() {
        this.loadingOlapData = true;
        this.currentBdCardData.loading = true;

        this.OlapFailed = false;
        this.showForecast = false;
        window.scrollTo(0, 0);

        this.initRefreshSubscriber();
        this.getTodayData();
        this.getTodayOlapData();
        this.getYesterdayData();
        this.getForecastData();
    }

    initRefreshSubscriber(): void {
        this.dataService.refresh$.subscribe((refresh) => {
            if (refresh === 'force') {
                this.loadingOlapData = true;
                this.currentBdCardData.loading = true;
            }
        });
    }

    openMonthPicker() {
        let dialog = this.monthPickerDialog.open(MonthPickerDialogComponent, {
            data: {selected: this.dataService.selectedMonth$.value, onDateChanged: this.onDateChanged},
            hasBackdrop: true,
            closeOnNavigation: true,
            backdropClass: 'month-picker-backdrop',
            autoFocus: false
        });

        dialog.afterDismissed().subscribe(() => {
            /*if (dialog.instance.selection) {
                this.onDateChanged(dialog.instance.selection);
            }*/
            let item = document.getElementById('monthSelector');// what we want to scroll to
            let wrapper = document.getElementById('main-content');// the wrapper we will scroll inside
            let header = document.getElementById('main-toolbar');// the wrapper we will scroll inside
            let count = item.offsetTop - wrapper.scrollTop - header.scrollHeight - 10; // xx = any extra distance from top ex. 60
            wrapper.scrollBy({top: count, left: 0, behavior: 'smooth'});
        });
    }

    getTodayData(): void {
        combineLatest(this.dataService.dailyTotals$, this.dataService.olapToday$, this.dataService.vat$, this.dataService.currentRestTime$)
            .subscribe(data => {
                let dailyTotals = data[0];
                let day = data[1];
                let incTax = data[2];
                let restTime = data[3];
                let realtimeDataDate = moment(dailyTotals.businessDate);

                let totals = dailyTotals.totals;
                let totalClosedOrders = _.get(totals, 'totalPayments', 0);
                let totalClosedOrdersWithoutVat = totalClosedOrders - _.get(totals, 'includedTax', 0);

                let totalOpenOrders = _.get(totals, 'openOrders.totalAmount', 0);
                let totalOpenOrdersWithoutVat = totalOpenOrders - _.get(totals, 'openOrders.totalIncludedTax', 0);


                let totalSales = (totalClosedOrders + totalOpenOrders) / 100;
                let totalSalesWithoutTax = (totalClosedOrdersWithoutVat + totalOpenOrdersWithoutVat) / 100;

                if (!restTime.isSame(realtimeDataDate, 'day')) {
                    this.currentBdCardData.salesComment = 'eod';
                }

                this.currentBdCardData.sales = incTax ? totalSales : totalSalesWithoutTax;
                this.currentBdCardData.title = this.datePipe.transform(moment(day.date).valueOf(), 'EEEEE, MMMM d');

                this.currentBdCardData.averages = {
                    /*yearly: {
                        percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                        change: (day.aggregations.sales.amount / day.aggregations.sales.yearAvg)
                    },*/
                    weekly: {
                        percentage: totalSales ? ((totalSales / day.aggregations.sales.fourWeekAvg) - 1) : 0,
                        change: (totalSales / day.aggregations.sales.fourWeekAvg) * 100
                    }
                };

                if (this.currentBdCardData.averages.weekly.change) {
                    let value = (this.currentBdCardData.averages.weekly.change);
                    this.currentBdCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }

                if (typeof this.currentBdCardData.sales === 'number') {
                    this.currentBdCardData.loading = false;
                }

                this.currentBdCardData.showDrillArrow = true;
            });
    }

    getTodayOlapData(): void {
        combineLatest(this.dataService.databaseV2$, this.dataService.vat$).subscribe(data => {
            let database = data[0];
            let incTax = data[1];
            let restaurantTime = this.dataService.getCurrentRestTime();

            let day = database.getDay(restaurantTime);
            if (day) {
                this.currentBdCardData.holiday = day.holiday;

                this.currentBdCardData.diners = day.diners || day.orders;
                this.currentBdCardData.ppa = incTax ? day.ppaIncludeVat : day.ppaIncludeVat / day.vat;

                this.currentBdCardData.reductions = {
                    cancellations: {
                        percentage: day.voidsPrc / 100,
                        change: day.voidsPrc - day.avgNweeksVoidsPrc
                    },
                    employee: {
                        percentage: day.employeesPrc / 100,
                        change: day.employeesPrc - day.avgNweeksEmployeesPrc
                    },
                    operational: {
                        percentage: day.operationalPrc / 100,
                        change: day.operationalPrc - day.avgNweeksOperationalPrc
                    },
                    retention: {
                        percentage: day.mrPrc / 100,
                        change: day.mrPrc - day.avgNweeksMrPrc
                    }
                };
            }
        });
    }


    getYesterdayData(): void {
        combineLatest(this.dataService.databaseV2$, this.dataService.currentRestTime$, this.dataService.vat$)
            .subscribe(data => {
                this.previousBdCardData.loading = true;
                this.loadingOlapData = true;
                let database = data[0];
                let restaurantTime = data[1];
                let incVat = data[2];

                if (!database || database.error) {
                    this.OlapFailed = true;
                    this.olapError = database && database.error;
                    return;
                }

                let previousDay = moment(restaurantTime).subtract(1, 'days');
                let day = database.getDay(previousDay);

                const title = this.datePipe.transform(previousDay.valueOf(), 'EEEEE, MMMM d');
                if (!day) {
                    this.showPreviousDay = false;
                    this.previousBdCardData.salesComment = 'noData';
                    this.previousBdNotFinal = true;
                    this.previousBdCardData.loading = false;
                }
                else {
                    this.showPreviousDay = true;

                    this.previousBdCardData.holiday = day.holiday;
                    this.previousBdCardData.diners = day.diners || day.orders;
                    this.previousBdCardData.ppa = incVat ? day.ppaIncludeVat : day.ppaIncludeVat / day.vat;
                    this.previousBdCardData.sales = incVat ? day.salesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountExcludeVat;
                    this.previousBdCardData.averages = {
                        /*yearly: {
                            percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                            change: day.aggregations.sales.amount / day.aggregations.sales.yearAvg
                        },*/
                        weekly: {
                            percentage: ((day.salesAndRefoundAmountIncludeVat / day.AvgNweeksSalesAndRefoundAmountIncludeVat) - 1),
                            change: (day.salesAndRefoundAmountIncludeVat / day.AvgNweeksSalesAndRefoundAmountIncludeVat) * 100
                        }
                    };

                    this.previousBdCardData.reductions = {
                        cancellations: {
                            percentage: day.voidsPrc / 100,
                            change: day.voidsPrc - day.avgNweeksVoidsPrc
                        },
                        employee: {
                            percentage: day.employeesPrc / 100,
                            change: day.employeesPrc - day.avgNweeksEmployeesPrc
                        },
                        operational: {
                            percentage: day.operationalPrc / 100,
                            change: day.operationalPrc - day.avgNweeksOperationalPrc
                        },
                        retention: {
                            percentage: day.mrPrc / 100,
                            change: day.mrPrc - day.avgNweeksMrPrc
                        }
                    };

                    if (this.previousBdCardData.averages.weekly.percentage) {
                        let value = (this.previousBdCardData.averages.weekly.change);
                        this.previousBdCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                    }
                }

                this.previousBdCardData.title = title;
                this.previousBdCardData.showDrillArrow = true;
                this.previousBdCardData.loading = false;
            });
    }


    getForecastData(): void {
        combineLatest(this.dataService.databaseV2$, this.dataService.vat$)
            .subscribe(data => {
                this.forecastCardData.loading = true;
                let database = data[0];
                let incTax = data[1];

                let month = database.getCurrentMonth();
                this.loadingOlapData = false;
                if (!month.latestDay || moment(month.latestDay).isBefore(moment(), 'month')) {
                    this.showForecast = false;
                    this.forecastCardData.loading = false;
                    return;
                }

                this.forecastCardData.averages = {yearly: {}, weekly: {}};

                let lastYearMonth = database.getMonth(moment().subtract(1, 'years'));
                let previousMonth = database.getMonth(moment().subtract(1, 'months'));
                if (lastYearMonth && lastYearMonth.aggregations && lastYearMonth.aggregations.sales) {
                    this.forecastCardData.averages.yearly = {
                        percentage: lastYearMonth.aggregations.sales.amount ? ((month.forecast.sales.amount / lastYearMonth.aggregations.sales.amount) - 1) : 0,
                        change: month.forecast.sales.amount / lastYearMonth.aggregations.sales.amount * 100
                    };
                }

                this.forecastCardData.title = `${this.datePipe.transform(moment(month.latestDay).startOf('month'), 'MMMM')} ${tmpTranslations.get('home.month.expected')}`;
                this.forecastCardData.diners = month.forecast.diners.count || month.forecast.orders.count;
                this.forecastCardData.sales = incTax ? month.forecast.sales.amount : month.forecast.sales.amountWithoutVat;

                let ppa = this.forecastCardData.sales / this.forecastCardData.diners;
                this.forecastCardData.ppa = incTax ? ppa : ppa / month.vat;

                this.forecastCardData.loading = false;
                this.forecastCardData.noSeparator = true;

                this.forecastCardData.averages.weekly = {
                    percentage: previousMonth ? ((month.forecast.sales.amount / previousMonth.forecast.sales.amount) - 1) : 0,
                    change: previousMonth ? (month.forecast.sales.amount / previousMonth.forecast.sales.amount) * 100 : 0
                };

                this.showForecast = moment().diff(moment(database.getLowestDate()), 'days') > 8; //do not show forecast for new businesses with less than 8 days of data

                if (this.forecastCardData.averages.weekly.percentage) {
                    let value = (month.forecast.sales.amount / previousMonth.forecast.sales.amount) * 100;
                    this.forecastCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }
            });
    }

    onDayRequest(date: string) {
        if (date === 'currentBD') {
            this.dataService.currentRestTime$.pipe(take(1)).subscribe(cbd => {
                date = cbd.format('YYYY-MM-DD');
                this.router.navigate(['/owners-dashboard/day', date]);
            });
        } else if (date === 'previousBD') {
            if (this.previousBdNotFinal) {
                return;
            }
            this.dataService.previousBd$.pipe(take(1)).subscribe(pbd => {
                date = pbd.format('YYYY-MM-DD');
                this.router.navigate(['/owners-dashboard/day', date]);
            });
        } else {
            this.router.navigate(['/owners-dashboard/day', date]);
        }
    }

    onDateChanged(mom: moment.Moment) {
        const month = moment(mom).startOf('month');
        this.dataService.selectedMonth$.next(month);
    }

    isCurrentMonth() {
        return this.dataService.selectedMonth$.value.isSameOrAfter(moment(), 'month');
    }
}
