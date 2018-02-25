import { Component, OnInit, Input } from '@angular/core';

// import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-invoice-cash',
  templateUrl: './invoiceCash.component.html',
  styleUrls: ['./invoiceCash.component.scss']
})
export class OrderInvoiceCashComponent implements OnInit {

  @Input() data: any;
  
  constructor() {}
  
  ngOnInit() { 
  }

}
