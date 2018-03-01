import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class OrderDetailsComponent implements OnInit {

  @Input() order: Order;
  @Input() orderOld: any;
  // @Input() printDataOld: any;
  @Input() ORDERSVIEW:any;
  
  isUS = false;

  uiArgs = {
    offers: {
      collapsed: true
    },
    timeline: {
      collapsed: true
    },
    items: {
      collapsed: true
    },
    payments: {
      collapsed: true
    },
    discounts: {
      collapsed: true
    },
    promotions: {
      collapsed: true
    },
    cancellations: {
      collapsed: true
    }
  };

  constructor() { }    
  
  ngOnInit() { }

  checkOrderer(selectedOrder) {
      if (selectedOrder.orderType !== 'Delivery' && selectedOrder.orderType !== 'TA') {
        return false;
      }

      let orderer = selectedOrder.orderer;
      if (orderer.hasOwnProperty('name') && orderer.name !== undefined ||
        orderer.hasOwnProperty('phone') && orderer.phone !== undefined ||
        orderer.hasOwnProperty('deliveryAddressSummary') && orderer.deliveryAddressSummary !== undefined ||
        (orderer.hasOwnProperty('deliveryAddress') && orderer.deliveryAddress !== undefined &&
          orderer.deliveryAddress.hasOwnProperty('notes') && orderer.deliveryAddress.notes !== undefined)) {
        return true;
      } else {
        return false;
      }
  }

}
