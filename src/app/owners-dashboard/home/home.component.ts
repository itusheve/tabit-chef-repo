import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {take} from 'rxjs/operators';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {CardData} from '../../ui/card/card.component';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';

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
                private datePipe: DatePipe) {

        this.tabitHelper = new TabitHelper();
        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;
        ownersDashboardService.toolbarConfig.settings.show = true;
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

    getTodayData(): void {
        combineLatest(this.dataService.LatestBusinessDayDashboardData$, this.dataService.olapToday$, this.dataService.vat$, this.dataService.currentRestTime$)
            .subscribe(data => {
                let realtimeData = data[0];
                let day = data[1];
                let incTax = data[2];
                let restTime = data[3];

                let totalSales = 0;
                let totalSalesWithoutTax = 0;

                let realtimeDataDate = moment(realtimeData.today.businessDate);
                let today = moment();

                if (realtimeData.today && realtimeDataDate.date() === today.date()) {
                    totalSales = realtimeData.today.totalSales;
                    totalSalesWithoutTax = realtimeData.today.totalSalesBeforeTax;
                }

                if (!restTime.isSame(realtimeDataDate, 'day')) {
                    this.currentBdCardData.salesComment = 'eod';
                }

                this.currentBdCardData.sales = incTax ? totalSales : totalSalesWithoutTax;
                this.currentBdCardData.diners = realtimeData.today.totalDiners;
                this.currentBdCardData.ppa = incTax ? realtimeData.today.ppa : realtimeData.today.ppaBeforeTax;

                this.currentBdCardData.title = this.datePipe.transform(moment(day.date).valueOf(), 'fullDate');

                this.currentBdCardData.averages = {
                    /*yearly: {
                        percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                        change: (day.aggregations.sales.amount / day.aggregations.sales.yearAvg)
                    },*/
                    weekly: {
                        percentage: totalSales ? ((totalSales / day.aggregations.sales.fourWeekAvg) - 1) : 0,
                        change: (totalSales / day.aggregations.sales.fourWeekAvg)
                    }
                };

                if (day.aggregations.reductions) {
                    this.currentBdCardData.reductions = {
                        cancellations: {
                            percentage: day.aggregations.reductions.cancellations.percentage,
                            change: (day.aggregations.reductions.cancellations.percentage / day.aggregations.reductions.cancellations.fourWeekAvgPercentage)
                        },
                        employee: {
                            percentage: day.aggregations.reductions.employee.percentage,
                            change: (day.aggregations.reductions.employee.percentage / day.aggregations.reductions.employee.fourWeekAvgPercentage)
                        },
                        operational: {
                            percentage: day.aggregations.reductions.operational.percentage,
                            change: (day.aggregations.reductions.operational.percentage / day.aggregations.reductions.operational.fourWeekAvgPercentage)
                        },
                        retention: {
                            percentage: day.aggregations.reductions.retention.percentage,
                            change: day.aggregations.reductions.retention.percentage / day.aggregations.reductions.retention.fourWeekAvgPercentage
                        }
                    };
                }

                if (this.currentBdCardData.averages.weekly.change) {
                    let value = (this.currentBdCardData.averages.weekly.change) * 100;
                    this.currentBdCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }

                if (typeof this.currentBdCardData.sales === 'number') {
                    this.currentBdCardData.loading = false;
                }
            });
    }

    getTodayOlapData(): void {
        this.dataService.databaseV2$
            .subscribe(database => {
                let restaurantTime = this.dataService.getCurrentRestTime();

                let day = database.getDay(restaurantTime);
                if (day) {
                    this.currentBdCardData.holiday = day.holiday;
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

                const title = this.datePipe.transform(previousDay.valueOf(), 'fullDate');
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
                            percentage: day.prcAvgNweeksSalesAndRefoundAmountIncludeVat / 100,
                            change: day.prcAvgNweeksSalesAndRefoundAmountIncludeVat
                        }
                    };

                    this.previousBdCardData.reductions = {
                        cancellations: {
                            percentage: day.voidsPrc / 100,
                            change: day.VoidsDiff
                        },
                        employee: {
                            percentage: day.employeesPrc / 100,
                            change: day.Employeesdiff
                        },
                        operational: {
                            percentage: day.operationalPrc / 100,
                            change: day.OperationalDiff
                        },
                        retention: {
                            percentage: day.mrPrc / 100,
                            change: day.mrDiff
                        }

                    };

                    if (this.previousBdCardData.averages.weekly.percentage) {
                        this.previousBdCardData.statusClass = this.tabitHelper.getColorClassByPercentage(day.prcAvgNweeksSalesAndRefoundAmountIncludeVat, true);
                    }
                }

                this.previousBdCardData.title = title;
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
                if(!month.latestDay || moment(month.latestDay).isBefore(moment(), 'days')) {
                    this.showForecast = false;
                    this.forecastCardData.loading = false;
                    return;
                }

                this.forecastCardData.averages = {yearly: {}, weekly: {}};

                let lastYearMonth = database.getMonth(moment().subtract(1, 'years'));
                let previousMonth = database.getMonth(moment().subtract(1, 'months'));
                if (lastYearMonth) {
                    this.forecastCardData.averages.yearly = {
                        percentage: lastYearMonth.aggregations.sales.amount ? ((month.forecast.sales.amount / lastYearMonth.aggregations.sales.amount) - 1) : 0,
                        change: month.forecast.sales.amount / lastYearMonth.aggregations.sales.amount
                    };
                }

                this.forecastCardData.title = `${this.datePipe.transform(moment(month.latestDay).startOf('month'), 'MMMM')} ${tmpTranslations.get('home.month.expected')}`;
                this.forecastCardData.diners = month.forecast.diners.count || month.forecast.orders.count;
                this.forecastCardData.sales = incTax ? month.forecast.sales.amount : month.forecast.sales.amountWithoutVat;

                let ppa = this.forecastCardData.sales / this.forecastCardData.diners;
                this.forecastCardData.ppa = incTax ?ppa : ppa / month.vat;

                this.forecastCardData.loading = false;
                this.forecastCardData.noSeparator = true;

                this.forecastCardData.averages.weekly = {
                    percentage: previousMonth ? ((month.forecast.sales.amount / previousMonth.forecast.sales.amount) - 1) : 0,
                    change: previousMonth ? (month.forecast.sales.amount / previousMonth.forecast.sales.amount) : 0
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
}
