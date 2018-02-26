import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-delivery-note-refund',
  templateUrl: './deliveryNoteRefund.component.html',
  styleUrls: ['./deliveryNoteRefund.component.scss']
})
export class OrderDeliveryNoteRefundComponent implements OnInit {

  @Input() data: any;
  
  constructor() {}
  
  ngOnInit() { }

}
