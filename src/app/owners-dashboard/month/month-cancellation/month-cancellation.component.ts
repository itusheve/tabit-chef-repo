import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';

@Component({
  selector: 'app-month-cancellation',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-cancellation.component.scss','../../../ui/abstract-table/abstract-table.component.scss']
})
export class MonthCancellationComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_opt1 = [
    {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
  ];

 /* columns_opt2 = [
    {en : 'Waiter' , dataKey:'waiterName',translated:'slips.server'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
  ];*/

  constructor(private dataService: DataWareHouseService) {
    super();
    this.columns = this.columns_opt1;
    this.title = {en:'Cancellation',translated:'month.cancellations'};
  }

  async ngOnInit() {
    let dateStart = moment('2019-01-01').format('YYYYMMDD');
    let dateEnd = moment('2019-02-01').format('YYYYMMDD');

    let result = await this.dataService.getReductionByReason(dateStart, dateEnd);
    console.log(result);
    this.data = result.cancellation;
    this.summary = {total: result.cancellation[0].amountIncludeVat,connect
    :'day.actionsWorth', action: result.cancellation[0].qty};
    this.options = {opt1:'details.date',opt2:'day.reason'};

  }

  createTitle(): String {

    return '';

  }

  getCssColorClass(): String {
    return 'bg-primary';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
