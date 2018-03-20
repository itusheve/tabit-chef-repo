import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { OrderType } from '../../../../tabit/model/OrderType.model';

@Component({
  selector: 'app-operational-errors-table',
  templateUrl: './day-operational-errors-table.component.html',
  styleUrls: ['./day-operational-errors-table.component.scss']
})
export class DayOperationalErrorsTableComponent implements OnChanges {
  
  @Input() operationalErrorsData: {
    orderType: OrderType;
    waiter: string;
    orderNumber: number;
    tableId: string;
    item: string;
    subType: string;
    reasonId: string;
    operational: number;
  }[];

  totalValue: number;

  show = true;
  loading = true;

  constructor() {}

  ngOnChanges(o: SimpleChanges) {
    if (o.operationalErrorsData && o.operationalErrorsData.currentValue) {

      this.totalValue = this.operationalErrorsData.reduce((acc, curr)=>(acc+curr.operational), 0);

      this.loading = false;
    }
  }
}