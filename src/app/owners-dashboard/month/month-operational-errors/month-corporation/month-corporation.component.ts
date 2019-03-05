import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';
import * as moment from 'moment';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-month-corporation',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-corporation.component.scss']
})
export class MonthCorporationComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en : 'reasonName' , dataKey:'reasonName',translated:'day.reason'},
    {en : 'Quantity' , dataType: 'number', dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat', dataType: 'currency',translated:'month.amount'}

  ];

  columns_alternative = [
    {en : 'Waiter' , dataKey:'fullName',translated:'month.server'},
    {en : 'Quantity' , dataType: 'number', dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat', dataType: 'currency',translated:'month.amount'}
  ];


  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService){
    super(dialog,dataWareHouseService);

    this.columns = {primary: this.columns_primary,alt: this.columns_alternative};

    this.title = {en: 'corporation', translated: 'month.corporation'};



  }

   ngOnInit() {
    super.ngOnInit();
    this.options = {primary:'day.reason',alt:'month.server'};
     this.sort('amountIncludeVat');
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
