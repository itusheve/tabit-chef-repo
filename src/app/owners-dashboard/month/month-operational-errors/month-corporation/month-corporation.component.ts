import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';

@Component({
  selector: 'app-month-corporation',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-corporation.component.scss']
})
export class MonthCorporationComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}

  ];

  columns_alternative = [
    {en : 'Waiter' , dataKey:'fullName',translated:'month.server'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat',translated:'month.amount'}
  ];


  constructor(private dataService: DataWareHouseService) {
    super();

    this.columns = {primary: this.columns_primary,alt: this.columns_alternative};

    this.title = {en: 'corporation', translated: 'month.corporation'};

  }

   ngOnInit() {
    super.ngOnInit();
    this.options = {primary:'day.reason',alt:'month.server'};
  }

 /* changeData(dataOption: DataOption) {
    super.changeData(dataOption);
    this.columns = this.currentDataOption === DataOption.PRIMARY ? this.columns_primary : this.columns_alternative;
  }*/


  getCssColorClass(): String {
    return '';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
