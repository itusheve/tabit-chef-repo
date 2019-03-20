import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import data from 'devextreme/bundles/dx.all';

@Component({
  selector: 'app-month-refunds',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-refunds.component.scss', '../../../ui/abstract-table/abstract-table.component.scss']
})
export class MonthRefundsComponent extends AbstractTableComponent implements OnInit, OnChanges {

  @Input()

  columns_primary = [
    {en: 'Date', dataKey: 'opened', translated: 'details.date'},
    {en: 'Waiter', dataKey: 'approveByName', translated: 'month.server'},
    {en: 'OrderNumber', dataType: 'number', dataKey: 'orderNumber', translated: 'month.order'},
    {en: 'Amount', dataKey: 'amount', dataType: 'currency', translated: 'month.amount'},
    {en: 'Payments', dataKey: 'paymentsName',  translated: 'month.payments'}
  ];



  constructor(dialog: MatDialog, dataWareHouseService: DataWareHouseService) {
    super(dialog, dataWareHouseService);
    this.columns = {primary: this.columns_primary, alt: []};
    this.title = {en: 'refund', translated: 'refund'};



  }

  ngOnInit() {
    super.ngOnInit();
    this.options = {primary: 'details.date', alt: 'day.reason'};
    console.log(this.data);

  }

  showReportDialog(row) {
    return false;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  getCssColorClass() {
    const elements = document.getElementsByClassName('card-cancellation');
    const color = window.getComputedStyle(elements[0], null).getPropertyValue('color');
    return color;
  }

  protected getType(): string {
    return 'refund';
  }

}
