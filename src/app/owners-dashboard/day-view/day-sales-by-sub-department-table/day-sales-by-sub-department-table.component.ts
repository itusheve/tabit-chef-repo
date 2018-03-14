import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-day-sales-by-sub-department-table',
  templateUrl: './day-sales-by-sub-department-table.component.html',
  styleUrls: ['./day-sales-by-sub-department-table.component.scss']
})
export class DaySalesBySubDepartmentTableComponent implements OnChanges {
  @Input() salesBySubDepartment: {
    totalSales: number;
    bySubDepartment: {
      subDepartment: String;
      sales: number
    }[]
  };

  data: {
    totalSales: number;
    bySubDepartment: {
      subDepartment: String;
      sales: number;
      pct: number;
    }[]
  };

  show = true;
  loading = true;

  constructor( ) {}

  ngOnChanges(o: SimpleChanges) {
    if (o.salesBySubDepartment.currentValue) {      
      const clone = _.cloneDeep(this.salesBySubDepartment);
      clone.bySubDepartment.forEach(element => {
        element.pct = element.sales / clone.totalSales;
      });

      this.data = clone;

      this.loading = false;
    }
  }
}
