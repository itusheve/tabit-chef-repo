import { Component, OnInit } from '@angular/core';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';
import {DataWareHouseService} from '../../../../services/data-ware-house.service';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-most-returned-time',
  templateUrl: '../../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./most-returned-time.component.scss']
})
export class MostReturnedTimeComponent extends AbstractTableComponent implements OnInit {

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
    super(dialog ,dataWareHouseService);

  }

  getCssColorClass(): String {
    return 'bg-white';
  }

  showReportDialog(row) {
    return false;
  }

  protected getType(): string {
    return 'mostSoldLeastItems';
  }


}
