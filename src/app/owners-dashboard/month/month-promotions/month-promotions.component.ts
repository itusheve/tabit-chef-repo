import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import {DataWareHouseService} from '../../../services/data-ware-house.service';

@Component({
    selector: 'app-month-promotions',
    templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
    styleUrls: ['./month-promotions.component.scss']
})
export class MonthPromotionsComponent extends AbstractTableComponent implements OnInit, OnChanges {

    columns_primary = [
        {en: 'reasonName', dataKey: 'reasonName', translated: 'day.reason'},
        {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'month.quantity'},
        {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
    ];

    columns_alternative = [
        {en: 'Waiter', dataKey: 'fullName', translated: 'month.server'},
        {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'month.quantity'},
        {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount'}
    ];

    constructor(dialog:MatDialog, dataWareHouseService:DataWareHouseService){
        super(dialog,dataWareHouseService);
        this.columns = {primary: this.columns_primary, alt: this.columns_alternative};
        this.title = {en: 'promotion', translated: 'month.promotion'};

    }


    ngOnInit() {
        super.ngOnInit();
        this.options = {primary: 'day.reason', alt: 'month.server'};
    }


    ngOnChanges(changes: SimpleChanges): void {
    }

    getCssColorClass(): String {
        return 'bg-white';
    }

    protected getType(): string {
        return 'promotion';
    }

}
