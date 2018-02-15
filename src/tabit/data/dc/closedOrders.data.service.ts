import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
// import { zip } from 'rxjs/observable/zip';

import { Order } from '../../model/Order.model';
import { OlapEp } from '../ep/olap.ep';
import { DataService } from '../data.service';

@Injectable()
export class ClosedOrdersDataService {

    /* 
        the stream emits the currentBd's last closed order time, in the restaurant's timezone and in the format dddd
        e.g. 1426 means the last order was closed at 14:26, restaurnat time 
    */
    public lastClosedOrderTime$:Observable<any> = new Observable(obs=>{
        this.dataService.currentBd$.subscribe((cbd: moment.Moment)=>{
            this.olapEp.getLastClosedOrderTime(cbd)
                .then((lastClosedOrderTime: string) => {
                    obs.next(lastClosedOrderTime);
                });
        });
    }).publishReplay(1).refCount();
    
    constructor(private olapEp: OlapEp, private dataService: DataService) {}

    /* 
        return a promise that resolves with a collection of Orders.
        if withPriceReductions, each order will also get enriched with price reduction related data
    */
    public getOrders(
        day: moment.Moment, 
        { withPriceReductions = false }: { withPriceReductions?: boolean } = {}
    ): Promise<Order[]> {        
        const that = this;
        
        const pAll: any = [
            this.olapEp.getOrders({ day: day })
        ];
        if (withPriceReductions) pAll.push(this.olapEp.getOrdersPriceReductionData(day));

        return Promise.all(pAll)
            .then((data: any[])=>{
                const ordersRaw:any[] = data[0];
                const priceReductionsRaw:any[] = data[1];
                
                const orders: Order[] = [];
                for (let i = 0; i < ordersRaw.length; i++) {
                    const order: Order = new Order();
                    order.id = i;
                    order.openingTime = ordersRaw[i].openingTime;
                    order.number = ordersRaw[i].orderNumber;
                    order.waiter = ordersRaw[i].waiter;
                    order.orderTypeId = this.dataService.orderTypes.find(ot => ot.caption === ordersRaw[i].orderTypeCaption)['id'];
                    order.sales = ordersRaw[i].sales;
                    order.diners = ordersRaw[i].dinersPPA;
                    order.ppa = ordersRaw[i].ppa;
                    
                    const orderPriceReductionsRaw_aggregated = {
                        cancellation: 0,//summarises: {dim:cancellations,measure:cancellations} AND {dim:operational,measure:operational}   heb: ביטולים
                        discountsAndOTH: 0,//{dim:retention,measure:retention}  heb: שימור ושיווק
                        employees: 0,//{dim:organizational,measure:organizational}  heb: עובדים
                        promotions: 0,//{dim:promotions,measure:retention}  heb: מבצעים
                    };

                    priceReductionsRaw
                        .filter(pr => pr.orderNumber === order.number)
                        .forEach(o=>{
                            const dim = o.reductionReason;                            
                            switch (dim) {
                                case 'cancellation':
                                case 'compensation':
                                    orderPriceReductionsRaw_aggregated.cancellation += (o.cancellation + o.operational);
                                    break;
                                case 'retention':
                                    orderPriceReductionsRaw_aggregated.discountsAndOTH += o.retention;
                                    break;                                    
                                case 'organizational':
                                    orderPriceReductionsRaw_aggregated.employees += o.organizational;
                                    break;                                                                        
                                case 'promotions':
                                    orderPriceReductionsRaw_aggregated.promotions += o.retention;
                                    break;                                                                        
                            }
                        });

                    order.priceReductions = orderPriceReductionsRaw_aggregated;

                    orders.push(order);
                }
                return orders;
            });
    }

}
