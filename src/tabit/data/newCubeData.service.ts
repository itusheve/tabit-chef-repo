//angular
import { Injectable } from '@angular/core';

//rxjs
import { fromPromise } from 'rxjs/observable/fromPromise';
import { combineLatest } from 'rxjs/observable/combineLatest';

//tools
import * as _ from 'lodash';
import * as moment from 'moment';

//models
import { Shift } from '../model/Shift.model';
import { OrderType } from '../model/OrderType.model';

//services
import { DataService } from './data.service';
import { DebugService } from '../../app/debug.service';
import { NewCubeOlapEp } from './ep/newCubeOlap.ep';

// for new cube structure (US for now)
export interface NewCube_KPIs {
    netSalesAmnt?: number;
    taxAmnt?: number;
    grossSalesAmnt?: number;
    tipsAmnt?: number;
    serviceChargeAmnt?: number;
    paymentsAmnt?: number;
    dinersCount?: number;
    ordersCount?: number;
    ppa?: number;
}

// for new cube structure (US for now)
export interface NewCube_BusinessDayKPIs {
    businessDay: moment.Moment;

    //bd kpis:
    kpis: NewCube_KPIs;

    //bd * orderType kpis:
    byOrderType: Map<OrderType, NewCube_KPIs>;

    //bd * shift * orderType kpis:
    byShiftByOrderType: Map<
        Shift,
        {
            kpis: NewCube_KPIs,
            byOrderType: Map<OrderType, NewCube_KPIs>
        }
    >;
}

@Injectable()
export class newCubeDataService {
    //The Class supports US cube only for now, until the IL cube will get updated

    constructor(
        private dataService: DataService,
        private newCubeOlapEp: NewCubeOlapEp,
        private ds: DebugService
    ) {}

    /*
        returns NewCube_BusinessDayKPIs for the BusinessDate (bd)
    */
    getBusinessDateKPIs(bd: moment.Moment): Promise<NewCube_BusinessDayKPIs> {
        return new Promise((resolve, reject) => {

            const that = this;

            const data$ = combineLatest(
                this.dataService.shifts$,
                fromPromise(this.newCubeOlapEp.get_BD_data_by_orderType_by_shift(bd)),
                (shifts, bd_data_by_orderType_by_shift_raw) => Object.assign({}, { shifts: shifts }, { bd_data_by_orderType_by_shift_raw: bd_data_by_orderType_by_shift_raw })
            );

            data$.subscribe(data => {

                // data preparation
                const bd_data_by_orderType_by_shift: {
                    orderType: OrderType,
                    shift: Shift,
                    sales: number,
                    dinersSales: number,
                    dinersCount: number,
                    ordersCount: number
                }[] = (function () {
                    // clone raw data
                    const bd_data_by_orderType_by_shift_raw: {
                        orderType: string | OrderType,
                        service: string,
                        shift: Shift,
                        sales: number,
                        dinersSales: number,
                        dinersCount: number,
                        ordersCount: number
                    }[] = _.cloneDeep(data.bd_data_by_orderType_by_shift_raw);

                    // normalize olapData:
                    bd_data_by_orderType_by_shift_raw.forEach(o => {
                        o.orderType = that.dataService.orderTypes[o.orderType];
                        o.shift = data.shifts.find(s => s.name === o.service);
                    });

                    // be VAT aware
                    if (!data.vat) {
                        daily_data_by_orderType_by_service_raw.forEach(tuple => {
                            tuple.sales = tuple.sales / 1.17;
                            tuple.dinersSales = tuple.dinersSales / 1.17;
                        });
                    }

                    // prepare final data
                    const daily_data_by_orderType_by_service_: any = daily_data_by_orderType_by_service_raw.map(o => ({
                        orderType: o.orderType,
                        shift: o.shift,
                        sales: o.sales,
                        dinersSales: o.dinersSales,
                        dinersCount: o.dinersCount,
                        ordersCount: o.ordersCount
                    }));

                    return daily_data_by_orderType_by_service_;
                }());

                // byShiftByOrderType setup
                const byShiftByOrderType: Map<
                    Shift,
                    {
                        totalSales: number,
                        byOrderType: Map<OrderType, {
                            sales: number,
                            dinersOrOrders: number,
                            average: number
                        }>
                    }
                    > = (function () {
                        const byShiftByOrderType = new Map<
                            Shift,
                            {
                                totalSales: number,
                                byOrderType: Map<OrderType, {
                                    sales: number,
                                    dinersOrOrders: number,
                                    average: number
                                }>
                            }
                            >();

                        if (!data.shifts.length) {
                            return byShiftByOrderType;
                        }

                        for (let i = 0; i < data.shifts.length; i++) {
                            byShiftByOrderType.set(data.shifts[i], {
                                totalSales: 0,
                                byOrderType: new Map<OrderType, {
                                    sales: number,
                                    dinersOrOrders: number,
                                    average: number
                                }>()
                            });
                        }

                        daily_data_by_orderType_by_service.forEach(o => {
                            const mapEntry = byShiftByOrderType.get(o.shift);
                            let dinersOrOrders;
                            let average;
                            if (o.orderType.id === 'seated') {
                                dinersOrOrders = o.dinersCount;
                                average = o.dinersCount > 0 ? o.dinersSales / o.dinersCount : undefined;
                            } else {
                                dinersOrOrders = o.ordersCount;
                                average = o.ordersCount > 0 ? o.sales / o.ordersCount : undefined;
                            }

                            mapEntry.byOrderType.set(o.orderType, {
                                sales: o.sales,
                                dinersOrOrders: dinersOrOrders,
                                average: average
                            });

                            mapEntry.totalSales += o.sales;
                        });

                        //remove shifts with 0 sales
                        byShiftByOrderType.forEach((val, key, map) => {
                            if (val.totalSales === 0) {
                                map.delete(key);
                            }
                        });

                        return byShiftByOrderType;
                    }());

                // byOrderType setup
                const byOrderType: Map<OrderType, {
                    sales: number,
                    dinersOrOrders: number,
                    average: number
                }> = (function () {
                    const byOrderType = new Map<OrderType, {
                        sales: number,
                        dinersOrOrders: number,
                        average: number
                    }>();

                    const byOrderType_: {
                        [index: string]: {
                            orderType: OrderType,
                            service: any,
                            sales: number,
                            dinersSales: number,
                            dinersCount: number,
                            ordersCount: number
                        }[]
                    } = _.groupBy(daily_data_by_orderType_by_service, item => item.orderType.id);

                    const byOrderType_reduced: {
                        [index: string]: {
                            orderType: OrderType,
                            sales: number,
                            dinersSales: number,
                            dinersCount: number,
                            ordersCount: number
                        }
                    } = {};

                    Object.keys(byOrderType_).forEach(orderTypeId => {
                        const reduced = byOrderType_[orderTypeId].reduce((acc, curr) => {
                            return {
                                orderType: curr.orderType,
                                sales: acc.sales + curr.sales,
                                dinersSales: acc.dinersSales + curr.dinersSales,
                                dinersCount: acc.dinersCount + curr.dinersCount,
                                ordersCount: acc.ordersCount + curr.ordersCount
                            };
                        }, {
                                orderType: undefined,
                                sales: 0,
                                dinersSales: 0,
                                dinersCount: 0,
                                ordersCount: 0
                            });

                        byOrderType_reduced[orderTypeId] = reduced;
                    });

                    Object.keys(byOrderType_reduced).forEach(orderTypeId => {
                        const obj = byOrderType_reduced[orderTypeId];
                        const orderType = obj.orderType;

                        let dinersOrOrders;
                        let average;
                        if (orderType.id === 'seated') {
                            dinersOrOrders = obj.dinersCount;
                            average = obj.dinersCount > 0 ? obj.dinersSales / obj.dinersCount : undefined;
                        } else {
                            dinersOrOrders = obj.ordersCount;
                            average = obj.ordersCount > 0 ? obj.sales / obj.ordersCount : undefined;
                        }

                        byOrderType.set(orderType, {
                            sales: obj.sales,
                            dinersOrOrders: dinersOrOrders,
                            average: average
                        });
                    });

                    return byOrderType;
                }());

                // totalSales setup
                const totalSales: number = (function () {
                    let totalSales = 0;

                    byOrderType.forEach(o => {
                        totalSales += o.sales;
                    });

                    return totalSales;
                }());

                resolve({
                    businessDay: moment(bd),
                    totalSales: totalSales,
                    byOrderType: byOrderType,
                    byShiftByOrderType: byShiftByOrderType
                });

            });

        });
    }

}
