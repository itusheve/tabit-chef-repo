import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';


@Component({
  selector: 'app-day-refund',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./day-refund.component.scss']
})
export class DayRefundComponent extends AbstractTableComponent implements OnInit, OnChanges {

  @Input()

  columns_primary = [
    {en: 'Waiter', dataKey: 'approveByName', dataType: 'item', translated: 'month.server'},
    {en: 'OrderNumber', dataType: 'number', dataKey: 'orderNumber', translated: 'month.order'},
    {en: 'Amount', dataKey: 'amount', dataType: 'currency', translated: 'month.amount'},
    {en: 'Payments', dataType:'item' ,dataKey: 'paymentsName',  translated: 'month.payments'}
  ];

  constructor(dialog: MatDialog, dataWareHouseService: DataWareHouseService) {
    super(dialog, dataWareHouseService);
    this.columns = {primary: this.columns_primary, alt: []};
    this.title = {en: 'refund', translated: 'refund'};
  }

  ngOnInit() {
    super.ngOnInit();
    this.options = {primary: 'details.date', alt: 'day.reason'};
  }

  showReportDialog(row) {
    return false;
  }

  protected getSummary() {
    let total = 0;
    this.data.primary.forEach(e =>total += e.amount);
    return {
      total: total,
      actions: this.data.primary.length,
      connect: 'day.actionsWorth',
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  getCssColorClass(): String {
    return 'bg-white';
  }


  protected getType(): string {
    return 'refund';
  }

  protected  sortData(option) {

  }
}
