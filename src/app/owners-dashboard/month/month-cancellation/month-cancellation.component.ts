import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {AbstractTableComponent} from '../../../ui/abstract-table/abstract-table.component';
import {MatDialog} from '@angular/material';
import * as moment from 'moment';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';
import {DataService} from '../../../../tabit/data/data.service';

@Component({
    selector: 'app-month-cancellation',
    templateUrl: '../../../ui/abstract-table/abstract-table.component.html',
    styleUrls: ['./month-cancellation.component.scss', '../../../ui/abstract-table/abstract-table.component.scss']
})
export class MonthCancellationComponent extends AbstractTableComponent implements OnInit, OnChanges {

    columns_primary = [
        {en: 'Waiter', dataKey: 'fullName', translated: 'month.server', width: '40%'},
        {en: 'Quantity', dataType: 'number', dataKey: 'qty', translated: 'month.quantity', width: '30%'},
        {en: 'Amount', dataKey: 'amountIncludeVat', dataType: 'currency', translated: 'month.amount', width: '30%'}
    ];


    constructor(dialog: MatDialog, dataWareHouseService: DataWareHouseService, dataService:DataService) {
        super(dialog, dataWareHouseService, dataService);
        this.columns = {primary: this.columns_primary, alt: []};
        this.title = {en: 'cancellations', translated: 'cancellations'};
    }

    ngOnInit() {
        super.ngOnInit();
        this.options = {primary: 'details.date', alt: 'day.reason'};

    }

    sortData(option){
        this.data[option].sort((a, b) => b['qty'] - a['qty']);
    }


    setDataForDialog(row, date) {
        const options = {
            start: moment(date).startOf('month').format('YYYYMMDD'),
            end: moment(date).endOf('month').format('YYYYMMDD')
        };

        return {
            reason: row.reasonName,
            firedBy: row.firedBy,
            fullName: row.fullName,
            title: this.title.translated,
            itemName: row[this.columns[this.selectedOption][0].dataKey],
            reasonName: row.filters.reasonName,
            quantity: row.qty,
            isWaiter: this.selectedOption === 'primary',
            amount: row.amountIncludeVat,
            itemsPromise: this.dataWareHouseService.getReductionByFiredDialog({filters: row.filters})
        };
    }



    ngOnChanges(changes: SimpleChanges): void {
    }

    protected getType(): string {
        return 'cancellation';
    }


}
