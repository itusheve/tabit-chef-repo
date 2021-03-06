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
import {WeekSelectorComponent} from './week-selector/week-selector.component';
import {environment} from '../../../environments/environment';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {OverTimeUsersDialogComponent} from './over-time-users/over-time-users-dialog.component';
import {LogzioService} from '../../logzio.service';
import {ForecastDialogComponent} from './forecast-dialog/forecast-dialog.component';
import {Overlay} from '@angular/cdk/overlay';
import {DataWareHouseService} from '../../services/data-ware-house.service';
import {AuthService} from '../../auth/auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [DatePipe, DataWareHouseService]
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
        aggregations: {},
        type: ''
    };

    public display = {
        laborCost: false,
        weekToDate: false,
        monthToDate: false,
        monthReport: false
    };
    private previousBdNotFinal = false;
    public showPreviousDay = false;
    public tabitHelper;
    public loadingOlapData: boolean;
    public OlapFailed: boolean;
    public olapError: any;
    public showSummary: boolean;
    public laborCostCard: any;
    public weeks: any;
    public weekToDateCard: CardData = {
        loading: true,
        title: '',
        tag: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        ppaOrders: 0,
        reductions: {}
    };
    public laborCost: any;
    private env: any;
    public selectedMonth: moment.Moment;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private dataService: DataService,
                private router: Router,
                private monthPickerDialog: MatBottomSheet,
                private weekPickerDialog: MatBottomSheet,
                private datePipe: DatePipe,
                private translate: TranslateService,
                public dialog: MatDialog,
                private overlay: Overlay,
                private logz: LogzioService) {

        this.env = environment;
        this.tabitHelper = new TabitHelper();
        ownersDashboardService.toolbarConfig.left.back.showBtn = false;
        ownersDashboardService.toolbarConfig.menuBtn.show = true;
        ownersDashboardService.toolbarConfig.settings.show = true;
        ownersDashboardService.toolbarConfig.center.showVatComment = environment.region === 'il';
        ownersDashboardService.toolbarConfig.home.show = false;

        this.display.laborCost = false;
        this.display.weekToDate = false;
        this.display.monthToDate = false;
        this.display.monthReport = false;

        this.dataService.settings$.subscribe(settings => {
            if (settings.weekToDate === true) {
                this.display.weekToDate = true;
            }
            else {
                this.display.weekToDate = false;
            }

            if (settings.monthToDate === undefined || settings.monthToDate === true) {
                this.display.monthToDate = true;
            }
            else {
                this.display.monthToDate = false;
            }

            if (settings.laborCost === undefined || settings.laborCost === true) {
                this.display.laborCost = true;
            }
            else {
                this.display.laborCost = false;
            }
        });
    }

     async  ngOnInit() {
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
        this.renderWeekToDate();

        if (!this.isCurrentMonth()) {
            this.ownersDashboardService.toolbarConfig.home.show = true;
        }

         this.ownersDashboardService.toolbarConfig.home.show = true;



         combineLatest(this.dataService.user$, this.dataService.organization$).subscribe(data => {
            let user = data[0];
            let organization = data[1];
            this.logz.log('chef', 'user action', {
                action: 'home',
                'user': user.email,
                'org': organization.name,
                firstName: user.firstName,
                lastName: user.lastName
            });
        });

        document.addEventListener('openDailyReportFromExternalLink', (event) => {
            this.onDayRequest({date: _.get(event, 'businessDate')});
        });
    }

    renderWeekToDate() {
        combineLatest(this.dataService.databaseV2$, this.dataService.currentRestTime$, this.dataService.vat$, this.dataService.dailyTotals$)
            .subscribe(async data => {
                let database = data[0];
                let restTime = data[1];
                let incVat = data[2];
                let dailyTotals = data[3];

                let businessDate = moment.utc(dailyTotals.businessDate);
                let settings = database.getSettings();
                restTime = moment(restTime);

                let week = database.getWeekByDate(businessDate);
                if (!week || !week.startDate) {
                    week = database.getWeekByDate(businessDate.subtract(1, 'weeks'));
                }

                if (!week || !week.startDate) {
                    return;
                }

                let title = '';
                if (restTime.weekYear() === week.details.year && restTime.week() === week.details.number) {
                    this.translate.get('weekToDate').subscribe((res: string) => {
                        title = res;
                    });
                }
                else {
                    this.translate.get('week').subscribe((res: string) => {
                        title = res;
                    });
                }

                title += ' ' + week.details.number + ', ' + week.startDate.format(this.env.region === 'us' ? 'M/D/YY' : 'D/M/YY');

                let dinersOrders = week.diners || week.orders;
                let sales = incVat ? week.sales.total : week.sales.totalWithoutVat;
                let dinerSales = incVat ? week.sales.diners : week.sales.dinersWithoutVat;
                this.weekToDateCard = {
                    loading: false,
                    title: title,
                    tag: '',
                    sales: sales,
                    diners: dinersOrders,
                    ppa: dinerSales / dinersOrders,
                    ppaOrders: sales / week.orders,
                    showDrillArrow: true
                };

                this.weekToDateCard.revenue = _.get(week, ['sales', 'revenue'], 0);
                let previousWeek = database.getWeekByDate(moment(businessDate).subtract(1, 'week'));
                let lastYearWeek = database.getWeek(businessDate.weekYear() - 1, businessDate.week());

                let previousWeeksAvgs = {
                    sales: 0,
                    cancellations: 0,
                    employees: 0,
                    operational: 0,
                    retention: 0,
                };
                let weekCounter = 0;
                for (let i = 1; i <= 4; i++) {
                    let historicWeek = database.getWeekByDate(moment(businessDate).subtract(i, 'weeks'));
                    if (historicWeek) {
                        if (restTime.weekYear() === week.details.year && restTime.week() === week.details.number) {
                            let counter = 0;
                            _.forEach(historicWeek.days, (day, key) => {
                                if (counter < week.daysInWeek && _.get(week, ['days', key])) {
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

                this.weekToDateCard.averages = {
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

                this.weekToDateCard.reductions = {
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

                if (this.weekToDateCard.averages.weekly.percentage) {
                    let value = (this.weekToDateCard.averages.weekly.change);
                    this.weekToDateCard.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }
            });
    }

    async renderLaborCost() {

        combineLatest(this.dataService.dailyTotals$, this.dataService.databaseV2$).subscribe(async data => {
            const dailyTotals = data[0];
            const database = data[1];
            if (this.env.region !== 'us' || !database) {
                return;
            }

            let totals = _.get(dailyTotals, 'totals', {});
            let totalClosedOrders = _.get(totals, 'netSales', 0);
            let totalOpenOrders = _.get(totals, 'openOrders.totalNetSalesAndRefunds', 0);
            let todaySales = (totalClosedOrders + totalOpenOrders) / 100;

            let time = this.dataService.getCurrentRestTime();
            let laborCost = await this.dataService.getLaborCostByTime(time);
            if (!laborCost) {
                return;
            }

            this.laborCost = laborCost;

            let week = database.getWeekByDate(time);
            let weekSales = _.get(week, ['sales', 'total'], 0);
            weekSales += todaySales;

            let todayLaborCost = _.get(laborCost, ['byDay', time.format('YYYY-MM-DD')]);

            this.laborCostCard = {
                today: {
                    cost: todayLaborCost ? todayLaborCost.cost : 0,
                    percentage: todaySales > 0 ? (todayLaborCost ? todayLaborCost.cost : 0) / todaySales : 0
                },
                week: {
                    cost: laborCost.weekSummary.cost || 0,
                    percentage: weekSales > 0 ? laborCost.weekSummary.cost / weekSales : 0,
                    actualSales: weekSales
                },
                overtime: {
                    count: laborCost.overtime.count || 0
                }
            };
        });

    }

    openOverTimeDialog() {
        this.dialog.open(OverTimeUsersDialogComponent, {
            width: '100vw',
            panelClass: 'overtime-dialog',
            data: {laborCost: this.laborCost},
            scrollStrategy: this.overlay.scrollStrategies.block(),
            hasBackdrop: true
        });
    }

    openForecastDetails() {
        this.dialog.open(ForecastDialogComponent, {
            width: '100vw',
            panelClass: 'month-forecast-dialog',
            scrollStrategy: this.overlay.scrollStrategies.block(),
            hasBackdrop: true,
            backdropClass: 'month-picker-backdrop'
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

    openMonthlyReport() {

        this.openMonthPicker();

        //TODO: Temp override until Ofer adds this to US sites
        /*if (this.env.region === 'us') {

        }
        else {
            let month = this.dataService.selectedMonth$.value;
            this.router.navigate(['/owners-dashboard/month', {month: month.month(), year: month.year()}]);
        }*/
    }

    getCurrentMonth() {
        return this.dataService.selectedMonth$.value;
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

            if (this.dataService.selectedMonth$.value.isSame(moment(), 'month')) {
                this.ownersDashboardService.toolbarConfig.home.show = false;
            }
            else {
                this.ownersDashboardService.toolbarConfig.home.show = true;
            }


            let item = document.getElementById('monthSelector');// what we want to scroll to
            let wrapper = document.getElementById('main-content');// the wrapper we will scroll inside
            let header = document.getElementById('main-toolbar');// the wrapper we will scroll inside
            let count = item.offsetTop - wrapper.scrollTop - header.scrollHeight - 10; // xx = any extra distance from top ex. 60
            wrapper.scrollBy({top: count, left: 0, behavior: 'smooth'});
        });
    }

    openWeekPicker() {

        this.ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        this.ownersDashboardService.toolbarConfig.menuBtn.show = false;
        this.ownersDashboardService.toolbarConfig.settings.show = false;
        this.ownersDashboardService.toolbarConfig.home.show = true;

        let dialog = this.weekPickerDialog.open(WeekSelectorComponent, {
            data: {weeks: this.weeks},
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

                this.currentBdCardData.revenue = (_.get(totals, ['totalPayments'], 0) / 100) + totalOpenOrders / 100;
                this.currentBdCardData.sales = incTax ? totalSales : totalSalesWithoutTax;

                this.translate.get('card.today').subscribe((res: string) => {
                    this.currentBdCardData.title = res + ', ' + this.datePipe.transform(restaurantTime.valueOf(), 'EEE. LLL d', 'GMT', this.env.lang);
                });

                this.currentBdCardData.averages = {
                    /*yearly: {
                        percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                        change: (day.aggregations.sales.amount / day.aggregations.sales.yearAvg)
                    },*/
                    weekly: {
                        percentage: (totalSalesWithoutTax / openDay.avg4weeksSales) - 1,
                        change: totalSalesWithoutTax / openDay.avg4weeksSales * 100
                    }
                };

                if (this.currentBdCardData.averages.weekly.change) {
                    let value = totalSalesWithoutTax / openDay.avg4weeksSales * 100;
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
                this.OlapFailed = false;
                this.currentBdCardData.holiday = day.holiday;

                this.currentBdCardData.diners = day.diners || day.orders;
                this.currentBdCardData.ppa = incTax ? day.ppaIncludeVat : day.ppaIncludeVat / day.vat;
                this.currentBdCardData.ppaOrders = day.salesAndRefoundAmountIncludeVat / day.orders;

                this.currentBdCardData.reductions = {
                    cancellations: {
                        percentage: day.voidsPrc / 100,
                        change: day.voidsPrc / day.avgNweeksVoidsPrc * 100
                    },
                    employee: {
                        percentage: day.employeesPrc / 100,
                        change: day.employeesPrc / day.avgNweeksEmployeesPrc * 100
                    },
                    operational: {
                        percentage: day.operationalPrc / 100,
                        change: day.operationalPrc / day.avgNweeksOperationalPrc * 100
                    },
                    retention: {
                        percentage: day.mrPrc / 100,
                        change: day.mrPrc / day.avgNweeksMrPrc * 100
                    }
                };
            }
        });
    }


    getYesterdayData() {
        combineLatest(this.dataService.databaseV2$, this.dataService.currentRestTime$, this.dataService.vat$, this.dataService.dailyTotals$)
            .subscribe(async data => {
                this.previousBdCardData.loading = true;
                this.loadingOlapData = true;
                let database = data[0];
                let restaurantTime = data[1];
                let incVat = data[2];
                let dailyTotals = data[3];
                this.OlapFailed = false;

                if (!database || database.error) {
                    this.OlapFailed = true;
                    this.olapError = database && database.error;
                    return;
                }

                let previousDay = moment.utc(dailyTotals.businessDate).subtract(1, 'day');
                let day = database.getDay(previousDay);

                if (!day) {
                    this.showPreviousDay = false;
                    this.previousBdNotFinal = true;
                    this.previousBdCardData.loading = false;
                }
                else {
                    this.showPreviousDay = true;


                    let endOfDayComment;
                    this.translate.get('eod').subscribe((res: string) => {
                        endOfDayComment = res;
                    });

                    let yesterdayDailyTotals = await this.dataService.getDailyTotals(previousDay);
                    if (!yesterdayDailyTotals.isEndOfDay) {
                        this.previousBdCardData.salesComment = endOfDayComment;
                    }


                    this.previousBdCardData.holiday = day.holiday;
                    this.previousBdCardData.diners = day.diners || day.orders;
                    this.previousBdCardData.ppa = incVat ? day.ppaIncludeVat : day.ppaIncludeVat / day.vat;
                    this.previousBdCardData.sales = incVat ? day.salesAndRefoundAmountIncludeVat : day.salesAndRefoundAmountExcludeVat;
                    this.previousBdCardData.revenue = _.get(day, 'ttlRevenuencludeVat', 0);

                    this.previousBdCardData.ppaOrders = this.previousBdCardData.sales / day.orders;

                    this.previousBdCardData.averages = {
                        yearly: {
                            percentage: ((day.salesAndRefoundAmountIncludeVat / day.AvgPySalesAndRefoundAmountIncludeVat) - 1),
                            change: (day.salesAndRefoundAmountIncludeVat / day.AvgPySalesAndRefoundAmountIncludeVat) * 100
                        },
                        weekly: {
                            percentage: ((day.salesAndRefoundAmountIncludeVat / day.AvgNweeksSalesAndRefoundAmountIncludeVat) - 1),
                            change: (day.salesAndRefoundAmountIncludeVat / day.AvgNweeksSalesAndRefoundAmountIncludeVat) * 100
                        }
                    };

                    this.previousBdCardData.reductions = {
                        cancellations: {
                            percentage: day.voidsPrc / 100,
                            change: day.voidsPrc / day.avgNweeksVoidsPrc * 100
                        },
                        employee: {
                            percentage: day.employeesPrc / 100,
                            change: day.employeesPrc / day.avgNweeksEmployeesPrc * 100
                        },
                        operational: {
                            percentage: day.operationalPrc / 100,
                            change: day.operationalPrc / day.avgNweeksOperationalPrc * 100
                        },
                        retention: {
                            percentage: day.mrPrc / 100,
                            change: day.mrPrc / day.avgNweeksMrPrc * 100
                        }
                    };

                    if (this.previousBdCardData.averages.weekly.percentage) {
                        let value = (this.previousBdCardData.averages.weekly.change);
                        this.previousBdCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                    }
                }

                let title = this.datePipe.transform(previousDay.format('YYYY-MM-DD'), 'EEE. LLL d', '', this.env.lang);
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

                this.forecastCardData.showDrillArrow = true;

                this.forecastCardData.averages = {yearly: {}, weekly: {}};

                let lastYearMonth = database.getMonth(moment().subtract(1, 'years'));
                let previousMonth = database.getMonth(moment().subtract(1, 'months'));
                if (lastYearMonth && lastYearMonth.weekAvg) {
                    this.forecastCardData.averages.yearly = {
                        percentage: lastYearMonth ? (month.forecast.weekAvg / lastYearMonth.weekAvg) - 1 : 0,
                        change: lastYearMonth ? month.forecast.weekAvg / lastYearMonth.weekAvg * 100 : 0
                    };
                }

                this.forecastCardData.title = `${this.datePipe.transform(moment(month.latestDay).startOf('month').format('YYYY-MM-DD'), 'MMMM', '', this.env.lang)} ${tmpTranslations.get('home.month.expected')}`;
                this.forecastCardData.diners = month.forecast.diners.count || month.forecast.orders.count;
                this.forecastCardData.sales = incTax ? month.forecast.sales.amount : month.forecast.sales.amount / month.vat;

                if (month.forecast.diners.count) {
                    let ppa = this.forecastCardData.sales / month.forecast.diners.count;
                    //this.forecastCardData.ppa = incTax ? ppa : ppa / month.vat;
                    this.forecastCardData.ppa = null; //TODO: get diners sales for forecast before calculating forecasted diners ppa
                }
                else {
                    let ppaOrders = this.forecastCardData.sales / month.forecast.orders.count;
                    this.forecastCardData.ppaOrders = incTax ? ppaOrders : ppaOrders / month.vat;
                }

                this.forecastCardData.loading = false;
                this.forecastCardData.noSeparator = true;

                this.forecastCardData.averages.weekly = {
                    percentage: previousMonth ? ((month.forecast.weekAvg / previousMonth.weekAvg) - 1) : 0,
                    change: previousMonth ? (month.forecast.weekAvg / previousMonth.weekAvg) * 100 : 0
                };

                this.showForecast = moment().diff(moment(database.getLowestDate()), 'days') > 8; //do not show forecast for new businesses with less than 8 days of data

                if (this.forecastCardData.averages.weekly.percentage) {
                    let value = (month.forecast.weekAvg / previousMonth.weekAvg) * 100;
                    this.forecastCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }
            });
    }

    getSummary() {
        combineLatest(this.dataService.selectedMonth$, this.dataService.currentRestTime$, this.dataService.databaseV2$, this.dataService.vat$, this.dataService.organization$)
            .subscribe(data => {
                let date = data[0];
                let currentBd = data[1];
                let database = data[2];
                let incTax = data[3];
                let organization = data[4];

                this.display.monthReport = organization.region === 'il';
                let month = database.getMonth(date);
                if (!month) {
                    this.showSummary = false;
                    return;
                }
                let previousMonth = database.getMonth(moment(month.latestDay).subtract(1, 'months'));
                let lastYearMonth = database.getMonth(moment(month.latestDay).subtract(1, 'years'));

                this.summaryCardData.type = 'month';

                this.showSummary = true;
                this.summaryCardData.diners = month.diners || month.orders;
                this.summaryCardData.sales = incTax ? month.ttlsalesIncludeVat : month.ttlsalesExcludeVat;
                this.summaryCardData.revenue = _.get(month, 'ttlRevenuencludeVat', 0);

                this.summaryCardData.ppa = incTax ? month.ppaIncludeVat : month.ppaIncludeVat / month.vat;
                this.summaryCardData.ppaOrders = this.summaryCardData.sales / month.orders;

                this.summaryCardData.showDrillArrow = true;

                let previousMonthWeekAvg = 0;
                let lastYearWeekAvg = 0;
                let currentdaysCounter = 0;
                if (date.isSame(moment(), 'month')) {
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

                this.summaryCardData.averages = {
                    yearly: {
                        percentage: lastYearMonth && lastYearWeekAvg ? ((month.weekAvg / lastYearWeekAvg) - 1) : 0,
                        change: lastYearMonth ? (month.weekAvg / lastYearWeekAvg) * 100 : 0
                    },
                    weekly: {
                        percentage: previousMonth && previousMonthWeekAvg ? ((month.weekAvg / previousMonthWeekAvg) - 1) : 0,
                        change: previousMonth ? (month.weekAvg / previousMonthWeekAvg) * 100 : 0
                    }
                };

                let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
                let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
                this.summaryCardData.title = monthName + ' ' + monthState;

                let cancellationsPct = +(month.prcVoidsAmount / 100 || 0).toFixed(3);
                let employeePct = +(month.prcEmployeesAmount / 100 || 0).toFixed(3);
                let operationalPct = +(month.prcOperationalAmount / 100 || 0).toFixed(3);
                let retentionPct = +(month.prcMrAmount / 100 || 0).toFixed(3);


                let prevMonthCancellationsPct = 1;
                let prevMonthEmployeePct = 1;
                let prevMonthOperationalPct = 1;
                let prevMonthRetentionPct = 1;
                if (previousMonth) {
                    prevMonthCancellationsPct = +(previousMonth.prcVoidsAmount / 100 || 0).toFixed(3);
                    prevMonthEmployeePct = +(previousMonth.prcEmployeesAmount / 100 || 0).toFixed(3);
                    prevMonthOperationalPct = +(previousMonth.prcOperationalAmount / 100 || 0).toFixed(3);
                    prevMonthRetentionPct = +(previousMonth.prcMrAmount / 100 || 0).toFixed(3);
                }

                this.summaryCardData.reductions = {
                    cancellations: {
                        percentage: cancellationsPct || 0,
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

                if (this.summaryCardData.averages.weekly.percentage) {
                    let value = previousMonth ? (month.weekAvg / previousMonthWeekAvg) * 100 : 0;
                    this.summaryCardData.statusClass = this.tabitHelper.getColorClassByPercentage(value, true);
                }
                else {
                    this.summaryCardData.statusClass = '';
                }

                this.summaryCardData.loading = false;
                this.dataService.setMonthlyReductions(this.summaryCardData);
            });
    }

    onDayRequest(data) {
        let date = data.date;
        let category = data.category;
        if (date === 'currentBD') {
            this.dataService.dailyTotals$.pipe(take(1)).subscribe(dailyTotals => {
                date = moment.utc(dailyTotals.businessDate).format('YYYY-MM-DD');
                this.router.navigate(['/owners-dashboard/day', date]);
            });
        } else if (date === 'previousBD') {
            if (this.previousBdNotFinal) {
                return;
            }
            this.dataService.dailyTotals$.pipe(take(1)).subscribe(dailyTotals => {
                date = moment.utc(dailyTotals.businessDate).subtract(1, 'days').format('YYYY-MM-DD');
                this.router.navigate(['/owners-dashboard/day', date]);
            });
        } else {
            this.router.navigate(['/owners-dashboard/day', date, {category: data.category}]);
        }
    }

    onDateChanged(mom: moment.Moment) {
        const month = moment(mom).startOf('month');
        this.selectedMonth = month;
        this.dataService.selectedMonth$.next(month);
    }

    isCurrentMonth() {
        let selectedMonth = this.dataService.selectedMonth$.value;
        return selectedMonth.format('YYYY-MM') === moment().format('YYYY-MM');
    }

    showLaborCost() {
        return this.display.laborCost && this.isCurrentMonth() && _.get(this.laborCostCard, ['week', 'cost']);
    }

    showWeekToDate() {
        return this.display.weekToDate && this.isCurrentMonth() && _.get(this.weekToDateCard, ['sales']);
    }
}
