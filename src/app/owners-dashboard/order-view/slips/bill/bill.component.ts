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
  
  constructor() {}
  
  ngOnInit() { }

}
