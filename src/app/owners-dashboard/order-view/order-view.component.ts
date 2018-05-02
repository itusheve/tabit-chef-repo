import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
import { Order } from '../../../tabit/model/Order.model';

import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';
import ORDERS_VIEW from '../../../tabit/data/dc/closedOrders.data.service';
import { OwnersDashboardService } from '../owners-dashboard.service';

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
export class OrderViewComponent implements OnInit {

  @Input() orderNumber: number;

  show = false;

  order: Order;
  orderOld: any;
  printDataOld: any;
  ORDERS_VIEW: any;
  orderDocs: any;


  //<!-- https://github.com/angular/material2/issues/5269 -->
  // selectedTabIndex;

  constructor(
    private closedOrdersDataService: ClosedOrdersDataService,
    private route: ActivatedRoute
  ) {
    this.ORDERS_VIEW = ORDERS_VIEW;
    this.orderDocs = {};
  }

  ngOnInit() {

    this.route.paramMap
      .subscribe((params: ParamMap) => {
        const dateStr = params.get('businessDate');

        this.closedOrdersDataService.getOrder(dateStr, this.orderNumber, { enriched: true })
          .then((o: {
            order: Order,
            orderOld: any,
            printDataOld: any
          }) => {
            const order = o.order;
            const orderOld = o.orderOld;
            const printDataOld = o.printDataOld;
            //TODO use destructuring instead...

            this.order = order;
            this.orderOld = orderOld;
            this.printDataOld = printDataOld;

            this.orderOld.allDocuments.forEach(doc => {

              this.orderDocs[doc._id] = {
                id: doc._id,
                docType: doc._type,
                isRefund: doc._type.includes('refund'),
                loading: true,
                data: undefined
              };

            });

            // set async request to load print data by invoice.
            this.initAllDocsAsync();

            this.show = true;
          });
      });


  }


  private initAllDocsAsync() {

    this.orderOld.allDocuments.forEach(doc => {

      this.closedOrdersDataService.getPrintData(doc._id)
        .then((result) => {

          this.orderDocs[doc._id].loading = false;
          this.orderDocs[doc._id].data = result[0];

        });

    });

  }



}
