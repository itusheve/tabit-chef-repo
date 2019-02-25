import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../../services/data-ware-house.service';
import {AbstractTableComponent, DataOption} from '../../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';

@Component({
  selector: 'app-month-corporation-return',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-corporation-return.component.scss']
})
export class MonthCorporationReturnComponent extends AbstractTableComponent implements OnInit, OnChanges {


  columns_primary = [
    {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}

  ];

  columns_alternative = [
    {en : 'Waiter' , dataKey:'waiterName',translated:'month.server'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
  ];





  constructor(private dataService: DataWareHouseService) {
    super();

    this.columns = this.columns_primary;

    this.title = {en: 'corporationReturn', translated: 'month.corporationRefund'}; // check the exac data
  }

  async ngOnInit() {
    let dateStart = moment('2019-01-01').format('YYYYMMDD');
    let dateEnd = moment('2019-02-01').format('YYYYMMDD');

    let result = await this.dataService.getReductionByReason(dateStart, dateEnd);
    this.data = result.corporationReturn;
    this.summary = {total: result.retention[0].amountIncludeVat,connect
          :'day.actionsWorth', actions: result.corporationReturn[0].qty};
    this.options = {opt1:'day.reason',opt2:'month.server'};


  }

  changeData(dataOption: DataOption) {
    super.changeData(dataOption);
    this.columns = dataOption === DataOption.PRIMARY ? this.columns_primary : this.columns_alternative;
  }

  getCssColorClass(): String {
    return 'bg-primary';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
