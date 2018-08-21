import {Component, OnInit} from '@angular/core';
import {DataService, BusinessDayKPI, CustomRangeKPI} from '../../../tabit/data/data.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
import 'rxjs/add/operator/switchMap';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Order} from '../../../tabit/model/Order.model';
import {ClosedOrdersDataService} from '../../../tabit/data/dc/closedOrders.data.service';
import {Shift} from '../../../tabit/model/Shift.model';
import {OrderType} from '../../../tabit/model/OrderType.model';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {KPI} from '../../../tabit/model/KPI.model';
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
    daySelectorOptions: {
        minDate: moment.Moment,
        maxDate: moment.Moment
    };

    dayHasSales: boolean;

    drillTlogTime;
    drill = false;
    drilledOrder: Order;
    drilledOrderNumber: number;

    public hasData: boolean;
    public hasNoDataForToday: boolean;

    public region: string;

    // for the pie chart
    public salesByOrderType: any;

    /* the day's Orders */
    public orders: Order[];

    public dailySummaryTblData: { title: string; data: SalesTableRow[] };
    public byShiftSummaryTblsData: { title: string; data: SalesTableRow[] }[];

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
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        operational: number;
    }[];

    public retentionData: {
        orderType: OrderType;
        waiter: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        retention: number;
    }[];

    public mtdBusinessData: any;

    public bdIsCurrentBd: boolean;
    public closedOpenSalesDiff: number;

    constructor(private ownersDashboardService: OwnersDashboardService,
                private closedOrdersDataService: ClosedOrdersDataService,
                private dataService: DataService,
                private route: ActivatedRoute,
                private router: Router,
                private ds: DebugService) {
        ownersDashboardService.toolbarConfig.left.back.pre = () => true;
        ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/home';
        ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        ownersDashboardService.toolbarConfig.menuBtn.show = false;
        this.region = environment.region;
    }

    extractOrders(dailyReport): Order[] {
        if (!dailyReport) {
            return [];
        }

        let orders = [];
        let tlogs = dailyReport.tlogs;
        let tlogsReductions = dailyReport.tlogsReduction;

        let i = 1;
        _.forEach(tlogs, tlog => {
            let order = new Order();
            order.id = i++;
            order.number = tlog.orderNumber;
            order.orderType = new OrderType(tlog.orderType, 1);

            order.sales = tlog.totalPaymentAmount;
            order.tlogId = tlog.tlogId;
            order.waiter = tlog.firstName + ' ' + tlog.lastName;
            order.openingTime = moment(tlog.opened);
            order.priceReductions = {
                cancellation: 0,
                discountsAndOTH: 0,
                employees: 0,
                promotions: 0
            };

            _.map(tlogsReductions, reduction => {
                if (reduction.tlogId === order.tlogId) {
                    if (reduction.reasonType === 'cancellation') {
                        order.priceReductions.cancellation = 1;
                    }
                    else if (reduction.reasonType === 'operational') {
                        order.priceReductions.promotions = 1; //promotions is old cube -> retention is new cube. makes no sense at all.
                    }
                    else if (reduction.reasonType === 'retention') {
                        order.priceReductions.discountsAndOTH = 1;
                    }
                    else if (reduction.reasonType === 'organizational') {
                        order.priceReductions.employees = 1;
                    }
                }
            });

            orders.push(order);
        });
        return orders;
    }

    private render() {
        this.hasData = false;
        this.dailySummaryTblData = undefined;
        this.byShiftSummaryTblsData = undefined;

        this.dataService.database$.subscribe(async database => {

            this.daySelectorOptions = {
                minDate: moment(database.getLowestDate()),
                maxDate: moment(moment())
            };

            const cbd: moment.Moment = moment();
            this.bdIsCurrentBd = false;

            let dailyReport = await this.dataService.getDailyReport(this.day);
            if (!dailyReport) {
                this.hasData = false;
                this.hasNoDataForToday = true;
                return;
            }

            this.hasData = true;
            this.hasNoDataForToday = false;

            this.closedOpenSalesDiff = undefined;

            //TODO: get open order from ROS and compare to write open orders amount for current BD only. see example below:
            /*const diff = totalOpenSales - totalClosedSales;
            if (diff > 0) this.closedOpenSalesDiff = diff;*/

            /*this.closedOrdersDataService.getOrders(this.day)
                .then((orders: Order[]) => {
                    this.orders = orders;

                    if (cbd.isSame(this.day, 'day')) {
                        this.bdIsCurrentBd = true;
                        this.dataService.todayDataVatInclusive$
                            .subscribe((kpi: KPI) => {
                                const totalClosedSales = this.orders.reduce((acc, curr) => (acc += curr.sales, acc), 0);
                                const totalOpenSales = kpi.sales || 0;
                                const diff = totalOpenSales - totalClosedSales;
                                if (diff > 0) this.closedOpenSalesDiff = diff;
                            });
                    }
                });*/


            this.orders = this.extractOrders(dailyReport);

            this.dailySummaryTblData = {
                title: '',
                data: _.filter(dailyReport.services, service => service.service === 'סיכום יומי')
            };

            this.byShiftSummaryTblsData = [
                {
                    title: 'צהריים',
                    data: _.filter(dailyReport.services, service => service.service === 'צהריים')
                },
                {
                    title: 'ערב',
                    data: _.filter(dailyReport.services, service => service.service === 'ערב')
                },
                {
                    title: 'לילה',
                    data: _.filter(dailyReport.services, service => service.service === 'לילה')
                }
            ];

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
            _.forEach(dailyReport.mostPopularItems, item => {
                this.mostSoldItems.byItem.push(
                    {
                        department: item.DepartmentId,
                        item: item.ItemName,
                        sales: item.salesNetAmount,
                        sold: item.salesSold,
                        prepared: 0,
                        returned: 0,
                        operational: 0
                    }
                );
            });

            this.mostReturnedItems = {byItem: []};
            _.forEach(dailyReport.mostReturnItems, item => {
                this.mostReturnedItems.byItem.push(
                    {
                        department: item.DepartmentId,
                        item: item.ItemName,
                        sales: 0,
                        sold: 0,
                        prepared: item.salesPrepared,
                        returned: item.salesReturn,
                        operational: item.salesReductionsOperationalDiscountAmount
                    }
                );
            });

            this.paymentsData = {payments: []};
            _.forEach(dailyReport.payments, payment => {
                this.paymentsData.payments.push({
                    accountGroup: payment.Type,
                    accountType: payment.Payments,
                    date: this.day,
                    clearerName: payment.Clearing,
                    paymentsKPIs: {
                        calcSalesAmnt: payment.SalesAmount,
                        refundAmnt: payment.RefundAmount,
                        paymentsAmount: payment.PaymentsAmount,
                        tipsAmnt: payment.TipsAmount,
                        totalPaymentsAmnt: payment.TtlpaymentsAmount
                    }
                });
            });

            this.operationalErrorsData = [];
            _.forEach(dailyReport.operationalReduction, record => {
                this.operationalErrorsData.push({
                    orderType: {id: record.orderType, rank: 1},
                    waiter: record.WaiterPRapprovedBy,
                    orderNumber: record.OrderNumber.match(/\d/g).join(''),
                    tableId: record.Tablenumber,
                    item: record.ItemName,
                    subType: record.ReasonType,
                    reasonId: record.ReasonName,
                    operational: record.ReductionsOperationalDiscountAmount
                });
            });

            this.retentionData = [];
            _.forEach(dailyReport.marketingRetentionReasons, retention => {
                this.retentionData.push({
                    orderType: {id: retention.orderType, rank: 1},
                    waiter: retention.WaiterPRapprovedBy,
                    orderNumber: retention.OrderNumber.match(/\d/g).join(''),
                    tableId: retention.Tablenumber,
                    item: retention.ItemName,
                    subType: retention.ReasonType,
                    reasonId: retention.ReasonName,
                    retention: retention.Amount
                });
            });

            let totals = _.filter(dailyReport.monthly, record => !record.businessDate);
            this.mtdBusinessData = {
                totals: totals[0],
                businessDays: _.filter(dailyReport.monthly, record => !!record.businessDate)
            };
        });
    }


    tmp(e) {
        console.info('gotcha!');
        e.stopPropagation();
    }

    //TODO on iOS when touching the circle it disappears

    ngOnInit() {
        window.scrollTo(0, 0);

        this.route.paramMap
            .subscribe((params: ParamMap) => {
                const dateStr = params.get('businessDate');
                // if (dateStr) {
                this.day = moment(dateStr);
                // }
                //  else {
                //   this.day = moment().subtract(1, 'day');
                // }
                this.render();
            });
    }

    // ngAfterViewInit() {
    // this.visibilityService.monitorVisibility(<any>document.getElementsByClassName('daySelectorNotFixed')[0], <any>document.getElementsByTagName('mat-sidenav-content')[0])
    // this.visibilityService.monitorVisibility(<any>document.getElementsByClassName('daySelectorNotFixed')[0], <any>document.getElementsByClassName('willItWork')[0])
    //   .subscribe(visible => {
    //     console.info(`visible: ${visible}`);
    //     this.daySelectorVisible = visible;
    //   });
    // }

    onDateChanged(dateM: moment.Moment) {
        this.hasData = false;
        const date = dateM.format('YYYY-MM-DD');
        this.router.navigate(['/owners-dashboard/day', date]);
    }

    onGoToOrders(filter, type) {
        this.router.navigate(['/owners-dashboard/orders', this.day.format('YYYY-MM-DD'), filter.id, '']);
    }

    /* called directly by different tables with order number */
    onOrderClicked_orderNumber(orderNumber: number) {
        const order = this.orders.find(o => o.number === orderNumber);
        if (order) {
            this.onOrderClicked(order);
        }
    }

    /* called directly by day-orders-table */
    onOrderClicked(order: Order) {

        this.drilledOrder = order;
        this.drilledOrderNumber = order.number;
        this.drillTlogTime = order.openingTime;

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
