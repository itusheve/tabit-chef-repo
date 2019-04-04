import { Component, OnInit } from '@angular/core';
import {AbstractTableComponent} from '../../../../ui/abstract-table/abstract-table.component';
import {DataWareHouseService} from '../../../../services/data-ware-house.service';
import {MatDialog} from '@angular/material';
import {DataService} from '../../../../../tabit/data/data.service';

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




  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService, dataService:DataService){
    super(dialog ,dataWareHouseService, dataService);

  }

  ngOnInit() {
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
