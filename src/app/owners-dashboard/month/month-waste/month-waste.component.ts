import {Component, OnInit, SimpleChanges,OnChanges} from '@angular/core';
import { DataWareHouseService } from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';


@Component({
  selector: 'app-month-waste',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./month-waste.component.scss']
})
export class MonthWasteComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'Date', dataKey: 'businessDateCaption', translated: 'details.date'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', translated: 'month.amount'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
    {en: 'Quantity', dataKey: 'qty', translated: 'month.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', translated: 'month.amount'}
  ];


  constructor(){
    super();

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




}
