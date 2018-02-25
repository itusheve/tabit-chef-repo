import { Component, OnInit, Input } from '@angular/core';

// import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-invoice-credit',
  templateUrl: './invoiceCredit.component.html',
  styleUrls: ['./invoiceCredit.component.scss']
})
export class OrderInvoiceCreditComponent implements OnInit {
debugger;
  @Input() data: any;
  
  constructor() {}
  
  ngOnInit() { 
  }

}
