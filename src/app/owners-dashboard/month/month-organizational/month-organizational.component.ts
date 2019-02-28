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

  columns_primary = [
    {en: 'reasonName', dataKey: 'reasonName', translated: 'day.reason'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
  ];

  constructor(private dataService: DataWareHouseService) {
    super();

    this.columns = {primary:this.columns_primary,alt:this.columns_alternative};

    this.title = {en: 'organizational', translated: 'day.organizational'};
  }

   ngOnInit() {

    super.ngOnInit();
     this.options = {primary: 'day.reason', alt: 'month.server'};
  }

  createTitle(): String {

    return '';

  }


  getCssColorClass(): String {
    const elements = document.getElementsByClassName('card-oganizational');
    const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
    return color;
  }


  ngOnChanges(changes: SimpleChanges): void {
  }

}
