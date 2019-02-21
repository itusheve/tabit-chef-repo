import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';


@Component({
  selector: 'app-month-organizational',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-organizational.component.scss']
})
export class MonthOrganizationalComponent extends AbstractTableComponent implements OnInit, OnChanges {

  constructor(private dataService: DataWareHouseService) {
    super();
    this.columns = [
      {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
      {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
      {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
    ];
    this.title = {en: 'organizational', translated: 'day.organizational'};
  }

  async ngOnInit() {
    let dateStart = moment('2019-01-01').format('YYYYMMDD');
    let dateEnd = moment('2019-02-01').format('YYYYMMDD');

    let result = await this.dataService.getReductionByReason(dateStart, dateEnd);
    this.data = result.organizational;
    this.summary = {total: result.organizational[0].amountIncludeVat,connect
          :'day.actionsWorth', actions: result.organizational[0].qty};
          this.options = {opt1:'details.date',opt2:'day.reason'};
  }

  createTitle(): String {

    return "";

  }

  getCssColorClass(): String {
    return 'bg-primary';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
