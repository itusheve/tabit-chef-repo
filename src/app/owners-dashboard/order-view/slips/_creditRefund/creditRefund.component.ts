import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-credit-refund',
  templateUrl: './creditRefund.component.html',
  styleUrls: ['./creditRefund.component.scss']
})
export class OrderCreditRefundComponent implements OnInit {

  @Input() data: any;
  
  constructor() {}
  
  ngOnInit() { }

}
