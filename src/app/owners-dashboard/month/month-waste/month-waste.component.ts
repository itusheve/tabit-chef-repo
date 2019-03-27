import {Component, OnInit, SimpleChanges,OnChanges} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import {DataWareHouseService} from '../../../services/data-ware-house.service';


@Component({
  selector: 'app-month-waste',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-waste.component.scss']
})
export class MonthWasteComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'Date', dataKey: 'businessDateCaption', translated: 'details.date', width: '40%'},
    {en: 'Quantity',  dataType: 'number', dataKey: 'qty', translated: 'month.quantity', width: '30%'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount', width: '30%'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server', width: '40%'},
    {en: 'Quantity',  dataType: 'number', dataKey: 'qty', translated: 'month.quantity', width: '30%'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount', width: '30%'}
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


  createTitle(): String {

    return '';

  }


  ngOnChanges(changes: SimpleChanges): void {
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

  protected getType(): string {
    return 'wasteEod';
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
