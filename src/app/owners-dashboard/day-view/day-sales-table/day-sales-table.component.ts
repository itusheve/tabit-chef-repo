import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OrderType } from '../../../../tabit/model/OrderType.model';
import { Orders_KPIs } from '../../../../tabit/data/ep/olap.ep';

@Component({
  selector: 'app-day-sales-table',
  templateUrl: './day-sales-table.component.html',
  styleUrls: ['./day-sales-table.component.scss']
})
export class DaySalesTableComponent implements OnChanges {
  loading = true;
  noData = false;
  @Input() title: string;
  @Input() data;

  totals;

  constructor() { }

  ngOnChanges(o: SimpleChanges) {
    this.loading = true;
    this.noData = false;

    if (this.data) {

      this.data.forEach(element => {
        element.ordersKpis.dinersOrdersCount = element.orderType.id==='seated' ? element.ordersKpis.dinersCount : element.ordersKpis.ordersCount;
      });

      this.totals = {
        netSalesAmnt: 0,
        taxAmnt: 0,
        grossSalesAmnt: 0,
        tipAmnt: 0,
        serviceChargeAmnt: 0,
        paymentsAmnt: 0,
        dinersSales: 0,
        dinersCount: 0,
        ordersCount: 0,
        ppa: undefined,
        dinersOrdersCount: 0
      };

      this.data.forEach(row => {
        this.totals.netSalesAmnt += row.ordersKpis.netSalesAmnt;
        this.totals.taxAmnt += row.ordersKpis.taxAmnt;
        this.totals.grossSalesAmnt += row.ordersKpis.grossSalesAmnt;
        this.totals.tipAmnt += row.ordersKpis.tipAmnt;
        this.totals.serviceChargeAmnt += row.ordersKpis.serviceChargeAmnt;
        this.totals.paymentsAmnt += row.ordersKpis.paymentsAmnt;
        this.totals.dinersSales += row.ordersKpis.dinersSales;
        this.totals.dinersCount += row.ordersKpis.dinersCount;
        this.totals.ordersCount += row.ordersKpis.ordersCount;
        this.totals.dinersOrdersCount += row.ordersKpis.dinersOrdersCount;
      });

      this.totals.ppa = this.totals.netSalesAmnt / this.totals.dinersOrdersCount;

      if (this.totals.netSalesAmnt === 0 && this.totals.paymentsAmnt === 0) {
        this.noData = true;
      }

      this.loading = false;
    }
  }
}
