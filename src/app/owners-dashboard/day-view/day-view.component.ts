import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../tabit/data/data.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ClosedOrdersDataService} from '../../../tabit/data/dc/closedOrders.data.service';

import * as moment from 'moment';
import * as _ from 'lodash';

import {zip, combineLatest, Subject} from 'rxjs';
import {Order} from '../../../tabit/model/Order.model';
import {OrderType} from '../../../tabit/model/OrderType.model';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {Orders_KPIs, PaymentsKPIs} from '../../../tabit/data/ep/olap.ep';
import {DebugService} from '../../debug.service';
import {environment} from '../../../environments/environment';

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

    public dailySummaryTblData: { title: string; data: SalesTableRow[] };
    public byShiftSummaryTblsData: {  title: string; data: SalesTableRow[] }[];

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
        },
        thisYear: {
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
        payments: {
            accountGroup: string;
            accountType: string;
            clearerName: string;
            date: moment.Moment;
            paymentsKPIs: PaymentsKPIs;
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

    public mtdBusinessData: any;
    public salesByHour: any;
    public today: moment.Moment;
    public bdIsCurrentBd: boolean;
    public closedOpenSalesDiff: number;
    public openOrders: any;
    private day$ = new Subject<moment.Moment>();

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
        this.region = environment.region;
        this.hasData = false;
        this.today = moment();
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

            order.sales = tlog.totalAmount;
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

            if(tlogFlag) {
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

        combineLatest(this.day$, this.dataService.databaseV2$)
        .subscribe(data => {
            let date = data[0];
            let database = data[1];
            this.daySelectorOptions = {
                minDate: moment(database.getLowestDate()),
                maxDate: moment(moment())
            };

            this.dayFromDatabase = database.getDay(date);
        });

        combineLatest(this.day$, this.dataService.refresh$).subscribe(async data => {
            let dayDate = data[0];

            let dailyReport = await this.dataService.getDailyReport(dayDate);
            if (!dailyReport || !dailyReport.summary) {
                this.hasData = false;
                this.hasNoDataForToday = true;
                return;
            }

            this.orders = this.extractOrders(dailyReport);

            dailyReport.summary = _.orderBy(dailyReport.summary, 'orderTypeKey', 'asc');
            this.dailySummaryTblData = {
                title: '',
                data: _.filter(dailyReport.summary, summary => summary.serviceKey == '-1')
            };


            if (!moment().isSame(dayDate, 'day')) {
                this.bdIsCurrentBd = false;
                this.openOrders = null;
            }
            else {
                this.bdIsCurrentBd = true;
                this.openOrders = await this.dataService.getOpenOrders();
            }

            this.byShiftSummaryTblsData = [];
            _.forEach(dailyReport.summary, summary => {
                let serviceKey = _.get(summary, 'serviceKey');
                if (serviceKey && serviceKey != '-1') {
                    if(!this.byShiftSummaryTblsData[+serviceKey]) {
                        this.byShiftSummaryTblsData[+serviceKey] = {title: summary.serviceName, data: []};
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
                },
                thisYear: {
                    totalSales: 0,
                    bySubDepartment: []
                },
            };

            _.forEach(dailyReport.categories, category => {
                if (!category.subDepartment) {
                    this.salesBySubDepartment.thisBd.totalSales = category.businessDate;
                    this.salesBySubDepartment.thisWeek.totalSales = category.week;
                    this.salesBySubDepartment.thisMonth.totalSales = category.month;
                    this.salesBySubDepartment.thisYear.totalSales = category.year;
                }
                else {
                    this.salesBySubDepartment.thisBd.bySubDepartment.push({
                        subDepartment: category.subDepartment,
                        sales: category.businessDate
                    });
                    this.salesBySubDepartment.thisWeek.bySubDepartment.push({
                        subDepartment: category.subDepartment,
                        sales: category.week
                    });
                    this.salesBySubDepartment.thisMonth.bySubDepartment.push({
                        subDepartment: category.subDepartment,
                        sales: category.month
                    });
                    this.salesBySubDepartment.thisYear.bySubDepartment.push({
                        subDepartment: category.subDepartment,
                        sales: category.year
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

            this.paymentsData = {payments: []};
            _.forEach(dailyReport.payments, payment => {
                this.paymentsData.payments.push({
                    accountGroup: payment.type,
                    accountType: payment.name,
                    date: dayDate,
                    clearerName: payment.clearingName || payment.name,
                    paymentsKPIs: {
                        daily: payment.DailyPaymentAmount,
                        monthly: payment.MonthlyPaymentAmount,
                        yearly: payment.YearlyPaymentAmount
                    }
                });
            });

            this.operationalErrorsData = [];
            _.forEach(dailyReport.operational, record => {
                this.operationalErrorsData.push({
                    orderType: {id: record.orderType, rank: 1},
                    waiter: record.reducedByName,
                    approvedBy: record.approvedByName,
                    orderNumber: record.orderNumber,
                    tableId: record.tableNumber,
                    item: record.itemName,
                    subType: record.reasonName,
                    reasonId: record.reasonSubTypeHebrew,
                    operational: record.operationalDiscountAmount,
                    tlogId: record.tlogId
                });
            });

            this.retentionData = [];
            _.forEach(dailyReport.reduction, reduction => {
                this.retentionData.push({
                    orderType: {id: reduction.orderType, rank: 1},
                    waiter: reduction.reducedByName,
                    approvedBy: reduction.approvedByName,
                    orderNumber: reduction.orderNumber,
                    tableId: reduction.tableNumber,
                    item: reduction.itemName,
                    subType: reduction.reasonName,
                    reasonId: reduction.reasonSubTypeHebrew,
                    retention: reduction.retentionDiscountAmount,
                    tlogId: reduction.tlogId
                });
            });

            let totals = _.filter(dailyReport.monthly, record => !record.businessDate);
            this.mtdBusinessData = {
                totals: totals[0],
                businessDays: _.filter(dailyReport.monthly, record => !!record.businessDate)
            };

            let that = this;
            setTimeout(() => {
                that.hasData = true;
                that.hasNoDataForToday = false;
            }, 300);
        });
    }

    ngOnInit() {
        this.today = moment();
        this.hasData = false;
        window.scrollTo(0, 0);
        this.render();

        this.dataService.refresh$.subscribe(refresh => {
            this.hasData = false;
            this.dailySummaryTblData = undefined;
            this.byShiftSummaryTblsData = undefined;
        });

        this.route.paramMap
            .subscribe((params: ParamMap) => {
                const dateStr = params.get('businessDate');
                this.day = moment(dateStr);
                this.day$.next(this.day);
            });
    }


    onDateChanged(dateM: moment.Moment) {
        this.hasData = false;
        this.day = dateM;
        this.day$.next(this.day);
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

}
