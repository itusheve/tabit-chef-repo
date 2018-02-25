import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Order } from '../../../../tabit/model/Order.model';
import { DataService } from '../../../../tabit/data/data.service';


import * as _ from 'lodash';
import { ClosedOrdersDataService } from '../../../../tabit/data/dc/closedOrders.data.service';

export interface OrderTypeVM {
  id: string;
  caption: string;
  orders: any[];
  sales: number;
}

@Component({
  selector: 'app-day-orders-table',
  templateUrl: './day-orders-table.component.html',
  styleUrls: ['./day-orders-table.component.css']
})
export class DayOrdersTableComponent implements OnInit {

  @Input() orders: Order[];
  @Output() onOrderClicked = new EventEmitter();

  public byOrderTypes: OrderTypeVM[];

  datePipe: DatePipe = new DatePipe('he-IL');

  constructor(private dataService: DataService, private closedOrdersDataService: ClosedOrdersDataService) {}
  
  ngOnInit() {
    const ordersCloned = _.cloneDeep(this.orders);
    ordersCloned.forEach((order:any)=>{
      // order._hasReturns = (order.priceReductions.cancellation + order.priceReductions.operational) ? true : false;
      // order._hasDiscounts = order.priceReductions.retention ? true : false;
      // order._hasOrganizational = order.priceReductions.organizational ? true : false;      
    });

    const orderTypes = _.cloneDeep(this.dataService.orderTypes);

    orderTypes.forEach(ot=>{
      ot.orders = ordersCloned.filter(o => o.orderTypeId === ot.id).sort((a, b) => a.number < b.number ? -1 : 1);    
      ot.sales = ot.orders.reduce((acc, curr) => acc + (curr.sales || 0), 0);
    });
    this.byOrderTypes = orderTypes;

  }

  orderClicked(order:any) {
    this.onOrderClicked.emit(order);    
  }

}
