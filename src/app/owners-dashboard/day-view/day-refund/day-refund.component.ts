import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-day-refund',
  templateUrl: './day-refund.component.html',
  styleUrls: ['./day-refund.component.scss', '../../../ui/abstract-table/abstract-table.component.scss']
})
export class DayRefundComponent implements OnInit, OnChanges{

  @Input()
  data: any = [];

  @Output() onOrderClicked = new EventEmitter();

  columns = [
    {en: 'Date', dataKey: 'opened', translated: 'details.date'},
    {en: 'Waiter', dataKey: 'approveByName', dataType: 'item', translated: 'month.server'},
    {en: 'OrderNumber', dataType: 'number', dataKey: 'orderNumber', translated: 'month.order'},
    {en: 'Amount', dataKey: 'amount', dataType: 'currency', translated: 'month.amount'},
    {en: 'Payments', dataType:'item' ,dataKey: 'paymentsName',  translated: 'month.payments'}
  ];

  title = {en: 'refund', translated: 'refund'};
  private service: DataWareHouseService;
  public summary: { total: number; actions: any; connect: string };


  constructor(dialog: MatDialog, dataWareHouseService: DataWareHouseService) {
    this.service = dataWareHouseService;
  }


  OrderClicked(order){
    this.onOrderClicked.emit(order);
  }

  ngOnInit() {
    this.summary = this.getSummary();
    this.data.sort((e1,e2)=>e1.opened.localeCompare(e2.opened));

  }

  showReportDialog(row) {
    return false;
  }

  protected getSummary() {
    let total = 0;
    this.data.forEach(e =>total += e.amount);
    return {
      total: total,
      actions: this.data.length,
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
