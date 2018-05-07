import { Component, OnInit, Input } from '@angular/core';

// import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-invoice-giftcard',
  templateUrl: './invoiceGiftcard.component.html',
  styleUrls: ['./invoiceGiftcard.component.scss']
})
export class OrderInvoiceGiftcardComponent implements OnInit {

  @Input() data: any;
  @Input() invoice: any;
  
  constructor() {}
  
  ngOnInit() { 
  }

}
