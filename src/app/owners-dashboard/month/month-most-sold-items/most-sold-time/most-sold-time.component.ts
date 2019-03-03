import { Component, OnInit } from '@angular/core';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';

@Component({
  selector: 'app-most-sold-time',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./most-sold-time.component.scss']
})
export class MostSoldTimeComponent extends AbstractTableComponent implements OnInit {

  columns = {
    primary: [
      {en: 'Department', dataKey: 'departmentName', translated: 'day.department'},
      {en: 'Item', dataKey: 'itemName', translated: 'day.item'}, // פריט
      {en: 'Sales', dataKey: 'salesAmountIncludeVat', translated: 'month.sales'},
      {en: 'Sold', dataKey: 'sold', translated: 'day.sold'}

    ],
    alt:[]
  };


  constructor() {
    super();

  }

  ngOnInit() {
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

}
