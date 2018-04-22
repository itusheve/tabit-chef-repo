import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OrderType } from '../../../../tabit/model/OrderType.model';

@Component({
  selector: 'app-day-sales-table',
  templateUrl: './day-sales-table.component.html',
  styleUrls: ['./day-sales-table.component.scss']
})
export class DaySalesTableComponent implements OnChanges {
  loading = true;
  noData = false;
  @Input() totalSales: number;
  @Input() byOrderType: Map<OrderType, {
    sales: number,
    dinersOrOrders: number,
    average: number
  }>;

  getKeys(map) {
    return Array.from(map.keys());
  }

  constructor( ) {}

  ngOnChanges(o: SimpleChanges) {
    this.loading = true;
    this.noData = false;

    if ((o.byOrderType && o.byOrderType.currentValue !== null) || (o.totalSales && o.totalSales.currentValue !== null)) {
      if (this.totalSales===0) {
        this.noData = true;
      }

      this.loading = false;
    }
  }
}
