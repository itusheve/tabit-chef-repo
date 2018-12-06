import {Component, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';

@Component({
    selector: 'app-retention-table',
    templateUrl: './day-retention-table.component.html',
    styleUrls: ['./day-retention-table.component.scss']
})
export class DayRetentionTableComponent implements OnChanges {

    @Input() retentionData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        reasons: string;
        retention: number;
    }[];
    @Input() lastViewed: number;
    @Input() category: string;
    @Input() dayFromDatabase: any;

    @Output() onOrderClicked = new EventEmitter();

    totalValue: number;

    show = true;
    loading = true;

    public sortBy: string;//waiter, orderNumber, tableId, item, subType, reasonId, retention
    public sortDir = 'desc';//asc | desc
    public tabitHelper: any;

    constructor() {
        this.tabitHelper = new TabitHelper();
    }

    ngOnChanges(o: SimpleChanges) {
        if (o.retentionData && o.retentionData.currentValue) {
            this.totalValue = this.retentionData.reduce((acc, curr) => (acc + curr.retention), 0);

            // we wish sorting to occur automatically only on component init, not on further changes:
            if (!this.sortBy) {
                this.sort('retention');
            }

            this.loading = false;
        }
    }

    orderClicked(orderNumber: number) {
        this.onOrderClicked.emit(orderNumber);
    }

    sort(by: string) {
        const that = this;
        if (this.sortBy && this.sortBy === by) {
            this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
        } else {
            if (by === 'retention') {
                this.sortDir = 'desc';
            } else {
                this.sortDir = 'asc';
            }
            this.sortBy = by;
        }
        let dir = this.sortDir === 'asc' ? -1 : 1;
        this.retentionData
            .sort((a, b) => (a[that.sortBy] < b[that.sortBy] ? dir : dir * -1));
    }

    getCssColorClass() {
        if(this.dayFromDatabase && this.dayFromDatabase.mrPrc) {
            return this.tabitHelper.getColorClassByPercentage(this.dayFromDatabase.mrPrc.toFixed(1) / this.dayFromDatabase.avgNweeksMrPrc.toFixed(1) * 100, false);
        }

        return 'bg-secondary';
    }

}
