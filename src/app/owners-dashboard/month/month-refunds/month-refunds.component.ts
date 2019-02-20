import {Component, Input, OnInit} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';
import {DatePipe} from '@angular/common';
import {OwnersDashboardService} from '../../owners-dashboard.service';
import {DuplicateFunctionService} from '../../../services/duplicate-function-service/duplicate-function.service';
import {environment} from '../../../../environments/environment.dev-il';
import * as moment from 'moment';
import {Period} from '../../aggregator/aggregator.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-month-refunds',
    templateUrl: './month-refunds.component.html',
    styleUrls: ['./month-refunds.component.scss'],
    providers: [DatePipe]
})
export class MonthRefundsComponent implements OnInit {

    @Input() category: string;

    private dataType = 'refunds';
    private period = 'monthly';
    private date;
    private groupBy = 'waiter';
    private entries: Array<any>;
    private groupedEntries = [];

    constructor(private dataWareHouseService: DataWareHouseService,
                private duplicateFunctionService: DuplicateFunctionService,
                private ownersDashboardService: OwnersDashboardService,
                private dataService: DataService,
                private monthService: DataWareHouseService) {

        this.date = moment();
        this.fetchEntries();
    }

    ngOnInit() {
       // this.duplicateFunctionService.getCssColorClass();
    }

    async fetchEntries() {
        this.entries = await this.dataWareHouseService.getRefund(`report/${this.dataType}`, {
            fromBusinessDate: this.date,
            toBusinessDate: this._getToBusinessDate()
        });

        this.refresh();
    }

    _getToBusinessDate() {
        switch(this.period) {
            case 'monthly': return this.date().clone().endOf('month');
        }
    }

    refresh() {
        console.log(this.entries);
    }
}
