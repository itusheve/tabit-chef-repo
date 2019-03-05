import { Component, OnInit } from '@angular/core';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import {DataWareHouseService} from '../../../../services/data-ware-house.service';

@Component({
  selector: 'app-most-sold-time',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./most-sold-time.component.scss']
})
export class MostSoldTimeComponent extends AbstractTableComponent implements OnInit {

  columns = {
    primary: [
      {en: 'Department', dataKey: 'departmentName', translated: 'day.department'},
      {en: 'Item', dataType: 'item', dataKey: 'itemName', translated: 'day.item'},
      {en: 'Sold', dataType: 'number', dataKey: 'sold', translated: 'day.sold'},
      {en: 'Sales',  dataKey: 'salesAmountIncludeVat',  dataType: 'currency', translated: 'month.sales'}

    ],
    alt:[]
  };




  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService){
    super(dialog,dataWareHouseService);

  }

  ngOnInit() {
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

  protected getType(): string {
    return 'mostSoldLeastItems';
  }


}
