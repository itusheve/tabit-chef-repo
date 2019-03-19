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

  public percent: any = [];

  columns = {
    primary: [
      {en: 'Department', dataKey: 'departmentName', translated: 'day.department'},
      {en: 'Item', dataType: 'item', dataKey: 'itemName', translated: 'day.item'},
      {en: 'Prepared', dataType: 'number', dataKey: 'prepared', translated: 'month.prepared'},
      {en: 'Returned', dataKey: 'return', additionalDataKey:'prc', dataType: 'number', translated: 'month.returned'},
      {en: 'OperationalReductionsValue',  dataKey: 'returnAmount',  dataType: 'currency', translated: 'month.operationalReductionsValue'}

    ],
    alt:[]
  };

  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService){
    super(dialog ,dataWareHouseService);

  }

  ngOnInit() {
    /*this.percent = this.date['prc'];
    console.log(this.percent);*/
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

  showReportDialog(row) {
    return false;
  }

  protected getType(): string {
    return 'mostReturnLeastItems';
  }

}
