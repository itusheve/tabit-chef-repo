import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import * as moment from 'moment';

@Component({
  selector: 'app-week-cancellation',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./week-cancellation.component.scss']
})
export class WeekCancellationComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'week.server'},
    {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'week.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'week.amount'}
  ];

  constructor(dialog: MatDialog, dataWareHouseService: DataWareHouseService) {
    super(dialog, dataWareHouseService);
    this.columns = {primary: this.columns_primary, alt: []};
    this.title = {en: 'cancellations', translated: 'cancellations'};
  }

  ngOnInit() {
    super.ngOnInit();
    this.options = {primary: 'details.date', alt: 'day.reason'};
  }

  setDataForDialog(row, date) {

    return {
      reason: row.reasonName,
      firedBy: row.firedBy,
      fullName: row.fullName,
      title: this.title.translated,
      itemName: row[this.columns[this.selectedOption][0].dataKey],
      reasonName: row.filters.reasonName,
      quantity: row.qty,
      isWaiter: this.selectedOption === 'primary',
      amount: row.amountIncludeVat,
      itemsPromise: this.dataWareHouseService.getReductionByFiredDialog({filters: row.filters})
    };
  }


  getCssColorClass() {
    const elements = document.getElementsByClassName('card-cancellation');
    const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
    return color;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  protected getType(): string {
    return 'cancellation';
  }

}
