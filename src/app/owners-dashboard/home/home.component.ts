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
import {environment} from '../../../environments/environment';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {OverTimeUsersDialogComponent} from './over-time-users/over-time-users-dialog.component';
import {Overlay} from '@angular/cdk/overlay';

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
        ppaOrders: 0,
        aggregations: {},
    };

    previousBdCardData: CardData = {
        loading: true,
        title: '',
        tag: 'previousBd',
        sales: 0,
        diners: 0,
        ppa: 0,
        ppaOrders: 0,
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
        ppaOrders: 0,
        aggregations: {},
        type: 'forecast'
    };

    summaryCardData: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        ppaOrders: 0,
        aggregations: {}
    };

    public display = {
        laborCost: false
    };

    private previousBdNotFinal = false;
    public showPreviousDay = false;
    public tabitHelper;
    public loadingOlapData: boolean;
    public OlapFailed: boolean;
    public olapError: any;
    public showSummary: boolean;
    public laborCostCard: any;
    public laborCost: any;
    private env: any;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private dataService: DataService,
                private router: Router,
                private monthPickerDialog: MatBottomSheet,
                private datePipe: DatePipe,
                private translate: TranslateService,
                public dialog: MatDialog,
                private overlay: Overlay) {

        this.env = environment;
        this.tabitHelper = new TabitHelper();
        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;
        ownersDashboardService.toolbarConfig.settings.show = true;
        ownersDashboardService.toolbarConfig.center.showVatComment = environment.region === 'il';
        ownersDashboardService.toolbarConfig.home.show = false;

        this.display.laborCost = false;
    }

    ngOnInit() {
        this.loadingOlapData = true;
        this.currentBdCardData.loading = true;
        this.showSummary = false;
        this.ownersDashboardService.toolbarConfig.home.show = false;

        this.OlapFailed = false;
        this.showForecast = false;
        window.scrollTo(0, 0);

        this.initRefreshSubscriber();
        this.getTodayData();
        this.getTodayOlapData();
        this.getYesterdayData();
        this.getForecastData();
        this.getSummary();
        this.renderLaborCost();
    }

    async renderLaborCost() {

        this.dataService.databaseV2$.subscribe(async database => {
            if (this.env.region !== 'us' || !database) {
                return;
            }

            let time = this.dataService.getCurrentRestTime();
            let laborCost = await this.dataService.getLaborCostByTime(time);
            if(!laborCost) {
                return;
            }

            this.laborCost = laborCost;
            let weekStartDate = moment().day(laborCost.firstWeekday);

            let weekSales = 0;
            while(weekStartDate.isBefore(time)) {
                let day = database.getDay(weekStartDate);
                if(day) {
                    weekSales += day.salesAndRefoundAmountIncludeVat;
                }
                weekStartDate.add(1, 'day');
            }

            weekSales += this.currentBdCardData.sales;

            let today = _.get(laborCost, ['byDay', time.format('YYYY-MM-DD')]);
            if(today) {
                this.laborCostCard = {
                    today: {
                        cost: today.cost || 0,
                        percentage: this.currentBdCardData.sales > 0 ? today.cost / this.currentBdCardData.sales : 0
                    },
                    week: {
                        cost: laborCost.weekSummary.cost || 0,
                        percentage: weekSales > 0 ? laborCost.weekSummary.cost / weekSales : 0
                    },
                    overtime: {
                        count: laborCost.overtime.count || 0
                    }
                };

                this.display.laborCost = true;
            }
        });

    }

    openOverTimeDialog() {
        this.dialog.open(OverTimeUsersDialogComponent, {
            width: '100vw',
            panelClass: 'overtime-dialog',
            data: {laborCost: this.laborCost},
            scrollStrategy: this.overlay.scrollStrategies.noop()
        });
    }

    initRefreshSubscriber() {
        this.dataService.refresh$.subscribe((refresh) => {
            if (refresh === 'force') {
                this.loadingOlapData = true;
                this.currentBdCardData.loading = true;
            }
        });
    }

    openMonthPicker() {

        this.ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        this.ownersDashboardService.toolbarConfig.menuBtn.show = false;
        this.ownersDashboardService.toolbarConfig.settings.show = false;
        this.ownersDashboardService.toolbarConfig.home.show = true;


        let dialog = this.monthPickerDialog.open(MonthPickerDialogComponent, {
            data: {selected: this.dataService.selectedMonth$.value, onDateChanged: this.onDateChanged},
            hasBackdrop: true,
            closeOnNavigation: true,
            backdropClass: 'month-picker-backdrop',
            panelClass: 'month-picker-dialog-panel',
            autoFocus: false
        });

        dialog.afterDismissed().subscribe(() => {
            this.ownersDashboardService.toolbarConfig.left.back.showBtn = false;
            this.ownersDashboardService.toolbarConfig.menuBtn.show = true;
            this.ownersDashboardService.toolbarConfig.settings.show = true;
            this.ownersDashboardService.toolbarConfig.home.show = false;

            let item = document.getElementById('monthSelector');// what we want to scroll to
            let wrapper = document.getElementById('main-content');// the wrapper we will scroll inside
            let header = document.getElementById('main-toolbar');// the wrapper we will scroll inside
            let count = item.offsetTop - wrapper.scrollTop - header.scrollHeight - 10; // xx = any extra distance from top ex. 60
            wrapper.scrollBy({top: count, left: 0, behavior: 'smooth'});
        });
    }

    getTodayData() {
        combineLatest(this.dataService.dailyTotals$, this.dataService.openDay$, this.dataService.vat$)
            .subscribe(async data => {
                let dailyTotals = data[0];
                let openDay = data[1];
                let incTax = data[2];
                let restaurantTime = moment.utc(dailyTotals.businessDate);

                let totals = dailyTotals.totals;
                let totalClosedOrders = _.get(totals, 'netSales', 0);
                let totalClosedOrdersWithoutVat = totalClosedOrders - _.get(totals, 'includedTax', 0);

                let totalOpenOrders = _.get(totals, 'openOrders.totalNetSalesAndRefunds', 0);
                let totalOpenOrdersWithoutVat = totalOpenOrders - _.get(totals, 'openOrders.totalIncludedTax', 0);


                let totalSales = (totalClosedOrders + totalOpenOrders) / 100;
                let totalSalesWithoutTax = (totalClosedOrdersWithoutVat + totalOpenOrdersWithoutVat) / 100;

                let endOfDayComment;
                this.translate.get('eod').subscribe((res: string) => {
                    endOfDayComment = res;
                });

                let yesterdayDate = moment.utc(dailyTotals.businessDate).subtract(1, 'day');
                let yesterdayDailyTotals = await this.dataService.getDailyTotals(yesterdayDate);
                if (!yesterdayDailyTotals.isEndOfDay) {
                    this.currentBdCardData.salesComment = endOfDayComment;
                }

                this.currentBdCardData.sales = incTax ? totalSales : totalSalesWithoutTax;

                this.translate.get('card.today').subscribe((res: string) => {
                    this.currentBdCardData.title = res + ', ' + this.datePipe.transform(restaurantTime.valueOf(), 'EEEE MMMM d', 'GMT', this.env.lang);
                });

                this.currentBdCardData.averages = {
                    /*yearly: {
                        percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                        change: (day.aggregations.sales.amount / day.aggregations.sales.yearAvg)
                    },*/
                    weekly: {
                        percentage: openDay.prcDiff ? openDay.prcDiff / 100 : 0,
                        change: openDay.currentSales / openDay.avg4weeksSales * 100
                    }
                };

                if (this.currentBdCardData.averages.weekly.change) {
                    let value = openDay.currentSales / openDay.avg4weeksSales * 100;
                    this.currentBdCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }

                if (typeof this.currentBdCardData.sales === 'number') {
                    this.currentBdCardData.loading = false;
                }

                this.currentBdCardData.showDrillArrow = true;
            });
    }

    getTodayOlapData() {
        combineLatest(this.dataService.databaseV2$, this.dataService.vat$, this.dataService.dailyTotals$).subscribe(data => {
            let database = data[0];
            let incTax = data[1];
            let dailyTotals = data[2];
            let restaurantTime = moment.utc(dailyTotals.businessDate);

            let day = database.getDay(restaurantTime);
            if (day) {
                this.currentBdCardData.holiday = day.holiday;

                this.currentBdCardData.diners = day.diners || day.orders;
                this.currentBdCardData.ppa = incTax ? day.ppaIncludeVat : day.ppaIncludeVat / day.vat;
                this.currentBdCardData.ppaOrders = this.currentBdCardData.sales / day.orders;

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


    getYesterdayData() {
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

                let previousDay = moment.utc(restaurantTime.format('YYYY-MM-DD')).subtract(1, 'days');
                let day = database.getDay(previousDay);

                if (!day) {
                    this.showPreviousDay = false;
                    this.previousBdNotFinal = true;
                    this.previousBdCardData.loading = false;
                }
                else {
                    this.showPreviousDay = true;

                    this.previousBdCardData.holiday = day.holiday;
                    this.previousBdCardData.diners = day.diners || day.orders;
                    this.previousBdCardData.ppa = incVat ? day.ppaIncludeVat : day.ppaIncludeVat / day.vat;
                    this.previousBdCardData.sales = incVat ? day.salesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountExcludeVat;

                    this.previousBdCardData.ppaOrders = this.previousBdCardData.sales / day.orders;

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

                let title = this.datePipe.transform(previousDay.format('YYYY-MM-DD'), 'EEEE MMMM d', '', this.env.lang);
                this.translate.get('card.yesterday').subscribe((res: string) => {
                    this.previousBdCardData.title = res + ', ' + title;
                });

                this.previousBdCardData.showDrillArrow = true;
                this.previousBdCardData.loading = false;
            });
    }


    getForecastData() {
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

                this.forecastCardData.title = `${this.datePipe.transform(moment(month.latestDay).startOf('month').format('YYYY-MM-DD'), 'MMMM', '', this.env.lang)} ${tmpTranslations.get('home.month.expected')}`;
                this.forecastCardData.diners = month.forecast.diners.count || month.forecast.orders.count;
                this.forecastCardData.sales = incTax ? month.forecast.sales.amount : month.forecast.sales.amountWithoutVat;

                if (month.forecast.diners.count) {
                    let ppa = this.forecastCardData.sales / month.forecast.diners.count;
                    this.forecastCardData.ppa = incTax ? ppa : ppa / month.vat;
                }
                else {
                    let ppaOrders = this.forecastCardData.sales / month.forecast.orders.count;
                    this.forecastCardData.ppaOrders = incTax ? ppaOrders : ppaOrders / month.vat;
                }

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

    getSummary() {
        combineLatest(this.dataService.selectedMonth$, this.dataService.currentRestTime$, this.dataService.databaseV2$, this.dataService.vat$)
            .subscribe(data => {
                let date = data[0];
                let currentBd = data[1];
                let database = data[2];
                let incTax = data[3];

                let month = database.getMonth(date);
                if (!month) {
                    this.showSummary = false;
                    return;
                }
                let previousMonth = database.getMonth(moment(month.latestDay).subtract(1, 'months'));

                this.showSummary = true;
                this.summaryCardData.diners = month.diners || month.orders;
                this.summaryCardData.sales = incTax ? month.ttlsalesIncludeVat : month.ttlsalesExcludeVat;

                this.summaryCardData.ppa = incTax ? month.ppaIncludeVat : month.ppaIncludeVat / month.vat;
                this.summaryCardData.ppaOrders = this.summaryCardData.sales / month.orders;

                this.summaryCardData.showDrillArrow = true;


                this.summaryCardData.averages = {
                    /*yearly: {
                        percentage: month.aggregations.sales.lastYearWeekAvg ? ((month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg) - 1) : 0,
                        change: month.aggregations.sales.weekAvg / month.aggregations.sales.lastYearWeekAvg
                    },*/
                    weekly: {
                        percentage: previousMonth && previousMonth.weekAvg ? ((month.weekAvg / previousMonth.weekAvg) - 1) : 0,
                        change: previousMonth ? (month.weekAvg / previousMonth.weekAvg) * 100 : 0
                    }
                };

                let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
                let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
                this.summaryCardData.title = monthName + ' ' + monthState;

                this.summaryCardData.reductions = {
                    cancellations: {
                        percentage: month.prcVoidsAmount / 100,
                        change: previousMonth ? (month.prcVoidsAmount - previousMonth.prcVoidsAmount) : 0
                    },
                    employee: {
                        percentage: month.prcEmployeesAmount / 100,
                        change: previousMonth ? (month.prcEmployeesAmount - previousMonth.prcEmployeesAmount) : 0
                    },
                    operational: {
                        percentage: month.prcOperationalAmount / 100,
                        change: previousMonth ? (month.prcOperationalAmount - previousMonth.prcOperationalAmount) : 0
                    },
                    retention: {
                        percentage: month.prcMrAmount / 100,
                        change: previousMonth ? (month.prcMrAmount - previousMonth.prcMrAmount) : 0
                    }
                };

                if (this.summaryCardData.averages.weekly.percentage) {
                    let value = previousMonth ? (month.weekAvg / previousMonth.weekAvg) * 100 : 0;
                    this.summaryCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }
                else {
                    this.summaryCardData.statusClass = '';
                }

                this.summaryCardData.loading = false;
            });
    }

    onDayRequest(data) {
        let date = data.date;
        let category = data.category;
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
            this.router.navigate(['/owners-dashboard/day', date, {category: data.category}]);
        }
    }

    onDateChanged(mom: moment.Moment) {
        const month = moment(mom).startOf('month');
        this.dataService.selectedMonth$.next(month);
    }

    isCurrentMonth() {
        let selectedMonth = this.dataService.selectedMonth$.value;
        return selectedMonth.month() === moment().month();
    }
}
