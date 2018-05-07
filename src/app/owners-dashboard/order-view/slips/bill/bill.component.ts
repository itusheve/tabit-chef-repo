import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})



export class OrderBillComponent implements OnInit {

  @Input() order: Order;
  @Input() orderOld: any;
  @Input() printDataOld: any;

  isMediaExchange = false;

  private Enums = {
    ORDER_TYPES: {
      MEDIAEXCHANGE: "MEDIAEXCHANGE"
    }
  }

  constructor() { }

  ngOnInit() {

    this.isMediaExchange = this.isMediaExchangeType(this.printDataOld);

  }


  private isMediaExchangeType(printData) {

    if (printData.variables && printData.variables.ORDER_TYPE === this.Enums.ORDER_TYPES.MEDIAEXCHANGE) {
      return true;
    }

    return false;
  }

}
