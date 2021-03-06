import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import {DataService} from '../../../../../tabit/data/data.service';

@Component({
  selector: 'app-month-corporation',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-corporation.component.scss']
})
export class MonthCorporationComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason', width: '40%'},
    {en : 'Quantity' , dataType: 'number', dataKey:'qty',translated:'month.quantity', width: '30%'},
    {en : 'Amount' , dataKey:'amountIncludeVat', dataType: 'currency',translated:'month.amount', width: '30%'}

  ];

  columns_alternative = [
    {en : 'Waiter' , dataKey:'fullName',translated:'month.server', width: '40%'},
    {en : 'Quantity' , dataType: 'number', dataKey:'qty',translated:'month.quantity', width: '30%'},
    {en : 'Amount' , dataKey:'amountIncludeVat', dataType: 'currency',translated:'month.amount', width: '30%'}
  ];


  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService, dataService:DataService){
    super(dialog,dataWareHouseService, dataService);

    this.columns = {primary: this.columns_primary,alt: this.columns_alternative};

    this.title = {en: 'Corporation', translated: 'month.corporation'};



  }

   ngOnInit() {
    super.ngOnInit();
    this.options = {primary:'day.reason',alt:'month.server'};
     this.sortData('primary');
     this.sortData('alt');
   }

  sortData(option){
    this.data[option].sort((a, b) => b['qty'] - a['qty']);
  }



  getCssColorClass(): String {
    return '';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  protected getType(): string {
    return 'compensation';
  }

}
