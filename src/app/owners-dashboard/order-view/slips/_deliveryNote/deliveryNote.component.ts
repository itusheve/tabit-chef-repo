import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss']
})
export class OrderClubComponent implements OnInit {

  @Input() order: Order;
  @Input() orderOld: any;
  @Input() printDataOld: any;
  
  constructor() {}
  
  ngOnInit() { }

}
