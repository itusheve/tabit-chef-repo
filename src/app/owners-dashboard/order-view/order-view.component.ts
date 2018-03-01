import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import * as _ from 'lodash';
import { Order } from '../../../tabit/model/Order.model';

import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';
import ORDERS_VIEW from '../../../tabit/data/dc/closedOrders.data.service';

export interface SlipVM {
  id: number;
  class: string;//bill/club
  subclass?: string;
  caption: string;
  data?: any;
}

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit  {

  @Input() tlogId: string;

  show = false;

  order: Order;  
  orderOld: any;
  printDataOld: any;
  ORDERS_VIEW: any;

  
  //<!-- https://github.com/angular/material2/issues/5269 -->
  // selectedTabIndex;

  constructor(
    private closedOrdersDataService: ClosedOrdersDataService,
    private route: ActivatedRoute
  ) {
    this.ORDERS_VIEW = ORDERS_VIEW;
  }
  
  ngOnInit() {

    this.route.paramMap
      .subscribe((params: ParamMap) => { 
        const dateStr = params.get('businessDate');
        
        this.closedOrdersDataService.getOrder(dateStr, this.tlogId, {enriched: true})
          .then((o:{
            order: Order,
            orderOld: any,
            printDataOld: any
          })=>{

            const order = o.order;
            const orderOld = o.orderOld;
            const printDataOld = o.printDataOld;
            //TODO use destructuring instead...

            this.order = order;
            this.orderOld = orderOld;
            this.printDataOld = printDataOld;

            this.show = true;
          });
      });
  }

}
