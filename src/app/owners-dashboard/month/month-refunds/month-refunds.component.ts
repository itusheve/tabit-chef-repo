import {Component, Input, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import {DataWareHouseEpService} from '../../../services/end-points/data-ware-house-ep.service';
import {TabitHelper} from '../../../../tabit/helpers/tabit.helper';


@Component({
    selector: 'app-month-refunds',
    templateUrl: './month-refunds.component.html',
    styleUrls: ['./month-refunds.component.scss'],
    providers: [DatePipe]
})
export class MonthRefundsComponent implements OnInit {

    @Input() category: string;

    private dataType = 'refund';
    private period = 'monthly';
    private date;
    private groupBy = 'ownerId';
    private nameFieldForGroupBy = 'ownerName';
    private entries: Array<any>;
    private groupedEntries = [];
    private tabitHelper: any;
    public  monthFromDatabase: any;

    constructor(private dataWarehouse: DataWareHouseEpService) {

        this.date = moment();
        this.tabitHelper = new TabitHelper();
    }

    ngOnInit() {
        this.fetchEntries();
    }

    async fetchEntries() {
        this.entries = await this.dataWarehouse.get(`report/${this.dataType}`, {
            fromBusinessDate: this.date.format('YYYYMMDD'),
            toBusinessDate: this._getToBusinessDate().format('YYYYMMDD')
        });

        this.refresh();
    }

    _getToBusinessDate() {
        switch(this.period) {
            case 'monthly': return this.date.clone().endOf('month');
        }
    }

    refresh() {
        this.groupedEntries = _.values(_.groupBy(this.entries, this.groupBy)).map(entries => {
            return {
                name: entries[0][this.nameFieldForGroupBy],
                count: entries.length,
                sum: _.sumBy(entries, 'amount')
            };
        });

        console.log(this.groupedEntries);
    }
   /*getMonthCssColorClass() {
        if(this.monthFromDatabase && this.monthFromDatabase.employeesPrc) {
            return this.tabitHelper.getColorClassByPercentage(this.monthFromDatabase.employeesPrc.toFixed(1)
                / this.monthFromDatabase.avgNweeksEmployeesPrc.toFixed(1) * 100, false );
        }
        return 'bg-secondary';
   }*/
}
