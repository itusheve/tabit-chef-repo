import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import {DataWareHouseService} from '../../../services/data-ware-house.service';


@Component({
  selector: 'app-week-waste',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./week-waste.component.scss']
})
export class WeekWasteComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'Date', dataKey: 'businessDateCaption', translated: 'details.date'},
    {en: 'Quantity',  dataType: 'number', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
    {en: 'Quantity',  dataType: 'number', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
  ];

  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService){
    super(dialog,dataWareHouseService);
    this.columns = {primary:this.columns_primary,alt:this.columns_alternative};
    this.title = {en:'Waste',translated:'month.waste'};
  }

  ngOnInit() {
    super.ngOnInit();
    this.options = {primary: 'details.date', alt: 'month.server'};
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  protected getType(): string {
    return 'wasteEod';
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

  protected sortData(option){
    if (option === 'alt') {
      this.data[option].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']);
    }
    else {
      this.data[option].sort((a, b) => a['businessDateCaption'].localeCompare(b['businessDateCaption']));
    }

  }

}
