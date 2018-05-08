import { Component, OnInit, Input } from '@angular/core';

// import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-invoice-credit',
  templateUrl: './invoiceCredit.component.html',
  styleUrls: ['./invoiceCredit.component.scss']
})
export class OrderInvoiceCreditComponent implements OnInit {

  @Input() data: any;
  @Input() printDataOld: any;
  @Input() invoice: any;
  @Input() orderOld: any;

  constructor() { }

  ngOnInit() {

  }

}
