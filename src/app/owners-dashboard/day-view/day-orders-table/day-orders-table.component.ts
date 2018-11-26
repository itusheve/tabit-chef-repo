import {Component, OnChanges, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {DatePipe} from '@angular/common';

import {Order} from '../../../../tabit/model/Order.model';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';

import * as _ from 'lodash';
import {environment} from '../../../../environments/environment';
import * as moment from 'moment';

export interface OrderTypeVM {
    id: string;
    caption: string;
    orders: any[];
    sales: number;
}

@Component({
    selector: 'app-day-orders-table',
    templateUrl: './day-orders-table.component.html',
    styleUrls: ['./day-orders-table.component.scss']
})
export class DayOrdersTableComponent implements OnChanges {
    loading = true;
    noData = false;
    openOrders: any;
    @Input() orders: Order[];
    @Input() lastViewed: Order;
    @Input() bdIsCurrentBd: boolean;
    @Input() todayOpenOrders: any;
    @Output() onOrderClicked = new EventEmitter();
    @Output() onOpenOrderClicked = new EventEmitter();

    public byOrderTypes: OrderTypeVM[];

    datePipe: DatePipe = new DatePipe(environment.tbtLocale);

    public sortBy: string;//time, number, waiter, sales
    public sortDir = 'asc';//asc | desc
    public filters: { type: string, on: boolean }[] = [];
    public env;

    constructor(private dataService: DataService) {
        this.env = environment;
    }

    ngOnChanges(o: SimpleChanges) {

        this.openOrders = {totalAmount: 0, count: 0, orders: []};
        if (this.todayOpenOrders && this.bdIsCurrentBd) {
            this.noData = false;
            this.openOrders.totalAmount = 0;
            this.openOrders.count = 0;
            this.openOrders.orders = [];
            _.forEach(this.todayOpenOrders, openOrder => {
                let formattedOpenOrder = {
                    openingTime: openOrder.created,
                    number: openOrder.number,
                    waiter: openOrder.owner,
                    sales: 0
                };

                if (openOrder.totals.totalAmount > 0) {
                    let sales = openOrder.totals.netSales / 100;
                    this.openOrders.totalAmount += sales;
                    formattedOpenOrder.sales = sales;
                }

                this.openOrders.count++;
                this.openOrders.orders.push(formattedOpenOrder);
            });
        }

        if (o.orders && o.orders.currentValue) {
            this.loading = true;
            this.noData = false;

            const ordersCloned: Order[] = _.cloneDeep(this.orders);

            const orderTypesObj = this.dataService.orderTypes;
            let orderTypesArr = [];
            Object.keys(orderTypesObj).forEach(key => {
                orderTypesArr.push({
                    id: key,
                    caption: tmpTranslations.get(`orderTypes.${key}`),
                    rank: orderTypesObj[key].rank
                });
            });
            orderTypesArr = orderTypesArr.sort((a, b) => {
                if (a.rank < b.rank) return -1;
                return 1;
            });

            let totalOrdersCount = 0;
            orderTypesArr.forEach(ot => {
                ot.orders = ordersCloned.filter(o => o.orderType.id === ot.id).sort((a, b) => a.number < b.number ? -1 : 1);
                ot.sales = ot.orders.reduce((acc, curr) => acc + (curr.sales || 0), 0);
                ot.salesBeforeTip = ot.orders.reduce((acc, curr) => acc + (curr.salesBeforeTip || 0), 0);
                ot.ordersCount = ot.orders.reduce((acc, curr) => (acc + 1), 0);
                totalOrdersCount += ot.ordersCount;
            });
            this.byOrderTypes = orderTypesArr;

            if (totalOrdersCount === 0) {
                this.noData = true;
            }

            this.loading = false;
        }

    }

    orderClicked(order: any) {
        this.onOrderClicked.emit(order);
    }

    openOrderClicked(openOrder: any) {
        this.onOpenOrderClicked.emit(openOrder);
    }

    sort(orderType: any, by: string) {
        if (this.sortBy && this.sortBy === by) {
            this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
        } else {
            if (by === 'sales') {
                this.sortDir = 'desc';
            } else {
                this.sortDir = 'asc';
            }
            this.sortBy = by;
        }
        let field;
        switch (by) {
            case 'time':
            case 'number':
                field = 'number';
                break;
            case 'waiter':
                field = 'waiter';
                break;
            case 'sales':
                field = 'sales';
                break;
        }
        let dir = this.sortDir === 'asc' ? -1 : 1;
        this.byOrderTypes.find(o => o.id === orderType.id)
            .orders
            .sort((a, b) => (a[field] < b[field] ? dir : dir * -1));
    }

    private markOrdersAsFiltered() {
        this.byOrderTypes.forEach(o => {
            o.orders.forEach(ord => {
                let filter = false;
                this.filters.forEach(f => {
                    if (f.on) {
                        const reductionAmount = ord['priceReductions'][f.type];
                        if (!reductionAmount) filter = true;
                    }
                });
                ord.filtered = filter;
            });
        });
    }

    filter(orderType: any, type: string) {
        const existingFilter = this.filters.find(f => f.type === type);
        if (existingFilter) {
            existingFilter.on = !existingFilter.on;
        } else {
            this.filters.push({
                type: type,
                on: true
            });
        }
        this.markOrdersAsFiltered();
    }

    iconFilterOn(type: string) {
        const filter = this.filters.find(f => f.type === type);
        if (filter && filter.on) return true;
        return false;
    }

    panelClosed() {
        this.filters = [];
        this.markOrdersAsFiltered();
    }

    getClosedOrderHour(time) {
        time = moment.utc(time, 'HH:mm');
        if(environment.tbtLocale === 'he-IL') {
            return time.format('HH:mm');
        }
        else {
            return time.format('h:mm A');
        }
    }

    getOpenOrderHour(time) {
        time = moment(time);
        if(environment.tbtLocale === 'he-IL') {
            return time.format('HH:mm');
        }
        else {
            return time.format('h:mm A');
        }
    }
}
