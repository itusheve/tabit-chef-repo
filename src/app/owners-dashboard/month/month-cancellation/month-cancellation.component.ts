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

  columns_primary = [
    {en : 'Waiter' , dataKey:'fullName',translated:'month.server'},
    {en : 'Quantity' , dataKey:'qty',translated:'month.quantity'},
    {en : 'Amount' , dataKey:'amountIncludeVat', dataType: 'currency',translated:'month.amount'}
  ];


  constructor(private dataService: DataWareHouseService) {
    super();
    this.columns = {primary:this.columns_primary,alt:[]};
    this.title = {en:'Cancellation',translated:'month.cancellations'};
  }

   ngOnInit() {
    super.ngOnInit();
    this.options = {primary:'details.date',alt:'day.reason'};


  }

  createTitle(): String {

    return '';
  }


  getCssColorClass() {
    const elements = document.getElementsByClassName('card-cancellation');
    const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
    return color;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
