import { Component, Input, OnChanges } from '@angular/core';
import { OrderType } from '../../../../tabit/model/OrderType.model';

@Component({
  selector: 'app-day-sales-table',
  templateUrl: './day-sales-table.component.html',
  styleUrls: ['./day-sales-table.component.scss']
})
export class DaySalesTableComponent implements OnChanges {
  @Input() title: string;
  @Input() totalSales: number;
  @Input() byOrderType: Map<OrderType, {
    sales: number,
    dinersOrOrders: number,
    average: number
  }>;

  show = false;

  getKeys(map) {
    return Array.from(map.keys());
  }

  constructor( ) {}

  ngOnChanges(o) {
    if (o.byOrderType) {
      this.show = true;
    }
  }
}
