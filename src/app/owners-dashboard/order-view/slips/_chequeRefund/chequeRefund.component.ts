import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-cheque-refund',
  templateUrl: './chequeRefund.component.html',
  styleUrls: ['./chequeRefund.component.scss']
})
export class OrderChequeRefundComponent implements OnInit {

  @Input() data: any;
  
  constructor() {}
  
  ngOnInit() { }

}
