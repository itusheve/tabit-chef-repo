import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractTableComponent, DataOption} from '../../../ui/abstract-table/abstract-table.component';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import * as moment from 'moment';

@Component({
  selector: 'app-month-promotions',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-promotions.component.scss']
})
export class MonthPromotionsComponent extends AbstractTableComponent implements OnInit, OnChanges {

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

    this.title = {en: 'promotion', translated: 'month.promotion'};
  }


  async ngOnInit() {
    let dateStart = moment('2019-01-01').format('YYYYMMDD');
    let dateEnd = moment('2019-02-01').format('YYYYMMDD');

    let result = await this.dataService.getReductionByReason(dateStart, dateEnd);
    this.data = result.promotions;
    this.summary = {total: result.promotions[0].amountIncludeVat,connect
          :'day.actionsWorth', actions: result.promotions[0].qty};
          this.options = {opt1:'day.reason',opt2:'month.server'};
  }

  createTitle(): String {

    return '';

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
