import { Component, OnInit, Input } from '@angular/core';
import { Order } from '../../../../tabit/model/Order.model';
import { DataService } from '../../../../tabit/data/data.service';

import * as _ from 'lodash';

export interface OrderTypeVM {
  id: string;
  caption: string;
  orders: Order[];
  sales: number;
}

@Component({
  selector: 'app-day-orders-table',
  templateUrl: './day-orders-table.component.html',
  styleUrls: ['./day-orders-table.component.css']
})
export class DayOrdersTableComponent implements OnInit {

  @Input() orders: Order[];

  public byOrderTypes: OrderTypeVM[];

  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    const orderTypes = _.cloneDeep(this.dataService.orderTypes);
    orderTypes.forEach(ot=>{
      ot.orders = this.orders.filter(o=>o.orderTypeId===ot.id);
      ot.sales = ot.orders.reduce((acc, curr)=>acc+(curr.sales || 0),0);      
    });
    this.byOrderTypes = orderTypes;

  }

}
