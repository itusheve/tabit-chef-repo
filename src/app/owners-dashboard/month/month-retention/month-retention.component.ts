import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';

@Component({
  selector: 'app-month-retention',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-retention.component.scss']
})
export class MonthRetentionComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'reasonName', dataKey: 'reasonName', translated: 'day.reason'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', translated: 'month.amount'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', translated: 'month.amount'}
  ];

  constructor(private dataService: DataWareHouseService) {
    super();
    this.columns = {primary:this.columns_primary,alt:this.columns_alternative};
    this.title = {en: 'retention', translated: 'month.retention'};
  }


  async ngOnInit() {
      super.ngOnInit();
    this.options = {primary: 'day.reason', alt: 'month.server'};
  }

  createTitle(): String {

    return '';

  }


  getCssColorClass(): String {
    const elements = document.getElementsByClassName('card-retention');
    const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
    return color;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
