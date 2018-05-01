import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-cash-refund',
  templateUrl: './cashRefund.component.html',
  styleUrls: ['./cashRefund.component.scss']
})
export class OrderCashRefundComponent implements OnInit {

  @Input() data: any;
  @Input() printDataOld: any;
  
  constructor() {}
  
  ngOnInit() { }

}
