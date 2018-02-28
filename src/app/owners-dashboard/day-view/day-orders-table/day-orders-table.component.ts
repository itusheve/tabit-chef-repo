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
  styleUrls: ['./day-orders-table.component.scss']
})
export class DayOrdersTableComponent implements OnInit {

  @Input() orders: Order[];
  @Output() onOrderClicked = new EventEmitter();

  public byOrderTypes: OrderTypeVM[];

  datePipe: DatePipe = new DatePipe('he-IL');

  public sortBy: string;//time, number, waiter, sales
  public sortDir = 'asc';//asc | desc  
  public filters: {type: string, on: boolean}[] = [];

  constructor(private dataService: DataService, private closedOrdersDataService: ClosedOrdersDataService) {}
  
  ngOnInit() {
    const ordersCloned: Order[] = _.cloneDeep(this.orders);

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

  sort(orderType: any, by: string) {
    if (this.sortBy && this.sortBy===by) {
      this.sortDir = this.sortDir==='desc' ? 'asc' : 'desc';
    } else {
      this.sortDir = 'asc';
      this.sortBy = by;
    }
    let field;
    switch(by) {
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
    let dir = this.sortDir==='asc' ? -1 : 1;
    this.byOrderTypes.find(o => o.id === orderType.id)
      .orders
      .sort((a, b) => (a[field] < b[field] ? dir : dir*-1));
  }

  filter(orderType: any, type: string) {
    const existingFilter = this.filters.find(f=>f.type===type);
    if (existingFilter) {
      existingFilter.on = !existingFilter.on;
    } else {
      this.filters.push({
        type: type,
        on: true
      });
    }

    this.byOrderTypes.forEach(o=>{
      o.orders.forEach(ord=>{
        let filter = false;
        this.filters.forEach(f=>{
          if (f.on) {
            const reductionAmount = ord['priceReductions'][f.type];
            if (!reductionAmount) filter = true;
          }
        });                
        ord.filtered = filter;
      });
    });
  }

  iconFilterOn(type: string) {
    const filter = this.filters.find(f=>f.type===type);
    if (filter && filter.on) return true;
    return false;
  }

}
