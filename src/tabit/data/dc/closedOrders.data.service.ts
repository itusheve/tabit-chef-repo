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
                    
                    const orderPriceReductionsRaw = priceReductionsRaw.find(pr => pr.orderNumber === order.number);
                    if (orderPriceReductionsRaw) {
                        order.priceReductions = {
                            cancellation: orderPriceReductionsRaw.cancellation,
                            operational: orderPriceReductionsRaw.operational,
                            retention: orderPriceReductionsRaw.retention,
                            organizational: orderPriceReductionsRaw.organizational
                        };
                    }

                    orders.push(order);
                }
                return orders;
            });
    }

}
