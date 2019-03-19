import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-week-retention',
  templateUrl:  '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./week-retention.component.scss']
})
export class WeekRetentionComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'reasonName', dataKey: 'reasonName', translated: 'day.reason'},
    {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'week.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'week.amount'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
    {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'week.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'week.amount'}
  ];

  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService) {
    super(dialog,dataWareHouseService);

    this.columns = {primary:this.columns_primary,alt:this.columns_alternative};
    this.title = {en: 'retention', translated: 'month.retention'};
  }

  ngOnInit() {
    super.ngOnInit();
    this.options = {primary: 'day.reason', alt: 'week.server'};
  }

  getCssColorClass(): String {
    const elements = document.getElementsByClassName('card-retention');
    const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
    return color;
  }

  protected getType(): string {
    return 'retention';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
