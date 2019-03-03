import { Component, OnInit } from '@angular/core';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';

@Component({
  selector: 'app-forecast-dialog-item',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./forecast-dialog-item.component.scss']
})
export class ForecastDialogItemComponent extends AbstractTableComponent implements OnInit {

  columns_primary = [
    {en: 'item', dataKey: 'item', translated: 'day.item'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
  ];

  columns_alternative = [
    {en: 'item', dataKey: 'item', translated: 'day.item'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
  ];

  constructor() {
    super();

    this.columns = {primary:this.columns_primary,alt:this.columns_alternative};

  }

  ngOnInit() {
    super.ngOnInit();
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

}
