import { Component, OnInit, Input } from '@angular/core';

import { Order } from '../../../../../tabit/model/Order.model';

@Component({
  selector: 'app-order-delivery-note',
  templateUrl: './deliveryNote.component.html',
  styleUrls: ['./deliveryNote.component.scss']
})
export class OrderDeliveryNoteComponent implements OnInit {

  @Input() data: any;
  @Input() printDataOld: any;

  constructor() { }

  ngOnInit() {
    console.log(this.data);
    console.log(this.printDataOld);
  }

}
