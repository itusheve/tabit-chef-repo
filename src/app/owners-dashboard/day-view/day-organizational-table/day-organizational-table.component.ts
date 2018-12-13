import {Component, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';

import * as moment from 'moment';
import * as _ from 'lodash';
import {OrderType} from '../../../../tabit/model/OrderType.model';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';

@Component({
    selector: 'app-organizational-table',
    templateUrl: './day-organizational-table.component.html',
    styleUrls: ['./day-organizational-table.component.scss']
})
export class DayOrganizationalTableComponent implements OnChanges {

    @Input() organizationalData: {
        orderType: OrderType;
        waiter: string;
        orderNumber: number;
        organizational: number;
        tlogId: string;
        service: string;
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
        if (o.organizationalData && o.organizationalData.currentValue) {
            this.totalValue = this.organizationalData.reduce((acc, curr) => (acc + curr.organizational), 0);

            // we wish sorting to occur automatically only on component init, not on further changes:
            if (!this.sortBy) {
                this.sort('organizational');
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
            if (by === 'organizational') {
                this.sortDir = 'desc';
            } else {
                this.sortDir = 'asc';
            }
            this.sortBy = by;
        }
        let dir = this.sortDir === 'asc' ? -1 : 1;
        this.organizationalData
            .sort((a, b) => (a[that.sortBy] < b[that.sortBy] ? dir : dir * -1));
    }

    getCssColorClass() {
        if(this.dayFromDatabase && this.dayFromDatabase.employeesPrc) {
            return this.tabitHelper.getColorClassByPercentage(this.dayFromDatabase.employeesPrc.toFixed(1) / this.dayFromDatabase.avgNweeksEmployeesPrc.toFixed(1) * 100, false);
        }

        return 'bg-secondary';
    }

}
