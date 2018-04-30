import { Component, OnInit, Input } from '@angular/core';

// import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-invoice-check',
  templateUrl: './invoiceCheck.component.html',
  styleUrls: ['./invoiceCheck.component.scss']
})
export class OrderInvoiceCheckComponent implements OnInit {

  @Input() data: any;
  
  constructor() {}
  
  ngOnInit() { 
    
  }

}
