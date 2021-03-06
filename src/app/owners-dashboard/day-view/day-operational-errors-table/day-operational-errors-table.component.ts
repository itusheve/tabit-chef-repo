import {Component, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';

@Component({
    selector: 'app-operational-errors-table',
    templateUrl: './day-operational-errors-table.component.html',
    styleUrls: ['./day-operational-errors-table.component.scss']
})
export class DayOperationalErrorsTableComponent implements OnChanges {

    @Input() operationalErrorsData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        operational: number;
    }[];
    @Input() lastViewed: number;//last viewed order number
    @Input() category: string;
    @Input() dayFromDatabase: any;

    @Output() onOrderClicked = new EventEmitter();

    totalValue: number;

    show = true;
    loading = true;

    public sortBy: string;//waiter, orderNumber, tableId, item, subType, reasonId, operational
    public sortDir = 'desc';//asc | desc
    public tabitHelper: any;

    constructor() {
        this.tabitHelper = new TabitHelper();
    }

    ngOnChanges(o: SimpleChanges) {
        if (o.operationalErrorsData && o.operationalErrorsData.currentValue) {
            this.totalValue = this.operationalErrorsData.reduce((acc, curr) => (acc + curr.operational), 0);

            // we wish sorting to occur automatically only on component init, not on further changes:
            if (!this.sortBy) {
                this.sort('operational');
            }

            this.loading = false;
        }
    }

    orderClicked(orderNumber: number) {
        this.onOrderClicked.emit(orderNumber);
    }

                                // duplicate function - put it on day-function.service
    sort(by: string) {
        if (this.sortBy && this.sortBy === by) {
            this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
        } else {
            if (by === 'operational') {
                this.sortDir = 'desc';
            } else {
                this.sortDir = 'asc';
            }
            this.sortBy = by;
        }
        let dir = this.sortDir === 'asc' ? -1 : 1;
        this.operationalErrorsData
            .sort((a, b) => (a[this.sortBy] < b[this.sortBy] ? dir : dir * -1));
    }

    getCssColorClass() {
        if(this.dayFromDatabase && this.dayFromDatabase.operationalPrc) {
            return this.tabitHelper.getColorClassByPercentage(this.dayFromDatabase.operationalPrc.toFixed(1) / this.dayFromDatabase.avgNweeksOperationalPrc.toFixed(1) * 100, false);
        }

        return 'bg-secondary';
    }
}
