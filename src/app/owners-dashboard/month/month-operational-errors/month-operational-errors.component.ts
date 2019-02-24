import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import * as moment from 'moment';

@Component({
  selector: 'app-month-operational-errors',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-operational-errors.component.scss']
})
export class MonthOperationalErrorsComponent extends AbstractTableComponent implements OnInit, OnChanges {

  constructor(private dataService: DataWareHouseService) {
    super();
    this.columns = [
      {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
      {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
      {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
    ];
    /*this.columns = [
      {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
      {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
      {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
    ];*/
    this.title = {en: 'operationalErrorsByServer', translated: 'month.operationalErrorsByServer'};
  }

  async ngOnInit() {
    let dateStart = moment('2019-01-01').format('YYYYMMDD');
    let dateEnd = moment('2019-02-01').format('YYYYMMDD');

    let result = await this.dataService.getReductionByReason(dateStart, dateEnd);
    this.data = result.compensation;
    /*this.data = result.compensationReturns;*/

    this.summary = {total: result.compensation[0].amountIncludeVat,connect
          :'day.actionsWorth', actions: result.compensation[0].qty};
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
