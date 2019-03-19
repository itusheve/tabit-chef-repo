import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-week-promotion',
  templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
  styleUrls: ['./week-promotion.component.scss']
})
export class WeekPromotionComponent extends AbstractTableComponent implements OnInit, OnChanges {

  columns_primary = [
    {en: 'reasonName', dataKey: 'reasonName', translated: 'day.reason'},
    {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'week.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'week.amount'}
  ];

  columns_alternative = [
    {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
    {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'week.quantity'},
    {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'week.amount'}
  ];

  constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService) {
    super(dialog,dataWareHouseService);

    this.columns = {primary: this.columns_primary,alt: this.columns_alternative};

    this.title = {en: 'Promotion', translated: 'month.promotion'};
  }

  ngOnInit() {
    super.ngOnInit();
    this.options = {primary: 'day.reason', alt: 'week.server'};

    this.sortData('primary');
    this.sortData('alt');
  }

  getCssColorClass(): String {
    return 'bg-white';
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  protected getType(): string {
    return 'promotions';
  }


}
