import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import { OrderType } from '../../../../tabit/model/OrderType.model';

@Component({
  selector: 'app-retention-table',
  templateUrl: './day-retention-table.component.html',
  styleUrls: ['./day-retention-table.component.scss']
})
export class DayRetentionTableComponent implements OnChanges {
  
  @Input() retentionData: {
    orderType: OrderType;
    source: string;
    waiter: string;
    orderNumber: number;
    tableId: string;
    item: string;
    subType: string;
    reasonId: string;
    reasons: string;
    retention: number;
  }[];
  @Input() lastViewed: number;//last viewed order number

  @Output() onOrderClicked = new EventEmitter();

  totalValue: number;

  show = true;
  loading = true;

  constructor() {}

  ngOnChanges(o: SimpleChanges) {
    if (o.retentionData && o.retentionData.currentValue) {

      this.totalValue = this.retentionData.reduce((acc, curr)=>(acc+curr.retention), 0);

      this.loading = false;
    }
  }

  orderClicked(orderNumber: number) {
    this.onOrderClicked.emit(orderNumber);
  }
}
