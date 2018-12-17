import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../tabit/data/data.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ClosedOrdersDataService} from '../../../tabit/data/dc/closedOrders.data.service';

import * as moment from 'moment';
import * as _ from 'lodash';

import {zip, combineLatest, Subject, Observable, BehaviorSubject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Order} from '../../../tabit/model/Order.model';
import {OrderType} from '../../../tabit/model/OrderType.model';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {Orders_KPIs, PaymentsKPIs} from '../../../tabit/data/ep/olap.ep';
import {DebugService} from '../../debug.service';
import {environment} from '../../../environments/environment';
import {CardData} from '../../ui/card/card.component';

export interface SalesTableRow {
    orderType: OrderType;
    ordersKpis: Orders_KPIs;
}

@Component({
    selector: 'app-day-view',
    templateUrl: './day-view.component.html',
    styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit {

    day: moment.Moment;
    category: string;

    public daySelectorOptions: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    dayHasSales: boolean;

    drillTlogTime;
    drill = false;
    drilledOrder: Order;
    drilledOrderNumber: number;

    public dayFromDatabase: any;
    public hasData: boolean;
    public hasNoDataForToday: boolean;
    public region: string;

    // for the pie chart
    public salesByOrderType: any;

    /* the day's Orders */
    public orders: Order[];
    public organizational: Order[];

    public dailySummaryTblData: { title: string; data: SalesTableRow[], globalSalesIncludingVat: any };
    public byShiftSummaryTblsData: { title: string; data: SalesTableRow[], globalSalesIncludingVat: any }[];

    public salesBySubDepartment: {
        thisBd: {
            totalSales: number;
            bySubDepartment: {
                subDepartment: string;
                sales: number
            }[]
        },
        thisWeek: {
            totalSales: number;
            bySubDepartment: {
                subDepartment: string;
                sales: number
            }[]
        },
        thisMonth: {
            totalSales: number;
            bySubDepartment: {
                subDepartment: string;
                sales: number
            }[]
        }
    };

    public mostSoldItems: {
        byItem: {
            department: string;
            item: string;
            sales: number;
            sold: number;
            prepared: number;
            returned: number;
            operational: number;
        }[]
    };

    public mostSoldItemsByShift: {
        title: string;
        mostSoldItems: {
            byItem: {
                department: string;
                item: string;
                sales: number;
                sold: number;
                prepared: number;
                returned: number;
                operational: number;
            }[]
        }
    }[];

    public mostReturnedItems: {
        byItem: {
            department: string;
            item: string;
            sales: number;
            sold: number;
            prepared: number;
            returned: number;
            operational: number;
        }[]
    };

    public paymentsData: {
        env: any;
        payments: {
            accountGroup: string;
            accountType: string;
            clearerName: string;
            date: moment.Moment;
            paymentsKPIs: any;
            rawData: any;
        }[]
    };

    public operationalErrorsData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        operational: number;
        tlogId: string;
    }[];

    public retentionData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        retention: number;
        tlogId: string;
    }[];

    public cancellationsData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        cancellations: number;
        tlogId: string;
    }[];

    public wasteData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        waste: number;
        tlogId: string;
    }[];

    public organizationalData: {
        orderType: OrderType;
        waiter: string;
        orderNumber: number;
        organizational: number;
        tlogId: string;
        service: string;
    }[];

    public employeeData: {
        orderType: OrderType;
        orderNumber: number;
        amount: number;
        tlogId: string;
    }[];

    public cardData: CardData = {
        loading: false,
        tag: '',
        title: '',
        sales: 0,
        diners: 0,
        ppa: 0,
        ppaOrders: 0,
        aggregations: {},
    };

    public mtdBusinessData: any;
    public salesByHour: any;
    public today: moment.Moment;
    public bdIsCurrentBd: boolean;
    public openOrders: any;

    private day$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());
    private totalSales$: BehaviorSubject<any> = new BehaviorSubject<any>(0);
    private closedOrders$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private openOrders$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public inProcessSalesAmount;

    private metaData: any;
    public user: any;
    public env: any;
    public display = {
        laborCost: false
    };
    public laborCost: any;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private dataService: DataService,
                private closedOrdersDataService: ClosedOrdersDataService,
                private route: ActivatedRoute,
                private router: Router,
                private ds: DebugService) {
        ownersDashboardService.toolbarConfig.left.back.pre = () => true;
        ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/home';
        ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        ownersDashboardService.toolbarConfig.menuBtn.show = false;
        ownersDashboardService.toolbarConfig.settings.show = false;
        ownersDashboardService.toolbarConfig.center.showVatComment = false;
        ownersDashboardService.toolbarConfig.home.show = true;
        this.region = environment.region;
        this.env = environment;
        this.hasData = false;
        this.today = moment();

        this.dataService.settings$.subscribe(settings => {
            if(settings.laborCost === undefined || settings.laborCost === true) {
                this.display.laborCost = true;
            }
            else {
                this.display.laborCost = false;
            }
        });


        this.user = {
            isStaff: false
        };



        this.dataService.user$.subscribe(user => {
            this.user = user;
        });
    }

    extractOrders(dailyReport): Order[] {
        if (!dailyReport) {
            return [];
        }

        let orders = [];
        let tlogs = dailyReport.tlogs;

        let i = 1;
        _.forEach(tlogs, tlog => {
            let order = new Order();
            order.id = i++;
            order.number = tlog.orderNumber;
            order.orderType = new OrderType(tlog.orderType, 1);

            order.sales = environment.region === 'us' ? tlog.netSalesAmount : tlog.totalAmount;
            order.salesBeforeTip = environment.region === 'us' ? tlog.netSalesAmount : tlog.totalBeforeTip;
            order.tlogId = tlog.tlogId;
            order.waiter = tlog.userName;
            order.openingTime = tlog.HHMM; //weird hack, talk to BI to get it formatted
            order.businessDate = moment(tlog.businessDate, 'YYYYMMDD'); //weird hack, talk to BI to get it formatted

            order.priceReductions = {
                cancellation: 0,
                discountsAndOTH: 0,
                employees: 0,
                promotions: 0
            };
            let tlogFlag = _.find(dailyReport.flags, {tlogId: tlog.tlogId});

            if (tlogFlag) {
                let reductions = tlogFlag.NameValues ? tlogFlag.NameValues.split(',') : [];
                if (reductions.length) {
                    _.forEach(reductions, reduction => {
                        reduction = reduction.trim();

                        if (reduction === 'promotions') {
                            order.priceReductions.promotions = 1;
                        }
                        else if (reduction === 'discounts' || reduction === 'oth') {
                            order.priceReductions.discountsAndOTH = 1;
                        }
                        else if (reduction === 'cancellation') {
                            order.priceReductions.cancellation = 1;
                        }
                        else if (reduction === 'employees') {
                            order.priceReductions.employees = 1;
                        }
                    });
                }
            }

            orders.push(order);
        });
        return orders;
    }

    private render() {
        this.hasData = false;
        this.dailySummaryTblData = undefined;
        this.byShiftSummaryTblsData = undefined;

        //this.dayDebounceStream$ = this.day$.pipe(debounceTime(350));

        //get card data for the day
        combineLatest(this.day$, this.dataService.databaseV2$, this.dataService.openDay$, this.dataService.dailyTotals$)
            .subscribe(async data => {
                let date = data[0];
                let database = data[1];
                let openDay = data[2];
                let dailyTotals = data[3];

                this.dayFromDatabase = database.getDay(date);

                this.daySelectorOptions = {
                    minDate: moment(database.getLowestDate()),
                    maxDate: moment(moment())
                };

                if (this.dayFromDatabase) {
                    this.cardData.holiday = this.dayFromDatabase.holiday;

                    this.cardData.sales = this.dayFromDatabase.salesAndRefoundAmountIncludeVat;

                    this.cardData.diners = this.dayFromDatabase.diners || this.dayFromDatabase.orders;
                    this.cardData.ppa = this.dayFromDatabase.ppaIncludeVat;
                    this.cardData.ppaOrders = this.cardData.sales / this.dayFromDatabase.orders;

                    this.cardData.reductions = {
                        cancellations: {
                            percentage: this.dayFromDatabase.voidsPrc / 100,
                            change: this.dayFromDatabase.voidsPrc - this.dayFromDatabase.avgNweeksVoidsPrc
                        },
                        employee: {
                            percentage: this.dayFromDatabase.employeesPrc / 100,
                            change: this.dayFromDatabase.employeesPrc - this.dayFromDatabase.avgNweeksEmployeesPrc
                        },
                        operational: {
                            percentage: this.dayFromDatabase.operationalPrc / 100,
                            change: this.dayFromDatabase.operationalPrc - this.dayFromDatabase.avgNweeksOperationalPrc
                        },
                        retention: {
                            percentage: this.dayFromDatabase.mrPrc / 100,
                            change: this.dayFromDatabase.mrPrc - this.dayFromDatabase.avgNweeksMrPrc
                        }
                    };

                    this.cardData.averages = {
                        /*yearly: {
                            percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                            change: day.aggregations.sales.amount / day.aggregations.sales.yearAvg
                        },*/
                        weekly: {
                            percentage: ((this.dayFromDatabase.salesAndRefoundAmountIncludeVat / this.dayFromDatabase.AvgNweeksSalesAndRefoundAmountIncludeVat) - 1),
                            change: (this.dayFromDatabase.salesAndRefoundAmountIncludeVat / this.dayFromDatabase.AvgNweeksSalesAndRefoundAmountIncludeVat) * 100
                        }
                    };
                }
                else {
                    this.cardData.sales = undefined;
                }

                let totalSalesWithoutTax = 0;
                if (moment.utc(dailyTotals.businessDate).isSame(date, 'day')) {
                    let totals = dailyTotals.totals;

                    let totalClosedOrders = _.get(totals, 'netSales', 0);
                    let totalClosedOrdersWithoutVat = totalClosedOrders - _.get(totals, 'includedTax', 0);

                    let totalOpenOrders = _.get(totals, 'openOrders.totalNetSalesAndRefunds', 0);
                    let totalOpenOrdersWithoutVat = totalOpenOrders - _.get(totals, 'openOrders.totalIncludedTax', 0);

                    let totalSales = (totalClosedOrders + totalOpenOrders) / 100;
                    totalSalesWithoutTax = (totalClosedOrdersWithoutVat + totalOpenOrdersWithoutVat) / 100;

                    this.cardData.sales = totalSales;

                    this.totalSales$.next(totalSales);
                    this.cardData.averages = {
                        /*yearly: {
                            percentage: day.aggregations.sales.yearAvg ? ((day.aggregations.sales.amount / day.aggregations.sales.yearAvg) - 1) : 0,
                            change: (day.aggregations.sales.amount / day.aggregations.sales.yearAvg)
                        },*/
                        weekly: {
                            percentage: (totalSalesWithoutTax / openDay.avg4weeksSales) - 1,
                            change: totalSalesWithoutTax / openDay.avg4weeksSales * 100
                        }
                    };
                }

                if (this.env.region === 'us') {
                    this.laborCost = {
                        today: [],
                        week: [],
                        sales: {
                            week: 0,
                            today: 0
                        }
                    };

                    let laborCostDate = moment(date.format('YYYY-MM-DD')).hour(23).minute(59).second(59);
                    let laborCost = await this.dataService.getLaborCostByTime(laborCostDate);
                    if (laborCost) {
                        let today = _.get(laborCost, ['byDay', laborCostDate.format('YYYY-MM-DD')]);

                        let weekStartDate;
                        if(date.day() === laborCost.firstWeekday) {
                            weekStartDate = moment(date);
                        }
                        else {
                            let day = moment(date);
                            if(day.day() > 0) {
                                weekStartDate = day.day(laborCost.firstWeekday);
                            }
                            else {
                                weekStartDate = day.day(laborCost.firstWeekday - 7);
                            }
                        }


                        let weekSales = 0;
                        while (weekStartDate.isBefore(date, 'day')) {
                            let day = database.getDay(weekStartDate);
                            if (day) {
                                weekSales += day.salesAndRefoundAmountIncludeVat;
                            }
                            weekStartDate.add(1, 'day');
                        }

                        let todaySales = 0;
                        if (moment().isSame(date, 'day')) {
                            todaySales = totalSalesWithoutTax;
                        }
                        else {
                            todaySales = _.get(this.dayFromDatabase, 'salesAndRefoundAmountExcludeVat', 0);
                        }

                        weekSales += todaySales;

                        this.laborCost = {
                            today: [],
                            week: [],
                            sales: {
                                week: weekSales,
                                today: todaySales
                            }
                        };

                        //convert to array
                        this.laborCost.week = laborCost.weekSummary;
                        this.laborCost.week.byAssignments = _.values(_.orderBy(this.laborCost.week.byAssignments, ['cost'], ['desc']));
                        _.forEach(this.laborCost.week.byAssignments, byAssignments => {
                            byAssignments.users = _.values(byAssignments.users);
                        });

                        if (today) {
                            this.laborCost.today = today;
                            this.laborCost.today.byAssignments = _.values(_.orderBy(this.laborCost.today.byAssignments, ['cost'], ['desc']));
                            _.forEach(this.laborCost.today.byAssignments, byAssignments => {
                                byAssignments.users = _.values(byAssignments.users);
                            });
                        }
                    }
                }
            });

        combineLatest(this.day$, this.dataService.dailyTotals$, this.dataService.refresh$).subscribe(async data => {
            let dayDate = data[0];
            let dailyTotals = data[1];
            let dailyReport;
            try {
                dailyReport = await this.dataService.getDailyReport(dayDate);
            }
            catch (e) {
                this.hasData = false;
                this.hasNoDataForToday = true;
            }

            if (!this.day$.value.isSame(dailyReport.date)) {
                return;
            }

            if (!dailyReport || !dailyReport.summary) {
                this.hasData = false;
                this.hasNoDataForToday = true;
            }
            else {
                this.hasData = true;
                this.hasNoDataForToday = false;
            }

            this.metaData = {
                isEod: dailyReport.isEOD,
                isBalanced: dailyReport.isBalance,
            };
            this.orders = this.extractOrders(dailyReport);

            this.closedOrders$.next(this.orders);

            dailyReport.summary = _.orderBy(dailyReport.summary, 'orderTypeKey', 'asc');
            let summary = _.filter(dailyReport.summary, summary => summary.serviceKey == '-1');
            let globalSalesIncludingVat = _.sumBy(summary, function (row) {
                return environment.region === 'us' ? row.salesNetAmount : row.ttlSaleAmountIncludeVat;
            });

            this.dailySummaryTblData = {
                title: '',
                data: summary,
                globalSalesIncludingVat: globalSalesIncludingVat
            };


            if (!moment.utc(dailyTotals.businessDate).isSame(dayDate, 'day')) {
                this.bdIsCurrentBd = false;
                this.openOrders = null;
            }
            else {
                this.bdIsCurrentBd = true;
                this.openOrders = await this.dataService.getOpenOrders();
                this.openOrders$.next(this.openOrders);
            }

            this.byShiftSummaryTblsData = [];
            _.forEach(dailyReport.summary, summary => {
                let serviceKey = _.get(summary, 'serviceKey');
                if (serviceKey && serviceKey != '-1') {
                    if (!this.byShiftSummaryTblsData[+serviceKey]) {
                        this.byShiftSummaryTblsData[+serviceKey] = {
                            title: summary.serviceName,
                            data: [],
                            globalSalesIncludingVat: globalSalesIncludingVat
                        };
                    }

                    this.byShiftSummaryTblsData[+serviceKey].data.push(summary);
                }
            });

            this.salesByHour = dailyReport.salesByHour;

            this.salesBySubDepartment = {
                thisBd: {
                    totalSales: 0,
                    bySubDepartment: []
                },
                thisWeek: {
                    totalSales: 0,
                    bySubDepartment: []
                },
                thisMonth: {
                    totalSales: 0,
                    bySubDepartment: []
                }
            };

            _.forEach(dailyReport.categories, category => {

                this.salesBySubDepartment.thisBd.totalSales += category.businessDateIncludeVat || 0;
                this.salesBySubDepartment.thisWeek.totalSales += category.weekIncludeVat || 0;
                this.salesBySubDepartment.thisMonth.totalSales += category.monthIncludeVat || 0;

                if (category.subDepartmentName) {
                    this.salesBySubDepartment.thisBd.bySubDepartment.push({
                        subDepartment: category.subDepartmentName,
                        sales: category.businessDateIncludeVat || 0
                    });
                    this.salesBySubDepartment.thisWeek.bySubDepartment.push({
                        subDepartment: category.subDepartmentName,
                        sales: category.weekIncludeVat || 0
                    });
                    this.salesBySubDepartment.thisMonth.bySubDepartment.push({
                        subDepartment: category.subDepartmentName,
                        sales: category.monthIncludeVat || 0
                    });
                }
            });

            this.mostSoldItems = {byItem: []};
            _.forEach(dailyReport.topItemSales, item => {
                this.mostSoldItems.byItem.push(
                    {
                        department: item.departmentName,
                        item: item.itemName,
                        sales: item.salesRefundIncludeVat,
                        sold: item.sold,
                        prepared: 0,
                        returned: 0,
                        operational: 0
                    }
                );
            });

            this.mostSoldItemsByShift = [];
            let shifts = _.groupBy(dailyReport.topItemSalesByService, 'serviceName');
            _.forEach(shifts, (items, shiftName) => {
                this.mostSoldItemsByShift.push({
                    title: shiftName,
                    mostSoldItems: {
                        byItem: _.map(items, item => {
                            return {
                                department: item.departmentName,
                                item: item.itemName,
                                sales: item.salesRefundIncludeVat,
                                sold: item.sold,
                                prepared: 0,
                                returned: 0,
                                operational: 0
                            };
                        })
                    }
                });
            });

            this.mostReturnedItems = {byItem: []};
            _.forEach(dailyReport.mostReturnItems, item => {
                this.mostReturnedItems.byItem.push(
                    {
                        department: item.departmentName,
                        item: item.itemName,
                        sales: 0,
                        sold: 0,
                        prepared: item.prepared,
                        returned: item.return,
                        operational: item.returnAmount
                    }
                );
            });

            this.paymentsData = {env: '', payments: []};
            _.forEach(dailyReport.payments, payment => {
                this.paymentsData.env = dailyReport.env;
                this.paymentsData.payments.push({
                    accountGroup: payment.type,
                    accountType: payment.name || payment.clearing,
                    date: dayDate,
                    clearerName: payment.clearingName || payment.name || payment.clearing,
                    paymentsKPIs: {
                        daily: payment.DailyPaymentAmount,
                        monthly: payment.MonthlyPaymentAmount,
                        yearly: payment.YearlyPaymentAmount,
                        dailyPrc: 0,
                        monthlyPrc: 0,
                        yearlyPrc: 0
                    },
                    rawData: payment //quick dirty fix for us
                });
            });

            this.operationalErrorsData = [];
            _.forEach(dailyReport.operational, record => {
                let order = _.find(this.orders, {tlogId: record.tlogId});
                this.operationalErrorsData.push({
                    orderType: {id: record.orderType, rank: 1},
                    waiter: order.waiter,
                    approvedBy: record.approvedByName,
                    orderNumber: record.orderNumber,
                    tableId: record.tableNumber,
                    item: record.itemName,
                    subType: record.reasonSubTypeHebrew,
                    reasonId: record.reasonName,
                    operational: record.operationalDiscountAmount,
                    tlogId: record.tlogId
                });
            });

            this.retentionData = [];
            _.forEach(dailyReport.reduction, reduction => {
                let order = _.find(this.orders, {tlogId: reduction.tlogId});
                this.retentionData.push({
                    orderType: {id: reduction.orderType, rank: 1},
                    waiter: order.waiter,
                    approvedBy: reduction.approvedByName,
                    orderNumber: reduction.orderNumber,
                    tableId: reduction.tableNumber,
                    item: reduction.itemName,
                    subType: reduction.reasonSubTypeHebrew,
                    reasonId: reduction.reasonName,
                    retention: reduction.retentionDiscountAmount,
                    tlogId: reduction.tlogId
                });
            });

            this.cancellationsData = [];
            _.forEach(dailyReport.cancelation, cancelation => {
                let order = _.find(this.orders, {tlogId: cancelation.tlogId});
                this.cancellationsData.push({
                    orderType: {id: cancelation.orderType, rank: 1},
                    waiter: order.waiter,
                    approvedBy: cancelation.approvedByName,
                    orderNumber: cancelation.orderNumber,
                    tableId: cancelation.tableNumber,
                    item: cancelation.itemName,
                    subType: cancelation.reasonSubTypeHebrew,
                    reasonId: cancelation.reasonName,
                    cancellations: cancelation.cancellationAmountIncludeVat,
                    tlogId: cancelation.tlogId
                });
            });

            this.wasteData = [];
            _.forEach(dailyReport.waste, waste => {
                let order = _.find(this.orders, {tlogId: waste.tlogId});
                this.wasteData.push({
                    orderType: {id: waste.orderType, rank: 1},
                    waiter: order.waiter,
                    approvedBy: waste.approvedByName,
                    orderNumber: waste.orderNumber,
                    tableId: waste.tableNumber,
                    item: waste.itemName,
                    subType: waste.reasonSubTypeHebrew,
                    reasonId: waste.reasonName,
                    waste: waste.wasteAmountIncludeVat,
                    tlogId: waste.tlogId
                });
            });

            this.organizationalData = [];
            _.forEach(dailyReport.organizational, organizational => {
                this.organizationalData.push({
                    orderType: {id: organizational.orderType, rank: 1},
                    waiter: organizational.ownerName,
                    orderNumber: organizational.orderNumber,
                    organizational: organizational.organizationalAmountIncludeVat,
                    tlogId: organizational.tlogId,
                    service: organizational.serviceName
                });
            });

            let totals = _.filter(dailyReport.monthly, record => !record.businessDate);
            this.mtdBusinessData = {
                totals: totals[0],
                businessDays: _.filter(dailyReport.monthly, record => !!record.businessDate)
            };

            this.hasData = true;
            this.hasNoDataForToday = false;
            let that = this;
            setTimeout(() => {
                if (!_.isEmpty(that.category)) {
                    let section = document.getElementById(this.category);
                    if (section) {
                        section.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }, 300);
        });
    }

    ngOnInit() {
        this.today = moment();
        this.hasData = false;
        window.scrollTo(0, 0);
        this.render();
        this.inProcessSalesAmount = 0;
        combineLatest(this.totalSales$, this.openOrders$, this.closedOrders$).subscribe(data => {
            let totalSales = data[0];
            let openOrders = data[1];
            let closedOrders = data[2];
            if (totalSales === 0 && !openOrders && !closedOrders) {
                return;
            }

            this.inProcessSalesAmount = 0;


            let totalOpenOrdersAmount = 0;
            _.forEach(openOrders, openOrder => {
                if (openOrder.totals.totalAmount) {
                    totalOpenOrdersAmount += openOrder.totals.netSales / 100;
                }
            });

            let totalClosedAmount = 0;
            _.forEach(closedOrders, closedOrder => {
                if (closedOrder.salesBeforeTip) {
                    totalClosedAmount += closedOrder.salesBeforeTip;
                }
            });

            this.inProcessSalesAmount = totalSales - totalOpenOrdersAmount - totalClosedAmount;
        });

        this.dataService.refresh$.subscribe(refresh => {
            this.hasData = false;
            this.dailySummaryTblData = undefined;
            this.byShiftSummaryTblsData = undefined;
        });

        let businessDate = this.route.snapshot.paramMap.get('businessDate');
        this.day = moment(businessDate);
        this.day$.next(this.day);

        this.category = this.route.snapshot.paramMap.get('category');
        this.day$.next(this.day);
    }

    onDateChanged(dateM: moment.Moment) {
        this.hasData = false;
        this.hasNoDataForToday = false;
        this.day = dateM;
        this.day$.next(this.day);
        this.category = '';
    }

    onGoToOrders(filter, type) {
        this.router.navigate(['/owners-dashboard/orders', this.day.format('YYYY-MM-DD'), filter.id, '']);
    }

    /* called directly by different tables with order number */
    onOrderClicked_orderNumber(orderNumber: number) {
        let order = this.orders.find(o => o.number == orderNumber); // leave as is
        if (order) {
            this.onOrderClicked(order);
        }
    }

    /* called directly by day-orders-table */
    onOrderClicked(order: Order) {

        this.drilledOrder = order;
        this.drilledOrderNumber = order.number;
        this.drillTlogTime = order.businessDate;

        setTimeout(() => {
            this.drill = true;
        }, 300);

        this.ownersDashboardService.toolbarConfig.left.back.pre = () => {
            this.closeDrill();
            this.ownersDashboardService.toolbarConfig.left.back.pre = undefined;
            //prevent navigating back
            return false;
        };
    }

    onOpenOrderClicked(openOrder: any) {

        this.drilledOrder = openOrder;
        this.drilledOrderNumber = openOrder.number;
        this.drillTlogTime = openOrder.businessDate;

        setTimeout(() => {
            this.drill = true;
        }, 300);

        this.ownersDashboardService.toolbarConfig.left.back.pre = () => {
            this.closeDrill();
            this.ownersDashboardService.toolbarConfig.left.back.pre = undefined;
            //prevent navigating back
            return false;
        };
    }

    closeDrill() {
        this.drill = false;
    }

    getKeys(map) {
        return Array.from(map.keys());
    }

    onBackPressed() {
        if (!this.drill) {

        }
    }

    getPercentage(amount, total) {
        if (!total) {
            return 0;
        }

        return amount / total;
    }

}
